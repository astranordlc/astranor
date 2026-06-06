const SUPABASE_URL = 'https://wjtxtpnnmwmjguwgmymd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5Z7cq0CgHgRsUJOkinbpBQ_LIejxJnl';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

let currentUser = null;
let currentPage = 'home';

function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.header-nav a').forEach(a => a.classList.remove('active'));
  const navLink = document.querySelector(`.header-nav a[onclick*="'${page}'"]`);
  if (navLink) navLink.classList.add('active');
  window.scrollTo(0, 0);
  updateProfileUI();
}

function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}

function openModal(type) {
  document.getElementById('modalOverlay').classList.add('active');
  const content = document.getElementById('modalContent');

  if (type === 'login') {
    content.innerHTML = `
      <h2>Вход</h2>
      <p>Войдите в свой аккаунт</p>
      <div class="form-error" id="loginError"></div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="loginEmail" placeholder="your@email.com" />
      </div>
      <div class="form-group">
        <label>Пароль</label>
        <input type="password" id="loginPassword" placeholder="••••••••" />
      </div>
      <button class="btn-fill" onclick="handleLogin()">Войти</button>
      <div class="modal-footer">
        Нет аккаунта? <a onclick="openModal('register')">Зарегистрироваться</a>
      </div>
    `;
  } else if (type === 'register') {
    content.innerHTML = `
      <h2>Регистрация</h2>
      <p>Создайте новый аккаунт</p>
      <div class="form-error" id="registerError"></div>
      <div class="form-success" id="registerSuccess"></div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="registerEmail" placeholder="your@email.com" />
      </div>
      <div class="form-group">
        <label>Пароль</label>
        <input type="password" id="registerPassword" placeholder="••••••••" />
      </div>
      <button class="btn-fill" onclick="handleRegister()">Зарегистрироваться</button>
      <div class="modal-footer">
        Уже есть аккаунт? <a onclick="openModal('login')">Войти</a>
      </div>
    `;
  }
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

async function handleRegister() {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const errorEl = document.getElementById('registerError');
  const successEl = document.getElementById('registerSuccess');

  errorEl.classList.remove('visible');
  successEl.classList.remove('visible');

  if (!email || !password) {
    errorEl.textContent = 'Заполните все поля';
    errorEl.classList.add('visible');
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = 'Пароль должен быть минимум 6 символов';
    errorEl.classList.add('visible');
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      errorEl.textContent = error.message;
      errorEl.classList.add('visible');
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          email: email,
          tariff: 'Нет',
          hwid: '',
          created_at: new Date().toISOString()
        }
      ]);

      if (profileError) {
        if (profileError.code === '42P01') {
          successEl.textContent = 'Регистрация успешна! Внимание: не создана таблица profiles в Supabase. Выполни supabase_setup.sql в SQL Editor.';
          successEl.classList.add('visible');
          setTimeout(() => closeModal(), 4000);
          return;
        }
        if (profileError.code !== '23505') {
          console.error('Profile creation error:', profileError);
        }
      }
    }

    successEl.textContent = 'Регистрация успешна! Проверьте email для подтверждения.';
    successEl.classList.add('visible');

    setTimeout(() => closeModal(), 2000);
  } catch (err) {
    errorEl.textContent = 'Ошибка соединения с сервером';
    errorEl.classList.add('visible');
  }
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  errorEl.classList.remove('visible');

  if (!email || !password) {
    errorEl.textContent = 'Заполните все поля';
    errorEl.classList.add('visible');
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      errorEl.textContent = error.message;
      errorEl.classList.add('visible');
      return;
    }

    currentUser = data.user;
    closeModal();
    updateAuthUI();
    updateProfileUI();
    if (currentPage === 'profile') updateProfileUI();
  } catch (err) {
    errorEl.textContent = 'Ошибка соединения с сервером';
    errorEl.classList.add('visible');
  }
}

async function handleLogout() {
  await supabase.auth.signOut();
  currentUser = null;
  updateAuthUI();
  updateProfileUI();
  navigate('home');
}

async function updateAuthUI() {
  const authContainer = document.getElementById('authButtons');

  if (currentUser) {
    authContainer.innerHTML = `
      <span class="user-email">${currentUser.email}</span>
      <button class="btn-outline" onclick="handleLogout()">Выйти</button>
    `;
  } else {
    authContainer.innerHTML = `
      <button class="btn-outline" onclick="openModal('login')">Войти</button>
      <button class="btn-fill" onclick="openModal('register')">Регистрация</button>
    `;
  }
}

async function updateProfileUI() {
  if (!currentUser) {
    document.getElementById('profileNotAuth').style.display = 'block';
    document.getElementById('profileContent').style.display = 'none';
    return;
  }

  document.getElementById('profileNotAuth').style.display = 'none';
  document.getElementById('profileContent').style.display = 'block';

  document.getElementById('profileEmail').textContent = currentUser.email;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      if (error.code === '42P01') {
        document.querySelector('.profile-hwid p').textContent = 'Таблица profiles не найдена. Выполни supabase_setup.sql в SQL Editor Supabase.';
        document.querySelector('.profile-hwid p').style.color = '#ef4444';
        return;
      }
      console.error('Profile fetch error:', error);
      return;
    }

    if (data) {
      document.getElementById('profileTariff').textContent = data.tariff || 'Нет';
      document.getElementById('profileDate').textContent = data.created_at
        ? new Date(data.created_at).toLocaleDateString('ru-RU')
        : '-';
      document.getElementById('hwidValue').textContent = data.hwid || 'Не привязан';
    }
  } catch (err) {
    console.error('Error fetching profile:', err);
  }
}

function buyTariff(name, price) {
  if (!currentUser) {
    openModal('login');
    return;
  }

  document.getElementById('modalOverlay').classList.add('active');
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <h2>Оформление заказа</h2>
    <p>Тариф: <strong>${name}</strong> — ${price.toLocaleString('ru-RU')} ₽</p>
    <div class="form-success visible" style="color: var(--accent-light); text-align: center; padding: 16px; background: rgba(155,89,182,0.1); border-radius: 10px; border: 1px solid var(--card-border);">
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

async function copyHWID() {
  const hwid = document.getElementById('hwidValue').textContent;
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

(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      currentUser = session.user;
      updateAuthUI();
    }
  } catch (err) {
    console.error('Session restore error:', err);
  }
})();

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
  }
`;
document.head.appendChild(style);
