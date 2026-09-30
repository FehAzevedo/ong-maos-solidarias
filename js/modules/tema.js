// Módulo do seletor de tema: Automático, Claro, Escuro ou Alto contraste.
//
// O tema é o atributo data-tema no <html>; o CSS redefine as variáveis de cor
// para cada valor. "Automático" remove o atributo e deixa o CSS seguir a
// preferência do sistema (prefers-color-scheme e prefers-contrast).
// A escolha fica no localStorage. Um script curto no <head> de cada página
// aplica o tema salvo antes do CSS ser desenhado, para a página não "piscar"
// no tema claro ao carregar.

import { salvar, carregar } from './armazenamento.js';

const TEMAS = ['automatico', 'claro', 'escuro', 'alto-contraste'];

function aplicarTema(tema) {
  if (tema === 'automatico') {
    delete document.documentElement.dataset.tema;
  } else {
    document.documentElement.dataset.tema = tema;
  }
}

// O seletor fica no cabeçalho, que a SPA não troca: é iniciado uma única vez
export function iniciarTema() {
  const seletor = document.getElementById('seletor-tema');
  if (!seletor) return;

  const salvo = carregar('tema', 'automatico');
  const tema = TEMAS.includes(salvo) ? salvo : 'automatico';   // ignora valores inválidos
  seletor.value = tema;
  aplicarTema(tema);

  seletor.addEventListener('change', function () {
    aplicarTema(seletor.value);
    salvar('tema', seletor.value);
  });
}
