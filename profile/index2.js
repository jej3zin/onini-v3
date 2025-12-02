/* =========================================================
   HELPERS (rate-limited fetch + getData)
   - mantém compatibilidade com Jikan API
========================================================= */
let queue = Promise.resolve();
function rateLimitedFetch(url) {
  queue = queue.then(
    () =>
      new Promise((resolve) => {
        setTimeout(() => resolve(fetch(url)), 420);
      })
  );
  return queue;
}

async function getData(url, retries = 2) {
  try {
    const response = await rateLimitedFetch(url);
    if (response.status === 429 && retries > 0) {
      await new Promise((r) => setTimeout(r, 1000));
      return getData(url, retries - 1);
    }
    if (!response.ok) {
      console.warn('Falha ao carregar', url, response.status);
      return null;
    }
    const json = await response.json();
    return json?.data ?? null;
  } catch (err) {
    console.error('Erro ao buscar', url, err);
    return null;
  }
}

/* =========================================================
   STATIC USERS (profiles)
========================================================= */
const users = {
  Yuro: {
    key: 'Yuro',
    name: 'Yuro 🧡',
    role: 'Trabalho',
    avatar: '/public/asset/id/Yoru-Square.webp',
    banner: '/public/asset/id/Yoru-Banner.webp',
    bio: 'Fã de animes, Dev front-end e Criador de conteúdo.',
    posts: [
      {
        id: 1,
        title: 'O que acharam da nova atualização?',
        img: '/public/asset/id/sample1.webp',
      },
    ],
    favorites: [1, 5114, 11061],
    library: [1, 5114, 11061],
    followers: 2,
    following: 0,
    online: true,
  },
  jaison: {
    key: 'jaison',
    name: 'Jaison',
    role: 'Estudante',
    avatar: '/public/asset/id/jaison-Square.webp',
    banner: '/public/asset/id/jaison-banner.webp',
    bio: 'O cara que realmente assiste tudo.',
    posts: [
      { id: 1, title: 'Anime do dia', img: '/public/asset/id/sample1.webp' },
      { id: 2, title: 'Top 5 da semana', img: '/public/asset/id/sample2.webp' },
    ],
    favorites: [1, 5114, 50265],
    library: [1, 74, 11061, 50265],
    following: 1,
    followers: 189,
    online: true,
  },
  ada: {
    key: 'ada',
    name: 'Ada Wong',
    role: 'Cosplayer',
    avatar: '/public/asset/id/adaWong-Square.webp',
    banner: '/public/asset/id/adaWong-banner.webp',
    bio: 'Elegância, precisão e animes nas horas vagas.',
    posts: [
      {
        id: 3,
        title: 'Cosplay novo 🔥',
        img: '/public/asset/id/Ada-Wong-Cosplay.webp',
      },
    ],
    favorites: [11061],
    library: [11061, 1],
    following: 1,
    followers: 987,
    online: false,
  },
};

/* =========================================================
   DOM REFS (guardados com checagem)
========================================================= */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const profileBanner = $('#profileBanner');
const profileAvatarWrap = $('#profileAvatar'); // container
const profileAvatarImg = $('#profileAvatar img');
const profileName = $('#profileName');
const profileRole = $('#profileRole');
const profileMeta = $('#profileMeta');
const profileBio = $('#profileBio');

const statFollowing = $('#statFollowing');
const statFollowers = $('#statFollowers') || null;
const statPosts = $('#statPosts');
const statLibrary = $('#statLibrary');
const statFav = $('#statFav');

const profileFeed = $('#profileFeed');
const feedEmpty = $('#feedEmpty') || null;

const libraryGrid = $('#libraryGrid');
const libraryEmpty = $('#libraryEmpty') || null;
const libFilterButtons = $$('.lib-btn');

const favoritesGrid = $('#favoritesGrid');
const favEmpty = $('#favEmpty');

const friendsGrid = $('#friendsGrid');
const friendsTable = $('#friendsTable');

const animeModal = $('#animeModal');

