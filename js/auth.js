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
  const username = form.elements.username.value;

  const { error } = await supabaseClient.auth.signUp({
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

  alert("Account created! Check your email.");
});

/* =========================
   LOGIN
========================= */
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;

  const email = form.elements.email.value;
  const password = form.elements.password.value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  window.location.href = "dashboard.html";
});


/* =========================
   DASHBOARD PROTECTION
========================= */
window.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const { data: { user } } = await supabaseClient.auth.getUser();

  document.getElementById('username').innerText =
    user?.user_metadata?.username || user.email;
});

/* =========================
   LOGOUT
========================= */
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});
