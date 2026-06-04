const supabaseUrl = 'https://wjtxtpnnmwmjguwgmymd.supabase.co';
const supabaseKey = 'sb_publishable_5Z7cq0CgHgRsUJOkinbpBQ_LIejxJnl';

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

/* =========================
   REGISTER
========================= */
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const email = form.elements.email.value;
  const password = form.elements.password.value;
  const username = form.elements.username.value;

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });

  if (error) return alert(error.message);

  alert("Check your email to confirm account!");
});

/* =========================
   LOGIN
========================= */
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const email = form.elements.email.value;
  const password = form.elements.password.value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) return alert(error.message);

  window.location.href = "dashboard.html";
});

/* =========================
   AUTH GUARD (SaaS STYLE)
========================= */
async function requireAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return null;
  }

  return session;
}

/* =========================
   DASHBOARD INIT
========================= */
window.addEventListener('DOMContentLoaded', async () => {
  const session = await requireAuth();
  if (!session) return;

  const { data: { user } } = await supabaseClient.auth.getUser();

  const username =
    user?.user_metadata?.username || user.email;

  document.getElementById('username')?.innerText = username;

  // default SaaS fields
  document.getElementById('plan')?.innerText = 'Free';
  document.getElementById('hwid')?.innerText = 'Not Bound';
});

/* =========================
   LOGOUT
========================= */
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
});
