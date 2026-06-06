const SUPABASE_URL = 'https://wjtxtpnnmwmjguwgmymd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5Z7cq0CgHgRsUJOkinbpBQ_LIejxJnl';

let supabase = null;
let currentUser = null;

function initSupabase() {
  if (window.supabase && !supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    return true;
  }
  return false;
}

function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.remove('open');
}

async function handleRegister() {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const errorEl = document.getElementById('registerError');
  const successEl = document.getElementById('registerSuccess');

  if (errorEl) errorEl.classList.remove('visible');
  if (successEl) successEl.classList.remove('visible');

  if (!email || !password) {
    if (errorEl) { errorEl.textContent = 'Заполните все поля'; errorEl.classList.add('visible'); }
    return;
  }

  if (password.length < 6) {
    if (errorEl) { errorEl.textContent = 'Пароль должен быть минимум 6 символов'; errorEl.classList.add('visible'); }
    return;
  }

  if (!initSupabase()) {
    if (errorEl) { errorEl.textContent = 'Библиотека Supabase не загрузилась. Обнови страницу.'; errorEl.classList.add('visible'); }
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      if (errorEl) { errorEl.textContent = error.message; errorEl.classList.add('visible'); }
      return;
    }

    if (successEl) {
      successEl.textContent = 'Регистрация успешна! Проверьте email для подтверждения.';
      successEl.classList.add('visible');
    }
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Ошибка соединения с сервером'; errorEl.classList.add('visible'); }
  }
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  if (errorEl) errorEl.classList.remove('visible');

  if (!email || !password) {
    if (errorEl) { errorEl.textContent = 'Заполните все поля'; errorEl.classList.add('visible'); }
    return;
  }

  if (!initSupabase()) {
    if (errorEl) { errorEl.textContent = 'Библиотека Supabase не загрузилась. Обнови страницу.'; errorEl.classList.add('visible'); }
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (errorEl) { errorEl.textContent = error.message; errorEl.classList.add('visible'); }
      return;
    }

    currentUser = data.user;
    updateAuthUI();
    window.location.href = 'profile.html';
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Ошибка соединения с сервером'; errorEl.classList.add('visible'); }
  }
}

async function handleLogout() {
  if (supabase) {
    await supabase.auth.signOut();
  }
  currentUser = null;
  updateAuthUI();
  window.location.href = 'index.html';
}

async function updateAuthUI() {
  const authContainer = document.getElementById('authButtons');
  if (!authContainer) return;

  if (currentUser) {
    authContainer.innerHTML = `
      <a href="profile.html" class="user-email">${currentUser.email}</a>
      <button class="btn-outline" onclick="handleLogout()">Выйти</button>
    `;
  } else {
    authContainer.innerHTML = `
      <a href="login.html" class="btn-outline">Войти</a>
      <a href="register.html" class="btn-fill">Регистрация</a>
    `;
  }
}

async function updateProfileUI() {
  if (!currentUser) {
    const notAuth = document.getElementById('profileNotAuth');
    const content = document.getElementById('profileContent');
    if (notAuth) notAuth.style.display = 'block';
    if (content) content.style.display = 'none';
    return;
  }

  const notAuth = document.getElementById('profileNotAuth');
  const content = document.getElementById('profileContent');
  if (notAuth) notAuth.style.display = 'none';
  if (content) content.style.display = 'block';

  const emailEl = document.getElementById('profileEmail');
  if (emailEl) emailEl.textContent = currentUser.email;

  if (!supabase) return;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      if (error.code === '42P01') {
        const el = document.querySelector('.profile-hwid p');
        if (el) { el.textContent = 'Таблица profiles не найдена. Выполни supabase_setup.sql в SQL Editor Supabase.'; el.style.color = '#ef4444'; }
        return;
      }
      console.error('Profile fetch error:', error);
      return;
    }

    if (data) {
      const tariffEl = document.getElementById('profileTariff');
      const dateEl = document.getElementById('profileDate');
      const hwidEl = document.getElementById('hwidValue');
      if (tariffEl) tariffEl.textContent = data.tariff || 'Нет';
      if (dateEl) dateEl.textContent = data.created_at ? new Date(data.created_at).toLocaleDateString('ru-RU') : '-';
      if (hwidEl) hwidEl.textContent = data.hwid || 'Не привязан';
    }
  } catch (err) {
    console.error('Error fetching profile:', err);
  }
}

let activeDiscount = 0;

