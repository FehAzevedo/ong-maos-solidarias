// Módulo de persistência do cadastro no localStorage:
//   - rascunho: objeto com os valores do formulário, salvo enquanto a pessoa
//     preenche e restaurado ao voltar à página;
//   - histórico: array com os cadastros enviados neste navegador.
// Os dados lidos são conferidos antes do uso (versão e tipos). Qualquer coisa
// fora do formato esperado é descartada, em vez de quebrar a página.

import { salvar, carregar, remover } from './armazenamento.js';
import { mostrarToast } from './feedback.js';
import { projetos } from '../dados/projetos.js';

const CHAVE_RASCUNHO = 'rascunho-cadastro';
const CHAVE_HISTORICO = 'cadastros-enviados';
const VERSAO = 1;
const LIMITE_HISTORICO = 10;

// CPF é dado sensível (o computador pode ser compartilhado) e o aceite dos
// termos precisa ser dado a cada envio: nenhum dos dois vai para o rascunho
const CAMPOS_NAO_SALVOS = ['cpf', 'termos'];

const NOMES_DISPONIBILIDADE = { manha: 'Manhã', tarde: 'Tarde', sabado: 'Sábados' };
const formatarData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

// ---------- Formulário <-> objeto ----------

// Lê o formulário para um objeto simples: texto como string,
// grupos de checkbox como array de valores e radio como o valor marcado
function lerCampos(form) {
  const campos = {};
  Array.from(form.elements).forEach(function (el) {
    if (!el.name || CAMPOS_NAO_SALVOS.includes(el.name)) return;
    if (el.type === 'checkbox') {
      campos[el.name] = campos[el.name] || [];
      if (el.checked) campos[el.name].push(el.value);
    } else if (el.type === 'radio') {
      if (el.checked) campos[el.name] = el.value;
    } else {
      campos[el.name] = el.value;
    }
  });
  return campos;
}

function preencherCampos(form, campos) {
  Object.entries(campos).forEach(function ([nome, valor]) {
    if (CAMPOS_NAO_SALVOS.includes(nome)) return;
    if (Array.isArray(valor)) {
      form.querySelectorAll('input[name="' + nome + '"]').forEach(function (opcao) {
        opcao.checked = valor.includes(opcao.value);
      });
      return;
    }
    const controle = form.elements.namedItem(nome);
    if (controle) controle.value = valor;   // em radios (RadioNodeList), marca a opção com esse valor
  });
}

function temConteudo(campos) {
  return Object.values(campos).some(function (valor) {
    return Array.isArray(valor) ? valor.length > 0 : String(valor).trim() !== '';
  });
}

// ---------- Rascunho ----------

function rascunhoValido(dados) {
  if (!dados || dados.versao !== VERSAO || Number.isNaN(Date.parse(dados.salvoEm))) return false;
  if (typeof dados.campos !== 'object' || dados.campos === null || Array.isArray(dados.campos)) return false;
  return Object.values(dados.campos).every(function (valor) {
    return typeof valor === 'string' ||
      (Array.isArray(valor) && valor.every(function (item) { return typeof item === 'string'; }));
  });
}

function salvarRascunho(form) {
  const campos = lerCampos(form);
  if (temConteudo(campos)) {
    salvar(CHAVE_RASCUNHO, { versao: VERSAO, salvoEm: new Date().toISOString(), campos: campos });
  } else {
    remover(CHAVE_RASCUNHO);
  }
}

// Alerta acima do formulário avisando que o rascunho foi restaurado
function mostrarAvisoRascunho(form, salvoEm) {
  const aviso = document.createElement('div');
  aviso.id = 'aviso-rascunho';
  aviso.className = 'alerta alerta--info formulario-alerta';
  aviso.setAttribute('role', 'status');

  const icone = document.createElement('span');
  icone.className = 'alerta__icone';
  icone.setAttribute('aria-hidden', 'true');
  icone.textContent = 'i';

  const corpo = document.createElement('div');
  const titulo = document.createElement('p');
  titulo.className = 'alerta__titulo';
  titulo.textContent = 'Rascunho recuperado';
  const texto = document.createElement('p');
  texto.textContent = 'Continuamos de onde você parou (salvo em ' + formatarData.format(new Date(salvoEm)) +
    '). Por segurança, o CPF não fica guardado e precisa ser digitado de novo.';
  const descartar = document.createElement('button');
  descartar.type = 'button';
  descartar.className = 'botao botao--neutro';
  descartar.textContent = 'Descartar rascunho';
  descartar.addEventListener('click', function () {
    form.reset();   // o ouvinte de "reset" apaga o rascunho e este aviso
    mostrarToast('Rascunho descartado.', 'info');
  });

  corpo.append(titulo, texto, descartar);
  aviso.append(icone, corpo);
  form.before(aviso);
}

