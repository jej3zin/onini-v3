function timeout(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

window.addEventListener('load', async () => {
  const preloader = document.getElementById('preloader');

  let slidePromise = loadSlides?.() ?? Promise.resolve();

  // Espera no máximo 2.5s
  await Promise.race([slidePromise, timeout(2500)]);

  preloader.classList.add('hide');

  preloader.addEventListener(
    'transitionend',
    () => {
      preloader.style.display = 'none';
      document.body.style.overflow = 'visible';
    },
    { once: true }
  );
});
