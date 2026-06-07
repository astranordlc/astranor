const SUPABASE_URL = 'https://wjtxtpnnmwmjguwgmymd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5Z7cq0CgHgRsUJOkinbpBQ_LIejxJnl';

let currentUser = null;

(function dev(){
  if (typeof window === 'undefined') return;
  document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'U')) {
      e.preventDefault(); e.stopPropagation();
    }
  });
  setInterval(function(){
    var d = new Date();
    if (d.getTime() % 2 === 0) { (function(){ return false; }); }
  }, 1000);
  var e = new Image();
  Object.defineProperty(e, 'id', { get: function(){ window.location.href = 'about:blank'; } });
  setInterval(function(){ console.clear(); }, 5000);
})();

function getAccessToken() {
  return localStorage.getItem('sb_access_token');
}

function togglePassword() {
  const input = document.getElementById('registerPassword');
  const icon = document.querySelector('#pwToggle i');
  if (!input || !icon) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  icon.className = isPass ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
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
      const code = String(Math.floor(100000 + Math.random() * 900000));

      try {
        await fetch('https://wjtxtpnnmwmjguwgmymd.supabase.co/rest/v1/rpc/set_confirm_email_code', {
          method: 'POST',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, code })
        });
      } catch (e) {}

      window.location.href = 'confirm.html?user_id=' + encodeURIComponent(userId) + '&email=' + encodeURIComponent(userEmail || '') + '&code=' + encodeURIComponent(code);
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
    email: params.get('email'),
    code: params.get('code')
  };
}

async function handleConfirmEmail() {
  const { user_id, email, code: urlCode } = getConfirmParams();
  const errorEl = document.getElementById('confirmError');
  const successEl = document.getElementById('confirmSuccess');
  const btn = document.getElementById('confirmBtn');
  const displayEl = document.getElementById('confirmEmailDisplay');
  const codeInput = document.getElementById('confirmCodeInput');
  const codeDisplay = document.getElementById('confirmCodeDisplay');

  if (displayEl && email) {
    displayEl.textContent = 'Email: ' + email;
  }

  if (codeDisplay && urlCode) {
    codeDisplay.textContent = urlCode;
  }

  if (errorEl) errorEl.classList.remove('visible');
  if (successEl) successEl.classList.remove('visible');

  if (!user_id) {
    if (errorEl) { errorEl.textContent = 'Ошибка: ID пользователя не найден. Зарегистрируйтесь заново.'; errorEl.classList.add('visible'); }
    return;
  }

  const enteredCode = codeInput ? codeInput.value.trim() : urlCode;
  if (!enteredCode || enteredCode.length !== 6) {
    if (errorEl) { errorEl.textContent = 'Введите код из 6 цифр'; errorEl.classList.add('visible'); }
    return;
  }

  if (btn) { btn.textContent = 'Подождите...'; btn.disabled = true; }

  try {
    const response = await fetch('https://wjtxtpnnmwmjguwgmymd.supabase.co/rest/v1/rpc/verify_confirm_email', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id, code: enteredCode })
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      if (btn) { btn.textContent = 'Подтвердить'; btn.disabled = false; }
      if (errorEl) { errorEl.textContent = result.error || 'Ошибка'; errorEl.classList.add('visible'); }
      return;
    }

    if (successEl) {
      successEl.textContent = 'Email успешно подтверждён!';
      successEl.classList.add('visible');
    }
    if (btn) { btn.textContent = 'Подтверждено'; btn.disabled = true; }

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  } catch (err) {
    if (btn) { btn.textContent = 'Подтвердить'; btn.disabled = false; }
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
  localStorage.removeItem('sb_profile');
  currentUser = null;
  updateAuthUI();
  window.location.href = 'index.html';
}

