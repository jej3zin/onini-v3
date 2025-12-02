// ====== D R O P D O W N - A N I M A T I O N ======
const dropdown = document.querySelector('.nav-list li.dropdown');
const menu = dropdown.querySelector('.dropdown-menu');

let timeout;

dropdown.addEventListener('mouseenter', () => {
  clearTimeout(timeout);
  menu.classList.add('show'); // adiciona classe que anima
});

dropdown.addEventListener('mouseleave', () => {
  menu.classList.remove('show'); // remove classe que anima
});

// ====== S E A R C H - S Y S T E M ======
const searchInput = document.getElementById('searchInput');
const clearIcon = document.querySelector('.clear-icon');
const searchIcon = document.querySelector('.search-icon');

// Mostra o X quando digitar
searchInput.addEventListener('input', () => {
  if (searchInput.value.trim() !== '') {
    clearIcon.classList.add('show');
  } else {
    clearIcon.classList.remove('show');
  }
});

// Limpa ao clicar no X
clearIcon.addEventListener('click', () => {
  searchInput.value = '';
  clearIcon.classList.remove('show');
  searchInput.focus();
});

// Clique da lupa (dispara busca)
searchIcon.addEventListener('click', () => {
  console.log('Buscando por:', searchInput.value);
  // aqui você coloca sua função de busca real
});

// ====== D R O P D O W N - P R O F I L E ======
const btnUser = document.getElementById('btnUser');
const profileDropdown = document.getElementById('profileDropdown');

// Previne erro caso o HTML ainda não tenha carregado
if (btnUser && profileDropdown) {
  btnUser.addEventListener('click', (e) => {
    e.stopPropagation(); // evita fechar imediatamente
    profileDropdown.classList.toggle('show');
  });

  // Fecha ao clicar fora
  document.addEventListener('click', (e) => {
    if (!profileDropdown.contains(e.target) && !btnUser.contains(e.target)) {
      profileDropdown.classList.remove('show');
    }
  });
} else {
  console.warn('⚠ btnUser ou profileDropdown NÃO existe no DOM.');
}

// Abrir página do perfil
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.viewProfileBtn');
  if (!btn) return;

  window.location.href = '/profile/index.html';
});

// === Search bar ===
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchInput');
  const clearBtn = document.querySelector('.clear-icon');
  const resultsBox = document.getElementById('searchResults');

  let debounceTimer = null;

  // ===== Função que chama a API =====
  async function searchAnime(query) {
    try {
      const res = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=8`
      );
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error('Erro ao buscar:', err);
      return [];
    }
  }

  // ===== Renderizar resultados =====
  function renderResults(list) {
    if (!list || list.length === 0) {
      resultsBox.innerHTML = `<p class="empty-feedback">Nenhum resultado encontrado.</p>`;
      resultsBox.classList.add('show');
      return;
    }

    resultsBox.innerHTML = list
      .map((anime) => {
        const img =
          anime.images?.jpg?.image_url || '/public/asset/id/Yoru-poster.webp';

        return `
          <div class="result-card">
            <img src="${img}" alt="${anime.title}" />
            <span>${anime.title}</span>
          </div>
        `;
      })
      .join('');

    resultsBox.classList.add('show');
  }

  // ===== Evento de digitação (com debounce) =====
  input.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    clearTimeout(debounceTimer);

    if (query === '') {
      resultsBox.classList.remove('show');
      resultsBox.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(async () => {
      const results = await searchAnime(query);
      renderResults(results);
    }, 400);
  });

  // ===== Limpar input =====
  clearBtn.addEventListener('click', () => {
    input.value = '';
    input.focus();
    resultsBox.classList.remove('show');
    resultsBox.innerHTML = '';
  });

  // ===== Fechar resultados clicando fora =====
  document.addEventListener('click', (e) => {
    if (
      !e.target.closest('.boxSearch') &&
      !e.target.closest('#searchResults')
    ) {
      resultsBox.classList.remove('show');
    }
  });
});
