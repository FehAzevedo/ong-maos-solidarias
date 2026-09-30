// Ponto de entrada do JavaScript do site (carregado como módulo em todas as páginas).
// Módulos são adiados por padrão: este código roda depois que o HTML foi lido.

import { iniciarMenu } from './modules/menu.js';
import { iniciarRoteador } from './modules/roteador.js';
import { renderizarTemplates } from './modules/templates.js';
import { ativarFeedback } from './modules/feedback.js';
import { iniciarFormulario } from './modules/formulario.js';

// Liga os comportamentos do conteúdo de uma página. Roda na primeira carga e de
// novo a cada troca de página feita pelo roteador, só dentro do <main> novo.
// Os templates vêm primeiro: o formulário valida os checkboxes gerados por eles.
function iniciarPagina(raiz) {
  renderizarTemplates(raiz);
  ativarFeedback(raiz);
  iniciarFormulario(raiz);
}

iniciarMenu();
iniciarPagina(document.getElementById('conteudo'));
iniciarRoteador(iniciarPagina);

// Link direto para um card gerado (ex.: projetos.html#reforco-escolar): o
// navegador tenta rolar antes de o card existir, então a rolagem é refeita aqui
if (location.hash) {
  document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}
