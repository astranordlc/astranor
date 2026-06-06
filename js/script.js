const SUPABASE_URL = 'https://wjtxtpnnmwmjguwgmymd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5Z7cq0CgHgRsUJOkinbpBQ_LIejxJnl';

let currentUser = null;

function getAccessToken() {
  return localStorage.getItem('sb_access_token');
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
  const btn = document.querySelector('.auth-card .btn-fill');

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

  if (btn) btn.textContent = 'Подождите...';

  try {
    const response = await fetch('https://wjtxtpnnmwmjguwgmymd.supabase.co/auth/v1/signup', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      if (btn) btn.textContent = 'Зарегистрироваться';
      if (errorEl) { errorEl.textContent = result.msg || 'Ошибка регистрации'; errorEl.classList.add('visible'); }
      return;
    }

    const userId = result.id || (result.user && result.user.id);
    const userEmail = result.email || (result.user && result.user.email);

    if (userId) {
      window.location.href = 'confirm.html?user_id=' + encodeURIComponent(userId) + '&email=' + encodeURIComponent(userEmail || '');
      return;
    }

    if (successEl) {
      successEl.textContent = 'Регистрация успешна! Проверьте email для подтверждения.';
      successEl.classList.add('visible');
    }
    if (btn) btn.textContent = 'Зарегистрироваться';
  } catch (err) {
    if (btn) btn.textContent = 'Зарегистрироваться';
    if (errorEl) { errorEl.textContent = 'Ошибка: ' + err.message; errorEl.classList.add('visible'); }
  }
}

function getConfirmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    user_id: params.get('user_id'),
    email: params.get('email')
  };
}

async function handleConfirmEmail() {
  const { user_id, email } = getConfirmParams();
  const errorEl = document.getElementById('confirmError');
  const successEl = document.getElementById('confirmSuccess');
  const btn = document.getElementById('confirmBtn');
  const displayEl = document.getElementById('confirmEmailDisplay');

  if (displayEl && email) {
    displayEl.textContent = 'Email: ' + email;
  }

  if (errorEl) errorEl.classList.remove('visible');
  if (successEl) successEl.classList.remove('visible');

  if (!user_id) {
    if (errorEl) { errorEl.textContent = 'Ошибка: ID пользователя не найден. Зарегистрируйтесь заново.'; errorEl.classList.add('visible'); }
    return;
  }

  if (btn) { btn.textContent = 'Подождите...'; btn.disabled = true; }

  try {
    const response = await fetch('https://wjtxtpnnmwmjguwgmymd.supabase.co/rest/v1/rpc/confirm_user_email', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id })
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      if (btn) { btn.textContent = 'Подтвердить почту'; btn.disabled = false; }
      if (errorEl) { errorEl.textContent = result.error || 'Ошибка подтверждения'; errorEl.classList.add('visible'); }
      return;
    }

    if (successEl) {
      successEl.textContent = 'Email успешно подтверждён!';
      successEl.classList.add('visible');
    }
    if (btn) { btn.textContent = 'Подтвердить почту'; btn.disabled = false; }

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  } catch (err) {
    if (btn) { btn.textContent = 'Подтвердить почту'; btn.disabled = false; }
    if (errorEl) { errorEl.textContent = 'Ошибка: ' + err.message; errorEl.classList.add('visible'); }
  }
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  const btn = document.querySelector('.auth-card .btn-fill');

  if (errorEl) errorEl.classList.remove('visible');

  if (!email || !password) {
    if (errorEl) { errorEl.textContent = 'Заполните все поля'; errorEl.classList.add('visible'); }
    return;
  }

  if (btn) btn.textContent = 'Подождите...';

  try {
    const response = await fetch('https://wjtxtpnnmwmjguwgmymd.supabase.co/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      if (btn) btn.textContent = 'Войти';
      if (errorEl) { errorEl.textContent = result.msg || 'Ошибка входа'; errorEl.classList.add('visible'); }
      return;
    }

    localStorage.setItem('sb_access_token', result.access_token);
    localStorage.setItem('sb_refresh_token', result.refresh_token);
    localStorage.setItem('sb_user', JSON.stringify(result.user));

    currentUser = result.user;
    updateAuthUI();
    window.location.href = 'profile.html';
  } catch (err) {
    if (btn) btn.textContent = 'Войти';
    if (errorEl) { errorEl.textContent = 'Ошибка: ' + err.message; errorEl.classList.add('visible'); }
  }
}

async function handleLogout() {
  localStorage.removeItem('sb_access_token');
  localStorage.removeItem('sb_refresh_token');
  localStorage.removeItem('sb_user');
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

  const token = getAccessToken();
  if (!token) return;

  try {
    const response = await fetch('https://wjtxtpnnmwmjguwgmymd.supabase.co/rest/v1/profiles?id=eq.' + currentUser.id + '&select=*', {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + token
      }
    });

    if (response.status === 404) {
      const el = document.querySelector('.profile-hwid p');
      if (el) { el.textContent = 'Таблица profiles не найдена. Выполни supabase_setup.sql в SQL Editor Supabase.'; el.style.color = '#ef4444'; }
      return;
    }

    const profiles = await response.json();
    if (profiles && profiles.length > 0) {
      const data = profiles[0];
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

  try {
    const response = await fetch('https://wjtxtpnnmwmjguwgmymd.supabase.co/rest/v1/promocodes?code=eq.' + encodeURIComponent(code) + '&select=*', {
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    });

    const data = await response.json();

    if (!data || data.length === 0) {
      msg.textContent = 'Промокод не найден';
      msg.classList.add('visible', 'error');
      activeDiscount = 0;
      updatePrices();
      return;
    }

    const promo = data[0];

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      msg.textContent = 'Промокод истёк';
      msg.classList.add('visible', 'error');
      activeDiscount = 0;
      updatePrices();
      return;
    }

    if (promo.max_uses && promo.used_count >= promo.max_uses) {
      msg.textContent = 'Промокод больше недействителен';
      msg.classList.add('visible', 'error');
      activeDiscount = 0;
      updatePrices();
      return;
    }

    activeDiscount = promo.discount_percent;
    msg.textContent = 'Промокод применён! Скидка ' + promo.discount_percent + '%';
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

function restoreSession() {
  const stored = localStorage.getItem('sb_user');
  const token = localStorage.getItem('sb_access_token');
  if (stored && token) {
    try {
      currentUser = JSON.parse(stored);
      updateAuthUI();
      updateProfileUI();
    } catch (e) {
      localStorage.removeItem('sb_user');
      localStorage.removeItem('sb_access_token');
      localStorage.removeItem('sb_refresh_token');
    }
  }
}

restoreSession();

const confirmDisplay = document.getElementById('confirmEmailDisplay');
if (confirmDisplay) {
  const { email } = getConfirmParams();
  if (email) {
    confirmDisplay.textContent = 'Email: ' + email;
  }
}

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
