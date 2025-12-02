// ===== Modal Settings =====
const settingsModal = document.createElement('div');
settingsModal.classList.add('settingsModal');
settingsModal.innerHTML = `
  <div class="modalContent">
    <!-- Sidebar -->
    <div class="modalSidebar">
      <button data-section="account"><ion-icon name="person"></ion-icon>Conta</button>
      <button data-section="security"><ion-icon name="shield-checkmark"></ion-icon>Segurança</button>
      <button data-section="notifications"><ion-icon name="notifications"></ion-icon>Notificações</button>
      <button data-section="appearance"><ion-icon name="moon"></ion-icon>Aparência</button>
      <button data-section="language"><ion-icon name="language"></ion-icon>Linguagem</button>
      <button data-section="connections"><ion-icon name="link"></ion-icon>Conexão</button>
      <button data-section="deletion"><ion-icon name="trash"></ion-icon>Exclusão</button>
    </div>

    <!-- Conteúdo -->
    <div class="modalSection" id="modalSection">
      <h2>Conta</h2>
      <div class="form-group">
        <label>Banner</label>
        <input type="file" accept="image/*">
      </div>
      <div class="form-group">
        <label>Avatar</label>
        <input type="file" accept="image/*">
      </div>
      <div class="form-group">
        <label>Nome</label>
        <input type="text" placeholder="Seu nome">
      </div>
      <div class="form-group">
        <label>Local</label>
        <input type="text" placeholder="Sua localização">
      </div>
      <div class="form-group">
        <label>Bio</label>
        <textarea rows="3" placeholder="Uma breve descrição"></textarea>
      </div>
      <div class="sectionFooter">
        <button class="btnCancel">Cancelar</button>
        <button class="btnSave">Salvar</button>
      </div>
    </div>
  </div>
`;

document.body.appendChild(settingsModal);

// ===== Abrir modal =====
const profileDropdownLinks = document.querySelectorAll(
  '.profileDropdown footer ul li a, .profileDropdown footer ul li button'
);
profileDropdownLinks.forEach((el) => {
  el.addEventListener('click', (e) => {
    const text = e.target.closest('a, button').textContent.trim().toLowerCase();

    if (text === 'preferências') {
      e.preventDefault();
      settingsModal.classList.add('show');
      loadSection('appearance'); // abre direto Aparência
    }

    if (text === 'linguagem') {
      e.preventDefault();
      settingsModal.classList.add('show');
      loadSection('language'); // abre direto Linguagem
    }
  });
});

// ===== Fechar modal =====
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) settingsModal.classList.remove('show');
});

settingsModal.querySelector('.btnCancel').addEventListener('click', () => {
  settingsModal.classList.remove('show');
});

// ===== Trocar seções =====
const modalSection = document.getElementById('modalSection');
const sidebarButtons = settingsModal.querySelectorAll('.modalSidebar button');

const sections = {
  account: `
    <h2>Conta</h2>
    <div class="form-group"><label>Banner</label><input type="file" accept="image/*"></div>
    <div class="form-group"><label>Avatar</label><input type="file" accept="image/*"></div>
    <div class="form-group"><label>Nome</label><input type="text" placeholder="Seu nome"></div>
    <div class="form-group"><label>Local</label><input type="text" placeholder="Sua localização"></div>
    <div class="form-group"><label>Bio</label><textarea rows="3" placeholder="Uma breve descrição"></textarea></div>
    <div class="sectionFooter">
      <button class="btnCancel">Cancelar</button>
      <button class="btnSave">Salvar</button>
    </div>
  `,
  security: `
    <h2>Segurança</h2>
    <div class="form-group"><label>Email</label><input type="email" placeholder="Seu email"></div>
    <div class="form-group"><label>Senha</label><input type="password" placeholder="Nova senha"></div>
    <div class="form-group"><label>2FA</label><input type="text" placeholder="Ativar 2FA"></div>
    <div class="sectionFooter">
      <button class="btnCancel">Cancelar</button>
      <button class="btnSave">Salvar</button>
    </div>
  `,
  notifications: `
    <h2>Notificações</h2>
    <div class="form-group"><label>Push</label><select><option>Ativar</option><option>Desativar</option></select></div>
    <div class="form-group"><label>Email (Site)</label><select><option>Ativar</option><option>Desativar</option></select></div>
    <div class="form-group"><label>Email (Anime)</label><select><option>Ativar</option><option>Desativar</option></select></div>
    <div class="sectionFooter">
      <button class="btnCancel">Cancelar</button>
      <button class="btnSave">Salvar</button>
    </div>
  `,
  appearance: `
    <h2>Aparência</h2>
    <div class="form-group">
      <label>Tema</label>
      <button id="toggleThemeBtnModal">Dark / Light</button>
    </div>
    <div class="sectionFooter">
      <button class="btnCancel">Cancelar</button>
      <button class="btnSave">Salvar</button>
    </div>
  `,
  language: `
    <h2>Linguagem</h2>
    <div class="form-group">
      <label>Idioma do Site</label>
      <select id="langSelect">
        <option value="pt">Português</option>
        <option value="en">Inglês</option>
        <option value="es">Espanhol</option>
      </select>
    </div>
    <div class="sectionFooter"><button class="btnCancel">Cancelar</button><button class="btnSave">Salvar</button></div>
  `,
  connections: `
    <h2>Conexão</h2>
    <div class="form-group"><label>Adicionar Conexão</label><input type="text" placeholder="Discord, Steam, Instagram..."></div>
    <div class="sectionFooter">
      <button class="btnCancel">Cancelar</button>
      <button class="btnSave">Salvar</button>
    </div>
  `,
  deletion: `
    <h2>Exclusão</h2>
    <div class="form-group"><label>Desativar/Excluir Conta</label><button class="btn-excluir">Excluir Conta</button></div>
    <div class="sectionFooter">
      <button class="btnCancel">Cancelar</button>
    </div>
  `,
};

sidebarButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    if (sections[section]) {
      modalSection.innerHTML = sections[section];
      // Rebind close button dentro da nova seção
      modalSection.querySelector('.btnCancel').addEventListener('click', () => {
        settingsModal.classList.remove('show');
      });
    }
  });
});

// =======================================
// FUNÇÃO PARA RENDERIZAR SEÇÃO
// =======================================
function loadSection(section) {
  const modalSection = document.getElementById('modalSection');
  modalSection.innerHTML = sections[section];

  // botão cancelar sempre fecha
  const cancelBtn = modalSection.querySelector('.btnCancel');
  if (cancelBtn)
    cancelBtn.addEventListener('click', () =>
      settingsModal.classList.remove('show')
    );

  // tema
  if (section === 'appearance') {
    const btn = modalSection.querySelector('#toggleThemeBtnModal');
    btn.textContent = savedTheme === 'dark' ? 'Modo Light' : 'Modo Dark';

    btn.addEventListener('click', () => {
      const next =
        document.documentElement.getAttribute('data-theme') === 'light'
          ? 'dark'
          : 'light';
      applyTheme(next);
      btn.textContent = next === 'dark' ? 'Modo Light' : 'Modo Dark';
    });
  }
}

// =======================================
//  THEME SYSTEM (GLOBAL)
// =======================================
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  // Atualiza texto dos botões
  updateThemeButtons(theme);
}

function updateThemeButtons(theme) {
  const footerBtn = document.getElementById('toggleThemeBtnFooter');
  const modalBtn = document.getElementById('toggleThemeBtnModal');

  if (footerBtn) {
    footerBtn.innerHTML = `
      <ion-icon name="${theme === 'dark' ? 'sunny' : 'moon'}"></ion-icon>
      ${theme === 'dark' ? 'Light' : 'Dark'}
    `;
  }

  if (modalBtn) {
    modalBtn.textContent = theme === 'dark' ? 'Modo Light' : 'Modo Dark';
  }
}

// aplica o tema salvo
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

// =======================================
//  BOTÃO DO DROPDOWN PROFILE
// =======================================
const footerToggle = document.getElementById('toggleThemeBtnFooter');

if (footerToggle) {
  footerToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
  });
}

// =======================================
//  QUANDO O MODAL CARREGAR A SEÇÃO APARÊNCIA
// =======================================
function activateModalThemeButton() {
  const modalBtn = document.getElementById('toggleThemeBtnModal');
  if (!modalBtn) return;

  modalBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
  });

  // garante que o botão sempre mostra o estado correto
  updateThemeButtons(document.documentElement.getAttribute('data-theme'));
}

/* ==== M O D A L - S A I R ==== */
const logoutBtn = document.getElementById('logoutBtn');
const logoutModal = document.getElementById('logoutModal');
const cancelLogout = document.getElementById('cancelLogout');
const confirmLogout = document.getElementById('confirmLogout');

// Abrir modal
logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  logoutModal.classList.add('show');
});

// Cancelar
cancelLogout.addEventListener('click', () => {
  logoutModal.classList.remove('show');
});

// Confirmar
confirmLogout.addEventListener('click', () => {
  // Aqui você pode limpar localStorage, cookies, etc.
  localStorage.clear();
  sessionStorage.clear();

  // Redireciona para a homepage
  window.location.href = '/index.html';
});

// Fecha modal clicando fora
logoutModal.addEventListener('click', (e) => {
  if (e.target === logoutModal) {
    logoutModal.classList.remove('show');
  }
});