/* =========================================================
   MODAL SYSTEM (anime modal)
========================================================= */
function openAnimeModal(anime) {
  if (!animeModal) return;

  animeModal.querySelector('.modal-title').textContent = anime.title || '-';
  animeModal.querySelector('.modal-alt-title').textContent =
    anime.title_english || anime.title_japanese || '-';

  animeModal.querySelector('.modal-synopsis').textContent =
    anime.synopsis || 'Sem sinopse';

  animeModal.querySelector('.modal-score').textContent = anime.score
    ? `Avaliação: ${anime.score}`
    : 'Avaliação: -';

  animeModal.querySelector('.modal-tags').textContent =
    anime.genres?.map((g) => g.name).join(', ') || '-';

  const cover = animeModal.querySelector('.modal-cover');
  if (cover)
    cover.src =
      anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';

  const saveBtn = animeModal.querySelector('.saveAnimeBtn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      // placeholder: evitar salvar automático, só console por enquanto
      console.log('Salvar anime (placeholder):', anime.mal_id);
      // Você pode implementar adicionar aos favoritos aqui
    };
  }
  const discardBtn = animeModal.querySelector('.discardAnimeBtn');
  if (discardBtn)
    discardBtn.onclick = () => animeModal.classList.remove('open');

  animeModal.classList.add('open');
}

/* Utility to close modals by clicking overlay or ESC */
document.querySelectorAll('.modal').forEach((m) =>
  m.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) m.classList.remove('open');
  })
);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape')
    document
      .querySelectorAll('.modal.open')
      .forEach((m) => m.classList.remove('open'));
});

/* =========================================================
   LIBRARY SYSTEM (load items, filter favorites)
   - carrega dados via Jikan para cada mal_id
========================================================= */
async function renderLibraryCards(ids = []) {
  if (!libraryGrid) return;
  libraryGrid.innerHTML = '';
  if (!ids || ids.length === 0) {
    if (libraryEmpty) libraryEmpty.style.display = '';
    return;
  }
  if (libraryEmpty) libraryEmpty.style.display = 'none';

  // fetch todos em paralelo com rate limiting gerenciado por getData
  const promises = ids.map((id) =>
    getData(`https://api.jikan.moe/v4/anime/${id}`)
  );
  const results = await Promise.all(promises);

  const cards = results
    .map((anime) => {
      if (!anime) return null;
      const img =
        anime.images?.jpg?.image_url || '/public/asset/id/Yoru-poster.webp';
      const title =
        anime.title || anime.title_english || anime.title_japanese || '—';
      return `
        <div class="card-wrapp lib-card" data-id="${anime.mal_id}">
          <img src="${img}" alt="${title}" loading="lazy" />
          <h3 title="${title}">${title}</h3>
        </div>
      `;
    })
    .filter(Boolean)
    .join('');

  libraryGrid.innerHTML = cards;

  // enable clicking on cards to open modal
  libraryGrid.querySelectorAll('.lib-card').forEach((el) => {
    el.addEventListener('click', async () => {
      const id = el.dataset.id;
      const anime = await getData(`https://api.jikan.moe/v4/anime/${id}`);
      if (anime) openAnimeModal(anime);
    });
  });
}

/* =========================================================
   FAVORITES GRID (render simples)
========================================================= */
async function renderFavorites(ids = []) {
  if (!favoritesGrid) return;
  favoritesGrid.innerHTML = '';
  if (!ids || ids.length === 0) {
    if (favEmpty) favEmpty.style.display = '';
    return;
  }
  if (favEmpty) favEmpty.style.display = 'none';

  const promises = ids.map((id) =>
    getData(`https://api.jikan.moe/v4/anime/${id}`)
  );
  const results = await Promise.all(promises);

  const cards = results
    .map((anime) => {
      if (!anime) return null;
      const img =
        anime.images?.jpg?.image_url || '/public/asset/id/Yoru-poster.webp';
      const title =
        anime.title || anime.title_english || anime.title_japanese || '—';
      return `
        <div class="card-wrapp fav-card" data-id="${anime.mal_id}">
          <img src="${img}" alt="${title}" loading="lazy" />
          <h3 title="${title}">${title}</h3>
        </div>
      `;
    })
    .filter(Boolean)
    .join('');

  favoritesGrid.innerHTML = cards;

  // open modal on click
  favoritesGrid.querySelectorAll('.fav-card').forEach((el) => {
    el.addEventListener('click', async () => {
      const id = el.dataset.id;
      const anime = await getData(`https://api.jikan.moe/v4/anime/${id}`);
      if (anime) openAnimeModal(anime);
    });
  });
}

