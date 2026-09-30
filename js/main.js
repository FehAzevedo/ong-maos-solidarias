// Ponto de entrada do JavaScript do site (carregado como módulo em todas as páginas).
// Módulos são adiados por padrão: este código roda depois que o HTML foi lido.

import { iniciarMenu } from './modules/menu.js';
import { iniciarRoteador } from './modules/roteador.js';
import { renderizarTemplates } from './modules/templates.js';
import { iniciarFeedback, mostrarToast } from './modules/feedback.js';
import { iniciarFormulario } from './modules/formulario.js';
import { iniciarHistorico } from './modules/persistencia.js';
import { iniciarMapa } from './modules/mapa.js';

// Liga os comportamentos do conteúdo de uma página. Roda na primeira carga e de
// novo a cada troca de página feita pelo roteador, só dentro do <main> novo.
// Os templates vêm primeiro: o formulário valida os checkboxes gerados por eles.
function iniciarPagina(raiz) {
  renderizarTemplates(raiz);
  iniciarFormulario(raiz);
  iniciarHistorico(raiz);
  iniciarMapa(raiz);
}

// Ouvintes globais (delegação no document): ligados uma única vez
iniciarMenu();
iniciarFeedback();
iniciarPagina(document.getElementById('conteudo'));
iniciarRoteador(iniciarPagina, function () {
  mostrarToast('Não foi possível abrir a página. Verifique sua conexão e tente de novo.', 'erro');
});

// Link direto para um card gerado (ex.: projetos.html#reforco-escolar): o
// navegador tenta rolar antes de o card existir, então a rolagem é refeita aqui
if (location.hash) {
  document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}