async function updateAuthUI() {
  const authContainer = document.getElementById('authButtons');
  if (!authContainer) return;

  if (currentUser) {
    const storedProfiles = localStorage.getItem('sb_profile');
    let displayName = currentUser.email;
    if (storedProfiles) {
      try {
        const p = JSON.parse(storedProfiles);
        if (p.username) displayName = p.username;
      } catch (e) {}
    }
    authContainer.innerHTML = `
      <a href="profile.html" class="user-email">
        <img id="headerAvatarImg" src="" style="display:none;width:24px;height:24px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:6px"/>
        ${displayName}
      </a>
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
      const uidEl = document.getElementById('profileUid');
      const avatarImg = document.getElementById('profileAvatar');
      const loaderSection = document.getElementById('loaderSection');
      const headerAvatar = document.getElementById('headerAvatarImg');

      const usernameEl = document.getElementById('profileUsername');
      const usernameInput = document.getElementById('usernameInput');

      if (tariffEl) tariffEl.textContent = data.tariff || 'Нет';
      if (dateEl) dateEl.textContent = data.created_at ? new Date(data.created_at).toLocaleDateString('ru-RU') : '-';
      if (hwidEl) hwidEl.textContent = data.hwid || 'Не привязан';
      if (uidEl) uidEl.textContent = data.uid || '0';
      if (usernameEl) usernameEl.textContent = data.username || currentUser.email.split('@')[0];
      if (usernameInput) usernameInput.value = data.username || '';

      const avatarPlaceholder = document.getElementById('avatarPlaceholder');

      if (data.avatar_url) {
        if (avatarImg) { avatarImg.src = data.avatar_url; avatarImg.style.display = 'block'; }
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
      } else {
        if (avatarImg) avatarImg.style.display = 'none';
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
      }

      if (headerAvatar && data.avatar_url) {
        headerAvatar.src = data.avatar_url;
        headerAvatar.style.display = 'inline-block';
      }

      localStorage.setItem('sb_profile', JSON.stringify({ username: data.username, avatar_url: data.avatar_url }));
      updateAuthUI();

      if (loaderSection) {
        const hasTariff = data.tariff && data.tariff !== 'Нет' && data.tariff.trim() !== '';
        loaderSection.style.display = hasTariff ? 'block' : 'none';
      }
    }
  } catch (err) {
    console.error('Error fetching profile:', err);
  }
}

async function handleAvatarUpload() {
  const fileInput = document.getElementById('avatarInput');
  const errorEl = document.getElementById('avatarError');
  const successEl = document.getElementById('avatarSuccess');

  if (errorEl) errorEl.classList.remove('visible');
  if (successEl) successEl.classList.remove('visible');

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    if (errorEl) { errorEl.textContent = 'Выберите файл'; errorEl.classList.add('visible'); }
    return;
  }

  const file = fileInput.files[0];
  const maxSize = 2 * 1024 * 1024;

  if (file.size > maxSize) {
    if (errorEl) { errorEl.textContent = 'Файл слишком большой (макс. 2MB)'; errorEl.classList.add('visible'); }
    return;
  }

  const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
  if (!allowed.includes(file.type)) {
    if (errorEl) { errorEl.textContent = 'Допустимы только PNG, JPG, GIF, WebP'; errorEl.classList.add('visible'); }
    return;
  }

  const token = getAccessToken();
  if (!token) {
    if (errorEl) { errorEl.textContent = 'Авторизуйтесь заново'; errorEl.classList.add('visible'); }
    return;
  }

  const ext = file.name.split('.').pop() || 'png';
  const filePath = currentUser.id + '/avatar.' + ext;

  try {
    const uploadResponse = await fetch('https://wjtxtpnnmwmjguwgmymd.supabase.co/storage/v1/object/avatars/' + filePath, {
      method: 'PUT',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + token,
        'Content-Type': file.type
      },
      body: file
    });

    if (!uploadResponse.ok) {
      const errData = await uploadResponse.json();
      if (errorEl) { errorEl.textContent = errData.error || 'Ошибка загрузки'; errorEl.classList.add('visible'); }
      return;
    }

    const avatarUrl = 'https://wjtxtpnnmwmjguwgmymd.supabase.co/storage/v1/object/public/avatars/' + filePath;

    const updateResponse = await fetch('https://wjtxtpnnmwmjguwgmymd.supabase.co/rest/v1/profiles?id=eq.' + currentUser.id, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ avatar_url: avatarUrl })
    });

    if (!updateResponse.ok) {
      if (errorEl) { errorEl.textContent = 'Аватар загружен, но не сохранён'; errorEl.classList.add('visible'); }
      return;
    }

    if (successEl) {
      successEl.textContent = 'Аватар обновлён!';
      successEl.classList.add('visible');
    }
    updateProfileUI();
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Ошибка: ' + err.message; errorEl.classList.add('visible'); }
  }
}

async function handleUpdateUsername() {
  const input = document.getElementById('usernameInput');
  const errorEl = document.getElementById('usernameError');
  const successEl = document.getElementById('usernameSuccess');
  const displayEl = document.getElementById('profileUsername');

  if (errorEl) errorEl.classList.remove('visible');
  if (successEl) successEl.classList.remove('visible');

  if (!input || !input.value.trim()) {
    if (errorEl) { errorEl.textContent = 'Введите ник'; errorEl.classList.add('visible'); }
    return;
  }

  const username = input.value.trim();
  if (username.length < 2 || username.length > 16) {
    if (errorEl) { errorEl.textContent = 'Ник от 2 до 16 символов'; errorEl.classList.add('visible'); }
    return;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    if (errorEl) { errorEl.textContent = 'Только латиница, цифры и _'; errorEl.classList.add('visible'); }
    return;
  }

  const token = getAccessToken();
  if (!token) {
    if (errorEl) { errorEl.textContent = 'Авторизуйтесь заново'; errorEl.classList.add('visible'); }
    return;
  }

  try {
    const check = await fetch('https://wjtxtpnnmwmjguwgmymd.supabase.co/rest/v1/profiles?username=eq.' + encodeURIComponent(username) + '&select=id', {
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    });
    const existing = await check.json();
    if (existing && existing.length > 0 && existing[0].id !== currentUser.id) {
      if (errorEl) { errorEl.textContent = 'Этот ник уже занят'; errorEl.classList.add('visible'); }
      return;
    }

    const response = await fetch('https://wjtxtpnnmwmjguwgmymd.supabase.co/rest/v1/profiles?id=eq.' + currentUser.id, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      const errData = await response.json();
      if (errorEl) { errorEl.textContent = errData.message || 'Ошибка сохранения'; errorEl.classList.add('visible'); }
      return;
    }

    if (displayEl) displayEl.textContent = username;
    if (successEl) {
      successEl.textContent = 'Ник сохранён!';
      successEl.classList.add('visible');
    }
    updateAuthUI();
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Ошибка: ' + err.message; errorEl.classList.add('visible'); }
  }
}

async function handleSupportTicket() {
  const subject = document.getElementById('ticketSubject');
  const message = document.getElementById('ticketMessage');
  const errorEl = document.getElementById('ticketError');
  const successEl = document.getElementById('ticketSuccess');
  const btn = document.getElementById('ticketBtn');

  if (errorEl) errorEl.classList.remove('visible');
  if (successEl) successEl.classList.remove('visible');

  if (!subject || !message || !subject.value.trim() || !message.value.trim()) {
    if (errorEl) { errorEl.textContent = 'Заполните все поля'; errorEl.classList.add('visible'); }
    return;
  }

  if (!currentUser) {
    if (errorEl) { errorEl.textContent = 'Авторизуйтесь'; errorEl.classList.add('visible'); }
    return;
  }

  const token = getAccessToken();
  if (!token) {
    if (errorEl) { errorEl.textContent = 'Авторизуйтесь заново'; errorEl.classList.add('visible'); }
    return;
  }

  if (btn) btn.textContent = 'Подождите...';

  try {
    const response = await fetch('https://wjtxtpnnmwmjguwgmymd.supabase.co/rest/v1/support_tickets', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: currentUser.id,
        subject: subject.value.trim(),
        message: message.value.trim()
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      if (btn) btn.textContent = 'Отправить';
      if (errorEl) { errorEl.textContent = errData.message || 'Ошибка отправки'; errorEl.classList.add('visible'); }
      return;
    }

    if (successEl) {
      successEl.textContent = 'Тикет отправлен! Мы ответим вам в ближайшее время.';
      successEl.classList.add('visible');
    }
    if (btn) btn.textContent = 'Отправить';
    subject.value = '';
    message.value = '';
  } catch (err) {
    if (btn) btn.textContent = 'Отправить';
    if (errorEl) { errorEl.textContent = 'Ошибка: ' + err.message; errorEl.classList.add('visible'); }
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
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .user-email:hover {
    background: rgba(155, 89, 182, 0.2);
  }
  .avatar-section {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
  }
  .avatar-section img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--accent-color);
  }
  .avatar-section .avatar-placeholder {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(155, 89, 182, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    color: var(--accent-light);
    border: 2px solid var(--card-border);
  }
  .avatar-upload {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
  .avatar-upload input[type="file"] {
    background: rgba(0,0,0,0.3);
    border: 1px solid var(--card-border);
    border-radius: 8px;
    padding: 8px 12px;
    color: var(--text-color);
    font-size: 13px;
    max-width: 180px;
  }
  .avatar-upload input[type="file"]::-webkit-file-upload-button {
    background: var(--accent-color);
    border: none;
    color: white;
    padding: 6px 14px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
    margin-right: 8px;
  }
  .loader-section {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 20px;
    padding: 24px 32px;
    text-align: center;
    margin-top: 20px;
  }
  .loader-section h3 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .loader-section p {
    color: var(--text-color-alower);
    font-size: 14px;
    margin-bottom: 16px;
  }
  .profile-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 20px;
  }
  .profile-actions a {
    flex: 1;
    min-width: 160px;
    text-align: center;
  }
  .support-page {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 32px 80px;
  }
  .support-page h1 {
    font-size: 32px;
    font-weight: 800;
    margin-bottom: 8px;
  }
  .support-page p {
    color: var(--text-color-alower);
    margin-bottom: 24px;
  }
  .form-group textarea {
    width: 100%;
    padding: 12px 16px;
    background: rgba(0,0,0,0.3);
    border: 1px solid var(--card-border);
    border-radius: 10px;
    color: var(--text-color);
    font-size: 14px;
    outline: none;
    resize: vertical;
    min-height: 120px;
    font-family: inherit;
  }
  .form-group textarea:focus {
    border-color: var(--accent-color);
  }
  .profile-full-width {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 32px 80px;
  }
`;
document.head.appendChild(style);