/* =========================================================
   FEED SYSTEM (profile posts grid)
========================================================= */
function renderFeed(posts = []) {
  if (!profileFeed) return;
  profileFeed.innerHTML = '';
  if (!posts || posts.length === 0) {
    if (feedEmpty) feedEmpty.style.display = '';
    return;
  }
  if (feedEmpty) feedEmpty.style.display = 'none';

  posts.forEach((p) => {
    const el = document.createElement('div');
    el.className = 'feed-item';
    el.innerHTML = `
      ${p.img ? `<img src="${p.img}" alt="${p.title}" />` : ''}
      <div class="feed-title">${p.title}</div>
    `;
    // clicking feed item can show a modal placeholder (or navigate)
    el.addEventListener('click', () => {
      if (p.animeId) {
        getData(`https://api.jikan.moe/v4/anime/${p.animeId}`).then(
          (a) => a && openAnimeModal(a)
        );
      } else {
        // placeholder
        console.log('Feed clicked:', p.title);
      }
    });
    profileFeed.appendChild(el);
  });
}

/* =========================================================
   FRIENDS SYSTEM (single implementation: grid + table)
   - friends array uses index as unique id
========================================================= */
const friends = [
  {
    name: 'Yuro 🧡',
    avatar: '/public/asset/id/Yoru-Square.webp',
    online: true,
  },
  {
    name: 'Jaison',
    avatar: '/public/asset/id/jaison-Square.webp',
    online: false,
  },
  {
    name: 'Ada Wong',
    avatar: '/public/asset/id/adaWong-Square.webp',
    online: true,
  },
];