async function applyPromoCode() {
  const input = document.getElementById('promoCode');
  const msg = document.getElementById('promoMessage');
  if (!input || !msg) return;
  const code = input.value.trim().toUpperCase();

  msg.classList.remove('visible', 'error', 'success');
  if (!code) {
    msg.textContent = 'Введите промокод';
    msg.classList.add('visible', 'error');
    return;
  }

  if (!initSupabase()) {
    msg.textContent = 'Ошибка соединения';
    msg.classList.add('visible', 'error');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('promocodes')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) {
      msg.textContent = 'Промокод не найден';
      msg.classList.add('visible', 'error');
      activeDiscount = 0;
      updatePrices();
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      msg.textContent = 'Промокод истёк';
      msg.classList.add('visible', 'error');
      activeDiscount = 0;
      updatePrices();
      return;
    }

    if (data.max_uses && data.used_count >= data.max_uses) {
      msg.textContent = 'Промокод больше недействителен';
      msg.classList.add('visible', 'error');
      activeDiscount = 0;
      updatePrices();
      return;
    }

    activeDiscount = data.discount_percent;
    msg.textContent = `Промокод применён! Скидка ${data.discount_percent}%`;
    msg.classList.add('visible', 'success');
    updatePrices();
  } catch (err) {
    msg.textContent = 'Ошибка проверки промокода';
    msg.classList.add('visible', 'error');
    activeDiscount = 0;
    updatePrices();
  }
}

function updatePrices() {
  document.querySelectorAll('.tariff-price').forEach(el => {
    const original = parseInt(el.getAttribute('data-price'));
    if (!original) return;
    if (activeDiscount > 0) {
      const discounted = original - Math.round(original * activeDiscount / 100);
      el.innerHTML = `${discounted.toLocaleString('ru-RU')} ₽ <span class="old-price">${original.toLocaleString('ru-RU')} ₽</span>`;
    } else {
      el.innerHTML = `${original.toLocaleString('ru-RU')} ₽`;
    }
  });
}

function buyTariff(name, price) {
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const finalPrice = activeDiscount > 0 ? price - Math.round(price * activeDiscount / 100) : price;
  const discountText = activeDiscount > 0 ? `<p style="font-size:13px;color:#22c55e;margin-bottom:8px;">Скидка ${activeDiscount}% применена</p>` : '';

  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  if (!overlay || !content) return;

  overlay.classList.add('active');
  content.innerHTML = `
    <h2>Оформление заказа</h2>
    <p>Тариф: <strong>${name}</strong></p>
    <p style="font-size: 24px; font-weight: 800; margin-bottom: 16px; color: var(--accent-light);">${finalPrice.toLocaleString('ru-RU')} ₽</p>
    ${discountText}
    <div style="color: var(--accent-light); text-align: center; padding: 16px; background: rgba(155,89,182,0.1); border-radius: 10px; border: 1px solid var(--card-border);">
      <p style="font-size: 16px; margin-bottom: 8px;">Для оплаты напишите в Telegram:</p>
      <a href="https://t.me/astranordlc" target="_blank" style="color: var(--accent-light); font-size: 18px; font-weight: 700; text-decoration: none;">
        <i class="fa-brands fa-telegram"></i> @astranordlc
      </a>
      <p style="margin-top: 12px; font-size: 13px; opacity: 0.7;">Укажите ваш email: ${currentUser.email}</p>
    </div>
    <div class="modal-footer">
      <a onclick="closeModal()">Закрыть</a>
    </div>
  `;
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('active');
}

async function copyHWID() {
  const hwidEl = document.getElementById('hwidValue');
  if (!hwidEl) return;
  const hwid = hwidEl.textContent;
  if (hwid && hwid !== 'Не привязан') {
    try {
      await navigator.clipboard.writeText(hwid);
      const btn = document.querySelector('.hwid-display .btn-icon i');
      if (btn) {
        btn.className = 'fa-solid fa-check';
        setTimeout(() => { btn.className = 'fa-regular fa-copy'; }, 2000);
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }
}

function setupAuthListener() {
  if (!supabase) return;
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      currentUser = session.user;
      updateAuthUI();
      updateProfileUI();
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      updateAuthUI();
      updateProfileUI();
    } else if (event === 'TOKEN_REFRESHED') {
      currentUser = session?.user || null;
    }
  });
}

async function restoreSession() {
  if (!initSupabase()) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      currentUser = session.user;
      updateAuthUI();
      updateProfileUI();
    }
  } catch (err) {
    console.error('Session restore error:', err);
  }
}

function waitForSupabase(retries) {
  if (initSupabase()) {
    setupAuthListener();
    restoreSession();
    return;
  }
  if (retries > 0) {
    setTimeout(function(){ waitForSupabase(retries - 1); }, 500);
  }
}

waitForSupabase(20);

const style = document.createElement('style');
style.textContent = `
  .user-email {
    color: var(--accent-light);
    font-size: 14px;
    font-weight: 500;
    padding: 8px 12px;
    background: rgba(155, 89, 182, 0.1);
    border-radius: 8px;
    border: 1px solid var(--card-border);
    text-decoration: none;
    transition: all 0.2s;
  }
  .user-email:hover {
    background: rgba(155, 89, 182, 0.2);
  }
`;
document.head.appendChild(style);