// Restaura o rascunho (se houver) e passa a salvar a cada alteração
export function iniciarRascunho(form) {
  const salvo = carregar(CHAVE_RASCUNHO, null);
  if (rascunhoValido(salvo)) {
    preencherCampos(form, salvo.campos);
    mostrarAvisoRascunho(form, salvo.salvoEm);
  } else if (salvo !== null) {
    remover(CHAVE_RASCUNHO);   // formato antigo ou corrompido
  }

  // Espera uma pausa de 400 ms na digitação antes de gravar (evita gravar a cada tecla)
  let espera;
  function agendarSalvamento() {
    clearTimeout(espera);
    espera = setTimeout(function () { salvarRascunho(form); }, 400);
  }
  form.addEventListener('input', agendarSalvamento);
  form.addEventListener('change', agendarSalvamento);

  // "Limpar", "Descartar rascunho" e o envio concluído terminam em reset
  form.addEventListener('reset', function () {
    clearTimeout(espera);
    remover(CHAVE_RASCUNHO);
    document.getElementById('aviso-rascunho')?.remove();
  });
}

// ---------- Histórico de cadastros enviados ----------

function itemValido(item) {
  return item && typeof item.nome === 'string' && Array.isArray(item.projetos) &&
    typeof item.disponibilidade === 'string' && !Number.isNaN(Date.parse(item.enviadoEm));
}

function carregarHistorico() {
  const dados = carregar(CHAVE_HISTORICO, []);
  return Array.isArray(dados) ? dados.filter(itemValido) : [];
}

// Chamado no envio bem-sucedido, antes de o formulário ser limpo
export function registrarEnvio(form) {
  const campos = lerCampos(form);
  const historico = carregarHistorico();
  historico.unshift({
    nome: campos.nome.trim().replace(/\s+/g, ' '),
    projetos: campos.projetos || [],
    disponibilidade: campos.disponibilidade || '',
    enviadoEm: new Date().toISOString(),
  });
  salvar(CHAVE_HISTORICO, historico.slice(0, LIMITE_HISTORICO));
  renderizarHistorico(document);
}

// Monta a lista a partir do array salvo, clonando o <template> de cada item
function renderizarHistorico(raiz) {
  const secao = raiz.querySelector('#historico');
  if (!secao) return;

  const historico = carregarHistorico();
  const modelo = secao.querySelector('#modelo-item-historico');
  const fragmento = document.createDocumentFragment();

  historico.forEach(function (cadastro) {
    const item = modelo.content.firstElementChild.cloneNode(true);
    const titulos = cadastro.projetos.map(function (id) {
      const projeto = projetos.find(function (p) { return p.id === id; });
      return projeto ? projeto.titulo : id;
    });
    item.querySelector('[data-campo="nome"]').textContent = cadastro.nome;
    item.querySelector('[data-campo="resumo"]').textContent =
      titulos.join(', ') + ' · ' + (NOMES_DISPONIBILIDADE[cadastro.disponibilidade] || cadastro.disponibilidade);
    const data = item.querySelector('[data-campo="data"]');
    data.dateTime = cadastro.enviadoEm;
    data.textContent = 'Enviado em ' + formatarData.format(new Date(cadastro.enviadoEm));
    fragmento.append(item);
  });

  secao.querySelector('#lista-historico').replaceChildren(fragmento);
  secao.hidden = historico.length === 0;
}

export function iniciarHistorico(raiz) {
  const secao = raiz.querySelector('#historico');
  if (!secao) return;
  renderizarHistorico(raiz);
  secao.querySelector('#apagar-historico').addEventListener('click', function () {
    remover(CHAVE_HISTORICO);
    renderizarHistorico(document);
    mostrarToast('Histórico apagado deste navegador.', 'info');
  });
}