function renderFriends() {
  const grid = friendsGrid;
  const table = friendsTable;

  // empty state
  if (!friends || friends.length === 0) {
    if (table)
      table.innerHTML = `
        <tr><td colspan="2" style="text-align:center; padding:12px; color:var(--muted)">
          Nenhum amigo ainda :(
        </td></tr>`;
    if (grid)
      grid.innerHTML = `<div style="padding:12px; color:var(--muted)">Nenhum amigo ainda :(</div>`;
    return;
  }

  // GRID
  if (grid) {
    grid.innerHTML = '';
    friends.forEach((fr, i) => {
      const card = document.createElement('div');
      card.className = 'friend-card';
      card.innerHTML = `
        <div class="friend-avatar">
          <img src="${fr.avatar}" alt="${fr.name}">
        </div>
        <div class="friend-info">
          <div class="friend-name">${fr.name}</div>
          <div class="friend-status ${
            fr.online ? 'status-online' : 'status-offline'
          }">
            ${fr.online ? 'Online' : 'Offline'}
          </div>
        </div>
        <div class="friend-actions">
          <button class="friend-btn visit" data-id="${i}" title="Visitar perfil">
            <ion-icon name="eye"></ion-icon>
          </button>
          <button class="friend-btn remove" data-id="${i}" title="Remover">
            <ion-icon name="person-remove"></ion-icon>
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // TABLE
  if (table) {
    table.innerHTML = friends
      .map(
        (f, i) => `
      <tr class="friend-row" data-id="${i}">
        <td>
          <div class="friend-info">
            <img class="friend-avatar" src="${f.avatar}" />
            <span>${f.name}</span>
          </div>
        </td>
        <td>
          <div class="friend-actions">
            <button class="f-btn visit" data-id="${i}" title="Visitar perfil">
              <ion-icon name="eye"></ion-icon>
            </button>
            <button class="f-btn remove" data-id="${i}" title="Remover">
              <ion-icon name="person-remove"></ion-icon>
            </button>
            <button class="f-btn block" data-id="${i}" title="Bloquear">
              <ion-icon name="ban"></ion-icon>
            </button>
          </div>
        </td>
      </tr>
    `
      )
      .join('');
  }
}

function removeFriend(id) {
  if (id == null || id < 0 || id >= friends.length) return;
  friends.splice(id, 1);
  renderFriends();
}

function blockFriend(id) {
  if (id == null) return;
  alert('Usuário bloqueado.');
  removeFriend(id);
}

function visitFriend(id) {
  if (id == null) return;
  // aqui navegamos para profile.html com query param baseado em nome (ou key)
  const f = friends[id];
  // tenta encontrar key correspondente nos users
  const key = Object.keys(users).find((k) => users[k].name === f.name) || null;
  if (key) {
    window.location.href = `/profile.html?user=${encodeURIComponent(key)}`;
  } else {
    // fallback simples: alert
    alert('Visitar: ' + f.name);
  }
}

/* Global click delegation for friend actions */
document.addEventListener('click', (e) => {
  const visit = e.target.closest('.visit');
  const remove = e.target.closest('.remove');
  const block = e.target.closest('.block');

  if (visit) visitFriend(parseInt(visit.dataset.id));
  if (remove) removeFriend(parseInt(remove.dataset.id));
  if (block) blockFriend(parseInt(block.dataset.id));
});

/* =========================================================
   PROFILE RENDER (static users) - main loadProfile()
   - defaultKey = 'Yuro'
   - loads profile header, feed, library, favorites and friends
========================================================= */
async function loadProfile(userKey = 'Yuro') {
  const u = users[userKey];
  if (!u) {
    console.warn('Perfil não encontrado:', userKey);
    return;
  }

  // header
  if (profileName) profileName.textContent = u.name;
  if (profileBio) profileBio.textContent = u.bio;
  if (profileAvatarImg) profileAvatarImg.src = u.avatar;
  if (profileBanner) profileBanner.style.backgroundImage = `url('${u.banner}')`;
  if (profileRole) profileRole.textContent = u.role || '';
  if (statFollowing) statFollowing.textContent = u.following ?? 0;
  if (statFollowers) statFollowers.textContent = u.followers ?? 0;
  if (statPosts) statPosts.textContent = (u.posts || []).length;
  if (statLibrary) statLibrary.textContent = (u.library || []).length;
  if (statFav) statFav.textContent = (u.favorites || []).length;

  // feed
  renderFeed(u.posts || []);

  // library - default: recentes
  await renderLibraryCards(u.library || []);

  // favorites
  await renderFavorites(u.favorites || []);

  // friends view (same friends list for every profile - could be customized)
  renderFriends();
}

/* =========================================================
   LIBRARY FILTER BUTTONS (Favoritos / Recentes)
========================================================= */
if (libFilterButtons && libFilterButtons.length > 0) {
  libFilterButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      libFilterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      // current profile key can be derived from profileName text (or store currentKey)
      const key = Object.keys(users).find(
        (k) => users[k].name === (profileName?.textContent || '')
      );
      if (!key) return;
      const u = users[key];
      if (!u) return;
      const items =
        filter === 'favoritos'
          ? u.library.filter((id) => (u.favorites || []).includes(id))
          : u.library;
      await renderLibraryCards(items);
    });
  });
}

/* =========================================================
   NAV: clicking avatar or name opens profile in separate page (current user)
========================================================= */
if (profileAvatarWrap) {
  profileAvatarWrap.addEventListener('click', () => {
    window.location.href = `/profile.html?user=${encodeURIComponent('Yuro')}`;
  });
}
if (profileName) {
  profileName.addEventListener('click', () => {
    window.location.href = `/profile.html?user=${encodeURIComponent('Yuro')}`;
  });
}

/* =========================================================
   INIT
========================================================= */
(async function init() {
  // default profile requested by you: Yuro
  await loadProfile('Yuro');

  // render friends initially
  renderFriends();

  // attach modal close handlers already above
})();
