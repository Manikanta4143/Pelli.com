// frontend/script.js - modal, signup slides, login, signup submit

// MODALS
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');

document.getElementById('openLogin').addEventListener('click', () => {
  loginModal.style.display = 'flex';
});
document.getElementById('closeLogin').addEventListener('click', () => loginModal.style.display = 'none');

document.getElementById('openSignup').addEventListener('click', () => {
  signupModal.style.display = 'flex';
});
document.getElementById('closeSignup').addEventListener('click', () => signupModal.style.display = 'none');

document.getElementById('openSignupFromLogin').addEventListener('click', (e) => {
  e.preventDefault();
  loginModal.style.display = 'none';
  signupModal.style.display = 'flex';
});

// CLOSE ON OUTSIDE CLICK
window.addEventListener('click', (e) => {
  if (e.target === loginModal) loginModal.style.display = 'none';
  if (e.target === signupModal) signupModal.style.display = 'none';
});

// SLIDES logic
const slides = Array.from(document.querySelectorAll('.slide'));
let current = 0;
function showSlide(index){
  slides.forEach((s, i)=> s.classList.toggle('active', i === index));
  document.querySelectorAll('.step-dot').forEach(dot => {
    dot.classList.toggle('active', parseInt(dot.dataset.step) === (index + 1));
  });
}
showSlide(0);

// option & gender toggles
document.querySelectorAll('.option-btn').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.option-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  enableNext1IfReady();
}));
document.querySelectorAll('.gender-btn').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.gender-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  enableNext1IfReady();
}));

function enableNext1IfReady(){
  const next1 = document.getElementById('next1');
  const rel = document.querySelector('.option-btn.active');
  const gen = document.querySelector('.gender-btn.active');
  next1.disabled = !(rel && gen);
}

// slide 1 next
document.getElementById('next1').addEventListener('click', () => {
  current = 1; showSlide(current);
});

// slide 2 validation
function checkSlide2(){
  const fn = document.getElementById('firstName').value.trim();
  const ln = document.getElementById('lastName').value.trim();
  const dob = document.getElementById('dob').value;
  document.getElementById('next2').disabled = !(fn && ln && dob);
}
['firstName','lastName','dob'].forEach(id=>{
  document.getElementById(id).addEventListener('input', checkSlide2);
  document.getElementById(id).addEventListener('change', checkSlide2);
});
document.getElementById('next2').addEventListener('click', () => { current = 2; showSlide(current); });

// slide 3 validation
function checkSlide3(){
  const religion = document.getElementById('religion').value;
  const community = document.getElementById('community').value;
  const living = document.getElementById('livingIn').value;
  const city = document.getElementById('city').value.trim();
  document.getElementById('next3').disabled = !(religion && community && living && city);
}
['religion','community','livingIn','city'].forEach(id=>{
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', checkSlide3);
  if (el) el.addEventListener('change', checkSlide3);
});
document.getElementById('next3').addEventListener('click', () => { current = 3; showSlide(current); });

// prev buttons
document.querySelectorAll('.btn.prev').forEach(btn=>{
  btn.addEventListener('click', () => {
    const prev = parseInt(btn.dataset.prev);
    current = prev - 1;
    showSlide(current);
  });
});

// password match & enable submit
const finalPass = document.getElementById('finalPassword');
const finalConfirm = document.getElementById('finalConfirm');
const signupSubmitBtn = document.getElementById('signupSubmit');
function checkFinal(){
  const e = document.getElementById('finalEmail').value.trim();
  const p = finalPass.value;
  const c = finalConfirm.value;
  const phone = document.getElementById('finalPhone').value.trim();
  const ok = e && phone && p && c && (p === c);
  document.getElementById('pwNote').textContent = !p ? '' : (p === c ? 'Passwords match ✅' : 'Passwords do not match ❌');
  signupSubmitBtn.disabled = !ok;
}
['finalEmail','finalPhone','finalPassword','finalConfirm'].forEach(id=>{
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', checkFinal);
});

// SIGNUP submit
document.getElementById('signupForm').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  try {
    const relation = document.querySelector('.option-btn.active')?.dataset.value || '';
    const gender = document.querySelector('.gender-btn.active')?.dataset.value || '';
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const dob = document.getElementById('dob').value;
    const education = document.getElementById('education').value;
    const religion = document.getElementById('religion').value;
    const community = document.getElementById('community').value;
    const livingIn = document.getElementById('livingIn').value;
    const state = document.getElementById('state').value;
    const city = document.getElementById('city').value;
    const email = document.getElementById('finalEmail').value.trim();
    const phone = document.getElementById('finalPhone').value.trim();
    const password = document.getElementById('finalPassword').value;
    const profileImage = document.getElementById('profileImage').files[0];

    const formData = new FormData();
    formData.append('relation', relation);
    formData.append('gender', gender);
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('dob', dob);
    formData.append('education', education);
    formData.append('religion', religion);
    formData.append('community', community);
    formData.append('livingIn', livingIn);
    formData.append('state', state);
    formData.append('city', city);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    if (profileImage) formData.append('profileImage', profileImage);

    const res = await fetch('http://localhost:5000/api/auth/register', { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok) {
      // store user and redirect to main
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'main.html';
    } else {
      alert(data.message || 'Registration failed');
    }
  } catch (err) {
    console.error('Signup error', err); alert('Something went wrong. Please check server console.');
  }
});

// LOGIN (modal)
document.getElementById('loginForm').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      loginModal.style.display = 'none';
      window.location.href = 'main.html';
    } else alert(data.message || 'Login failed');
  } catch (err) { console.error(err); alert('Login error'); }
});
