// Menu de navegação responsivo.
// Em telas pequenas, o botão "Menu" abre e fecha a lista de links (aria-expanded).
// Sem JavaScript a classe .menu-recolhivel não é aplicada: o botão fica oculto
// e o menu permanece sempre visível, então a navegação nunca se perde.

document.addEventListener('DOMContentLoaded', function () {
  const cabecalho = document.querySelector('.cabecalho');
  const botao = cabecalho.querySelector('.menu-botao');

  cabecalho.classList.add('menu-recolhivel');

  function menuAberto() {
    return botao.getAttribute('aria-expanded') === 'true';
  }

  botao.addEventListener('click', function () {
    botao.setAttribute('aria-expanded', String(!menuAberto()));
  });

  // Esc fecha o menu e devolve o foco ao botão
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && menuAberto()) {
      botao.setAttribute('aria-expanded', 'false');
      botao.focus();
    }
  });
});
