const supabaseUrl = 'https://wjtxtpnnmwmjguwgmymd.supabase.co';
const supabaseKey = 'sb_publishable_5Z7cq0CgHgRsUJOkinbpBQ_LIejxJnl';
const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

// Register
document?.getElementById('registerForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const { username, email, password } = form.elements;
  const { data, error } = await supabase.auth.signUp({ email: email.value, password: password.value });
  if (!error) alert('Check your email to confirm registration!');
});

// Login
document?.getElementById('loginForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const { email, password } = form.elements;
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value });
  if (!error) window.location.href = 'dashboard.html';
});

// Dashboard
window.addEventListener('DOMContentLoaded', async () => {
  const session = supabase.auth.getSession();
  if (!session) return window.location.href = 'login.html';
  const user = supabase.auth.getUser();
  document.getElementById('username').innerText = user?.email;
  document.getElementById('plan').innerText = 'Lite';
  document.getElementById('hwid').innerText = 'Not Bound';
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});
