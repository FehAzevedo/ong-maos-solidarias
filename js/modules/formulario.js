// Módulo do formulário de cadastro: máscaras de entrada, verificação dos dados e
// notificação visual. As regras ficam em validacao.js; aqui elas são aplicadas
// aos campos e o resultado vira classes CSS e mensagens injetadas no HTML.
//
// Quando validar ("recompensar cedo, cobrar tarde"):
//   - ao sair de um campo (focusout), ele é verificado pela primeira vez;
//   - a partir daí, é verificado a cada tecla (input), para o erro sumir
//     assim que for corrigido;
//   - checkbox, radio e select são verificados ao mudar (change);
//   - no envio (submit), todos são verificados e o foco vai ao primeiro erro.
// Sem JavaScript, a validação nativa do HTML (required, pattern) continua valendo.

import { mostrarToast, abrirModal } from './feedback.js';
import { regras, somenteDigitos } from './validacao.js';
import { iniciarRascunho, registrarEnvio } from './persistencia.js';

// 000.000.000-00
function mascaraCPF(valor) {
  return somenteDigitos(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// (00) 0000-0000 ou (00) 00000-0000
function mascaraTelefone(valor) {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.replace(/(\d{1,2})/, '($1');
  if (d.length <= 6) return d.replace(/(\d{2})(\d+)/, '($1) $2');
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  return d.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
}

// 00000-000
function mascaraCEP(valor) {
  return somenteDigitos(valor)
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function aplicarMascara(campo, mascara) {
  campo.addEventListener('input', function () {
    campo.value = mascara(campo.value);
  });
}

// ---------- Ligação entre regras e DOM ----------

// Controles (inputs) e contêiner visual de cada campo com regra
function partesDoCampo(form, nome) {
  const controles = Array.from(form.elements[nome] instanceof RadioNodeList
    ? form.elements[nome]
    : [form.elements[nome]]);
  const primeiro = controles[0];
  const container = primeiro.closest('.campo, .grupo-opcoes, .campo-termos');
  return { controles, container };
}

// Valor que a regra recebe: texto do campo, ou quantidade marcada nos grupos
function valorDoCampo(controles) {
  const tipo = controles[0].type;
  if (tipo === 'checkbox' || tipo === 'radio') {
    return controles.filter(function (c) { return c.checked; }).length;
  }
  return controles[0].value;
}

// Liga ou desliga uma mensagem na lista de aria-describedby do controle,
// preservando descrições que já existiam (ex.: "Idade mínima de 16 anos.")
function alternarDescricao(controle, id, ligar) {
  const ids = (controle.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
  const semEste = ids.filter(function (atual) { return atual !== id; });
  const novos = ligar ? semEste.concat(id) : semEste;
  if (novos.length) controle.setAttribute('aria-describedby', novos.join(' '));
  else controle.removeAttribute('aria-describedby');
}

// Aplica o resultado na tela: classes de estado, aria-invalid e mensagem injetada
function exibirResultado(nome, controles, container, mensagem) {
  const idMensagem = 'erro-' + nome;
  let aviso = document.getElementById(idMensagem);

  container.classList.toggle('campo--erro', Boolean(mensagem));
  container.classList.toggle('campo--sucesso', !mensagem);

  if (mensagem) {
    if (!aviso) {
      aviso = document.createElement('p');
      aviso.id = idMensagem;
      aviso.className = 'campo__mensagem';
      container.append(aviso);
    }
    aviso.textContent = mensagem;
  } else if (aviso) {
    aviso.remove();
  }

  controles.forEach(function (controle) {
    controle.setAttribute('aria-invalid', String(Boolean(mensagem)));
    alternarDescricao(controle, idMensagem, Boolean(mensagem));
  });
}

function validarCampo(form, nome) {
  const { controles, container } = partesDoCampo(form, nome);
  const mensagem = regras[nome](valorDoCampo(controles));
  exibirResultado(nome, controles, container, mensagem);
  return mensagem ? controles[0] : null;
}

function limparValidacao(form) {
  form.querySelectorAll('.campo--erro, .campo--sucesso').forEach(function (container) {
    container.classList.remove('campo--erro', 'campo--sucesso');
  });
  form.querySelectorAll('.campo__mensagem').forEach(function (aviso) { aviso.remove(); });
  form.querySelectorAll('[aria-invalid]').forEach(function (controle) {
    controle.removeAttribute('aria-invalid');
    const ids = (controle.getAttribute('aria-describedby') || '').split(' ')
      .filter(function (id) { return id && !id.startsWith('erro-'); });
    if (ids.length) controle.setAttribute('aria-describedby', ids.join(' '));
    else controle.removeAttribute('aria-describedby');
  });
}

// Chamado a cada página renderizada; só age se o formulário estiver nela.
export function iniciarFormulario(raiz) {
  const form = raiz.querySelector('#form-cadastro');
  if (!form) return;

  // Com JavaScript ativo, as mensagens próprias substituem os balões do navegador
  form.noValidate = true;

  const status = document.getElementById('mensagem-status');
  const nascimento = document.getElementById('nascimento');
  const camposVerificados = new Set();

  aplicarMascara(document.getElementById('cpf'), mascaraCPF);
  aplicarMascara(document.getElementById('telefone'), mascaraTelefone);
  aplicarMascara(document.getElementById('cep'), mascaraCEP);

  // Limite do calendário: hoje menos 16 anos
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  nascimento.max = (hoje.getFullYear() - 16) + '-' + mes + '-' + dia;

  function verificar(nome) {
    if (!(nome in regras)) return;
    camposVerificados.add(nome);
    validarCampo(form, nome);
  }

  // Delegação: os três ouvintes abaixo atendem todos os campos do formulário,
  // inclusive os checkboxes gerados por template

  // Primeira verificação ao sair do campo (grupos são tratados no "change")
  form.addEventListener('focusout', function (evento) {
    const alvo = evento.target;
    if (alvo.type !== 'checkbox' && alvo.type !== 'radio') verificar(alvo.name);
  });

  // Depois da primeira verificação, acompanha a digitação em tempo real
  form.addEventListener('input', function (evento) {
    if (camposVerificados.has(evento.target.name)) verificar(evento.target.name);
  });

  form.addEventListener('change', function (evento) {
    verificar(evento.target.name);
  });

  // Envio: verifica tudo; com erro, foca o primeiro e resume num toast
  const botaoEnviar = form.querySelector('button[type="submit"]');
  const textoBotao = botaoEnviar.textContent;

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const comErro = Object.keys(regras)
      .map(function (nome) {
        camposVerificados.add(nome);
        return validarCampo(form, nome);
      })
      .filter(Boolean);

    if (comErro.length) {
      comErro[0].focus();
      mostrarToast(comErro.length === 1
        ? '1 campo precisa de atenção. Confira o item destacado.'
        : comErro.length + ' campos precisam de atenção. Confira os itens destacados.', 'erro');
      return;
    }

    // Tudo certo: simula o envio com o botão desabilitado (evita envio duplicado)
    botaoEnviar.disabled = true;
    botaoEnviar.textContent = 'Enviando...';
    status.textContent = '';

    setTimeout(function () {
      registrarEnvio(form);   // guarda no histórico antes de limpar os campos
      form.reset();
      botaoEnviar.disabled = false;
      botaoEnviar.textContent = textoBotao;
      status.textContent = 'Cadastro enviado com sucesso! Entraremos em contato em breve.';
      abrirModal('modal-cadastro');
    }, 1500);
  });

  form.addEventListener('reset', function () {
    status.textContent = '';
    camposVerificados.clear();
    limparValidacao(form);
  });

  // Restaura o rascunho salvo no localStorage e passa a salvar as alterações
  iniciarRascunho(form);
}
