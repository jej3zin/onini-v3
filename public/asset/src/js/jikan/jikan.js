// ======== Rate Limit ========
let queue = Promise.resolve();

function rateLimitedFetch(url) {
  queue = queue.then(
    () =>
      new Promise((resolve) => {
        setTimeout(() => resolve(fetch(url)), 500);
      })
  );
  return queue;
}

// ======== Fetch Jikan com retry ========
async function getData(url, retries = 3) {
  try {
    const response = await rateLimitedFetch(url);

    if (response.status === 429 && retries > 0) {
      console.warn('429 → retry:', url);
      await new Promise((r) => setTimeout(r, 1200));
      return getData(url, retries - 1);
    }

    if (!response.ok) {
      console.warn('Falha ao carregar:', url, 'Status:', response.status);
      return [];
    }

    const json = await response.json();
    return json?.data ?? [];
  } catch (err) {
    console.error('Erro ao buscar:', url, err);
    return [];
  }
}

// ======== Render de Slides ========
function renderSlide(id, data) {
  const container = document.getElementById(id);
  if (!container) return;

  if (!Array.isArray(data) || data.length === 0) {
    container.innerHTML = `<p class="empty-feedback">Nenhum anime encontrado.</p>`;
    return;
  }

  container.innerHTML = data
    .map((anime) => {
      const img =
        anime.images?.jpg?.image_url || '/public/asset/id/Yoru-poster.webp';
      const title =
        anime.title || anime.title_english || anime.title_japanese || 'Yoru';
      const id = anime.mal_id;

      return `
        <div class="card-wrapp" data-id="${id}">
          <img src="${img}" alt="${title}" loading="lazy" />
          <h3>${title}</h3>
        </div>
      `;
    })
    .join('');
}

// ======== Load Slides ========
window.loadSlides = async function () {
  renderSlide(
    'slide-season',
    await getData('https://api.jikan.moe/v4/seasons/now')
  );
  renderSlide(
    'slide-trending',
    await getData('https://api.jikan.moe/v4/top/anime?filter=bypopularity')
  );
  renderSlide(
    'slide-2025',
    await getData(
      'https://api.jikan.moe/v4/anime?start_date=2025-01-01&end_date=2025-12-31'
    )
  );
  renderSlide(
    'slide-top',
    await getData('https://api.jikan.moe/v4/top/anime?ranking=score')
  );
  renderSlide(
    'slide-recent',
    await getData('https://api.jikan.moe/v4/watch/episodes')
  );
};

// ======== Modal ========
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('animeModal');
  if (!modal) return;

  function openModal(anime) {
    modal.querySelector('.modal-title').textContent = anime.title || '-';
    modal.querySelector('.modal-alt-title').textContent =
      anime.title_english || anime.title_japanese || '-';
    modal.querySelector('.modal-synopsis').textContent =
      anime.synopsis || 'Sem sinopse';
    modal.querySelector('.modal-score').textContent = anime.score
      ? `Avaliação: ${anime.score}`
      : 'Avaliação: -';
    modal.querySelector('.modal-tags').textContent =
      anime.genres?.map((g) => g.name).join(', ') || '-';
    modal.classList.add('open');
  }

  // Fechar modal clicando no X
  modal.querySelector('.modal-close').addEventListener('click', () => {
    modal.classList.remove('open');
  });

  // Fechar clicando fora do conteúdo
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      modal.classList.remove('open');
    }
  });

  // Delegação: abrir modal ao clicar em card
  document.addEventListener('click', async (e) => {
    const card = e.target.closest('.card-wrapp');
    if (!card) return;

    const id = card.dataset.id;
    if (!id) return;

    try {
      const res = await getData(`https://api.jikan.moe/v4/anime/${id}`);
      if (res?.data) openModal(res.data);
    } catch (err) {
      console.error('Erro ao buscar anime:', err);
    }
  });
});

// Delegação de evento para cards dinâmicos
document.addEventListener('click', async (e) => {
  const card = e.target.closest('.card-wrapp');
  if (!card) return;

  const id = card.dataset.id;
  if (!id) return;

  try {
    const res = await getData(`https://api.jikan.moe/v4/anime/${id}`);
    if (res?.data) openModal(res.data);
  } catch (err) {
    console.error('Erro ao buscar anime:', err);
  }
});

// ======== Smooth Scroll e Setas ========
document.addEventListener('DOMContentLoaded', () => {
  const blocks = document.querySelectorAll(
    '.slide-block, .slide-section, .slides-section'
  );
  const animMap = new WeakMap();

  function animateScroll(element, distance, duration = 450) {
    const prev = animMap.get(element);
    if (prev && prev.rafId) cancelAnimationFrame(prev.rafId);

    const start = element.scrollLeft;
    const end = start + distance;
    const startTime = performance.now();

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    let rafId = null;
    function frame(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(t);
      element.scrollLeft = Math.round(start + (end - start) * eased);

      if (t < 1) {
        rafId = requestAnimationFrame(frame);
        animMap.set(element, { rafId });
      } else {
        animMap.delete(element);
      }
    }

    rafId = requestAnimationFrame(frame);
    animMap.set(element, { rafId });
  }

  blocks.forEach((block) => {
    const slide = block.querySelector('.slide-01');
    if (!slide) return;

    const left = block.querySelector('.arrow.left');
    const right = block.querySelector('.arrow.right');

    const firstCard = slide.querySelector('.card-wrapp');
    const cardW = firstCard ? firstCard.offsetWidth : 160;
    const cs = getComputedStyle(slide);
    const gap = parseInt(cs.gap || cs.rowGap || '0', 10) || 16;

    const calcStep = () =>
      Math.min(cardW * 3 + gap * 2, Math.round(slide.clientWidth * 0.75));
    const step = calcStep();

    if (left)
      left.addEventListener('click', (e) => {
        e.preventDefault();
        animateScroll(slide, -step);
      });
    if (right)
      right.addEventListener('click', (e) => {
        e.preventDefault();
        animateScroll(slide, step);
      });

    block.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        animateScroll(slide, -step);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        animateScroll(slide, step);
      }
    });

    if (!block.hasAttribute('tabindex')) block.setAttribute('tabindex', '0');
  });
});
