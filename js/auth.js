const supabaseUrl = 'https://wjtxtpnnmwmjguwgmymd.supabase.co';
const supabaseKey = 'sb_publishable_5Z7cq0CgHgRsUJOkinbpBQ_LIejxJnl';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

/* =========================
   REGISTER
========================= */
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const email = form.elements.email.value;
  const password = form.elements.password.value;

  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert('Check your email to confirm registration!');
});


/* =========================
   LOGIN
========================= */
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const email = form.elements.email.value;
  const password = form.elements.password.value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  window.location.href = 'dashboard.html';
});


/* =========================
   DASHBOARD PROTECTION
========================= */
window.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const usernameEl = document.getElementById('username');
  if (usernameEl) {
    usernameEl.innerText = user.email;
  }

  const planEl = document.getElementById('plan');
  if (planEl) planEl.innerText = 'Lite';

  const hwidEl = document.getElementById('hwid');
  if (hwidEl) hwidEl.innerText = 'Not Bound';
});


/* =========================
   LOGOUT
========================= */
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});
