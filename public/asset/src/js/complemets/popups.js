let popupTimeout;

function showError(message) {
  const popup = document.getElementById('popupError');
  const popupMsg = document.getElementById('popupMessage');

  popupMsg.textContent = message;
  popup.classList.add('active');

  // Cancela timers antigos se clicar várias vezes
  clearTimeout(popupTimeout);

  popupTimeout = setTimeout(() => {
    popup.classList.remove('active');
  }, 3000);
}
