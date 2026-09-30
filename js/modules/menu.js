// Módulo do menu de navegação responsivo.
// Em telas pequenas, o botão "Menu" abre e fecha a lista de links (aria-expanded).
// O script no <head> de cada página aplica a classe "js" no <html> antes da
// primeira renderização; sem JavaScript (ou sem suporte a módulos) ela não
// existe: o botão fica oculto e o menu sempre visível, e a navegação nunca se perde.
// O dropdown do desktop abre só com CSS (:hover e :focus-within); aqui o
// script apenas permite fechá-lo com Esc.

// O cabeçalho não é trocado pela SPA, então o menu é iniciado uma única vez.
export function iniciarMenu() {
  const cabecalho = document.querySelector('.cabecalho');
  const botao = cabecalho.querySelector('.menu-botao');
  const menu = document.getElementById('menu-principal');
  const itensComSubmenu = cabecalho.querySelectorAll('.tem-submenu');

  function menuAberto() {
    return botao.getAttribute('aria-expanded') === 'true';
  }

  function fecharMenu() {
    botao.setAttribute('aria-expanded', 'false');
  }

  botao.addEventListener('click', function () {
    botao.setAttribute('aria-expanded', String(!menuAberto()));
  });

  // Ao escolher um link (inclusive âncoras da mesma página), o menu fecha
  menu.addEventListener('click', function (evento) {
    if (evento.target.closest('a')) fecharMenu();
  });

  // O submenu fechado com Esc volta a funcionar quando o mouse ou o foco saem dele
  itensComSubmenu.forEach(function (item) {
    item.addEventListener('mouseleave', function () {
      item.classList.remove('submenu-fechado');
    });
    item.addEventListener('focusout', function (evento) {
      if (!item.contains(evento.relatedTarget)) item.classList.remove('submenu-fechado');
    });
  });

  // Esc fecha o menu do celular (e devolve o foco ao botão) ou o dropdown do desktop
  document.addEventListener('keydown', function (evento) {
    if (evento.key !== 'Escape') return;

    if (menuAberto()) {
      fecharMenu();
      botao.focus();
      return;
    }

    itensComSubmenu.forEach(function (item) {
      if (item.matches(':hover, :focus-within')) {
        item.classList.add('submenu-fechado');
        item.querySelector('a').focus();
      }
    });
  });
}
