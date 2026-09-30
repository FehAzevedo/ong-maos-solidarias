// Módulo de templates: transforma os dados de /js/dados em elementos na tela.
//
// Método: a marcação de cada componente fica num <template> do HTML5 (não é
// exibido nem carregado pelo navegador). Para cada item dos dados, o script:
//   1. clona o conteúdo do template (content.cloneNode(true));
//   2. preenche os campos marcados com data-campo usando textContent e
//      atributos (nunca innerHTML, então texto vindo de fora não vira código);
//   3. junta os clones num DocumentFragment;
//   4. insere o fragmento no contêiner de uma vez só (um único redesenho).

import { projetos } from '../dados/projetos.js';
import { estados } from '../dados/estados.js';

// Clona o template e devolve o elemento raiz do clone e um atalho para os campos
function clonar(modelo) {
  const elemento = modelo.content.firstElementChild.cloneNode(true);
  const campo = function (nome) {
    return elemento.querySelector('[data-campo="' + nome + '"]');
  };
  return { elemento, campo };
}

function criarItemDeLista(texto) {
  const item = document.createElement('li');
  item.textContent = texto;
  return item;
}

// Card completo de um projeto (página de projetos)
function criarCardProjeto(modelo, projeto) {
  const { elemento: card, campo } = clonar(modelo);
  const caminhoImagem = '../imagens/' + projeto.imagem.arquivo;

  card.id = projeto.id;   // âncora usada pelo submenu (projetos.html#cozinha-solidaria)
  campo('titulo').textContent = projeto.titulo;
  campo('categoria').textContent = projeto.categoria;
  campo('situacao').textContent = projeto.situacao.texto;
  campo('situacao').classList.add('badge--' + projeto.situacao.tipo);
  campo('imagem-webp').srcset = caminhoImagem + '.webp';
  campo('imagem').src = caminhoImagem + '.jpg';
  campo('imagem').alt = projeto.imagem.alt;
  campo('legenda').textContent = projeto.legenda;
  campo('descricao').textContent = projeto.descricao;
  campo('detalhes').append(...projeto.detalhes.map(criarItemDeLista));
  return card;
}

// Opção de checkbox "Projetos de interesse" (cadastro)
function criarOpcaoProjeto(modelo, projeto) {
  const { elemento: opcao, campo } = clonar(modelo);
  campo('checkbox').value = projeto.id;
  campo('titulo').textContent = projeto.titulo;
  return opcao;
}

// Gera um componente por item de "dados" dentro do contêiner, a partir do template
function renderizarLista(raiz, idContainer, idModelo, dados, criar) {
  const container = raiz.querySelector('#' + idContainer);
  const modelo = raiz.querySelector('#' + idModelo);
  if (!container || !modelo) return;

  const fragmento = document.createDocumentFragment();
  dados.forEach(function (item) {
    fragmento.append(criar(modelo, item));
  });
  container.replaceChildren(fragmento);
}

// <option> dos estados: elemento simples, criado direto com new Option()
function renderizarEstados(raiz) {
  const select = raiz.querySelector('#estado');
  if (!select || select.options.length > 1) return;
  select.append(...estados.map(function ([sigla, nome]) {
    return new Option(nome, sigla);
  }));
}

// Chamado a cada página renderizada; só gera o que existir nela
export function renderizarTemplates(raiz) {
  renderizarLista(raiz, 'lista-projetos', 'modelo-card-projeto', projetos, criarCardProjeto);
  renderizarLista(raiz, 'opcoes-projetos', 'modelo-opcao-projeto', projetos, criarOpcaoProjeto);
  renderizarEstados(raiz);
}
