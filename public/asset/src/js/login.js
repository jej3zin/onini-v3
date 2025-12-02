document.addEventListener('DOMContentLoaded', () => {
  // ELEMENTOS LOGIN
  const btnUser = document.querySelector('.BtnUser');
  const modalLogin = document.getElementById('modalLogin');
  const closeLogin = document.getElementById('closeModal');

  // REGISTER
  const modalRegister = document.getElementById('modalRegister');
  const closeRegister = document.getElementById('closeRegister');

  // LINKS DE TROCA
  const openRegisterLink = document.getElementById('openRegister');
  const openLoginLink = document.getElementById('openLogin');

  // ABRIR LOGIN
  btnUser?.addEventListener('click', () => {
    modalLogin.classList.add('active');
  });

  // FECHAR LOGIN
  closeLogin?.addEventListener('click', () => {
    modalLogin.classList.add('closing');
    setTimeout(() => {
      modalLogin.classList.remove('active', 'closing');
    }, 250);
  });

  // FECHAR LOGIN PELO FUNDO
  modalLogin?.addEventListener('click', (e) => {
    if (e.target === modalLogin) {
      modalLogin.classList.add('closing');
      setTimeout(() => {
        modalLogin.classList.remove('active', 'closing');
      }, 250);
    }
  });

  // ABRIR REGISTER
  openRegisterLink?.addEventListener('click', () => {
    modalLogin.classList.remove('active');
    modalRegister.classList.add('active');
  });

  // VOLTAR PARA LOGIN
  openLoginLink?.addEventListener('click', () => {
    modalRegister.classList.remove('active');
    modalLogin.classList.add('active');
  });

  // FECHAR REGISTER
  closeRegister?.addEventListener('click', () => {
    modalRegister.classList.add('closing');
    setTimeout(() => {
      modalRegister.classList.remove('active', 'closing');
    }, 250);
  });

  // ============================================
  // LOGIN VIA FETCH
  // ============================================

  const loginForm = document.getElementById('loginForm');

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (!email || !pass) return showError('Preencha todos os campos!');

    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();

      if (!res.ok) return showError(data.error || 'Erro no login!');

      // LOGIN OK → REDIRECIONA
      window.location.href = '/pages/home.html';
    } catch (err) {
      showError('Falha de conexão com o servidor.');
    }
  });

  // ============================================
  // REGISTER VIA FETCH
  // ============================================

  const registerForm = document.getElementById('registerForm');

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPass').value.trim();

    if (!name || !email || !pass) return showError('Preencha todos os campos!');

    try {
      const res = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass }),
      });

      const data = await res.json();

      if (!res.ok) return showError(data.error || 'Erro no registro!');

      showSuccess('Conta criada! Agora faça login.');
      modalRegister.classList.remove('active');
      modalLogin.classList.add('active');
    } catch (err) {
      showError('Falha ao conectar ao servidor.');
    }
  });
});

// POPUP DE ERRO
function showError(message) {
  const popup = document.getElementById('popupError');
  const popupMsg = document.getElementById('popupMessage');

  popupMsg.textContent = message;
  popup.classList.add('active');

  setTimeout(() => {
    popup.classList.remove('active');
  }, 3000);
}

// POPUP DE SUCESSO
function showSuccess(message) {
  const popup = document.getElementById('popupSuccess');
  const popupMsg = document.getElementById('popupSuccessMessage');

  popupMsg.textContent = message;
  popup.classList.add('active');

  setTimeout(() => {
    popup.classList.remove('active');
  }, 3000);
}
