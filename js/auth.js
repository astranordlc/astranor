const supabaseUrl = 'https://wjtxtpnnmwmjguwgmymd.supabase.co';
const supabaseKey = 'sb_publishable_5Z7cq0CgHgRsUJOkinbpBQ_LIejxJnl';

const sb = supabase.createClient(supabaseUrl, supabaseKey);

/* ================= REGISTER ================= */
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;

  const email = form.elements.email.value;
  const password = form.elements.password.value;
  const username = form.elements.username.value;

  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Account created! Check email.");
});

/* ================= LOGIN ================= */
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;

  const email = form.elements.email.value;
  const password = form.elements.password.value;

  const { error } = await sb.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  window.location.href = "dashboard.html";
});

/* ================= DASHBOARD GUARD ================= */
window.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await sb.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const { data: { user } } = await sb.auth.getUser();

  const el = document.getElementById('username');
  if (el) el.innerText = user.email;
});

/* ================= LOGOUT ================= */
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await sb.auth.signOut();
  window.location.href = "login.html";
});
