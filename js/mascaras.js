// Máscaras de entrada e validações complementares do formulário de cadastro.
// As validações nativas (required, pattern, type, minlength) continuam ativas;
// este script formata os campos e cobre regras que o HTML sozinho não verifica.

function somenteDigitos(valor) {
  return valor.replace(/\D/g, '');
}

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

// Confere os dígitos verificadores do CPF
function cpfValido(valor) {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  for (let t = 9; t < 11; t++) {
    let soma = 0;
    for (let i = 0; i < t; i++) {
      soma += Number(cpf[i]) * (t + 1 - i);
    }
    const digito = ((soma * 10) % 11) % 10;
    if (digito !== Number(cpf[t])) return false;
  }
  return true;
}

function aplicarMascara(campo, mascara) {
  campo.addEventListener('input', function () {
    campo.value = mascara(campo.value);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-cadastro');
  const cpf = document.getElementById('cpf');
  const telefone = document.getElementById('telefone');
  const cep = document.getElementById('cep');
  const nascimento = document.getElementById('nascimento');
  const projetos = form.querySelectorAll('input[name="projetos"]');
  const status = document.getElementById('mensagem-status');

  aplicarMascara(cpf, mascaraCPF);
  aplicarMascara(telefone, mascaraTelefone);
  aplicarMascara(cep, mascaraCEP);

  // CPF: além do formato (pattern), exige dígitos verificadores corretos
  cpf.addEventListener('input', function () {
    const completo = cpf.value.length === 14;
    cpf.setCustomValidity(completo && !cpfValido(cpf.value) ? 'CPF inválido. Confira os números digitados.' : '');
  });

  // Data de nascimento: idade mínima de 16 anos calculada a partir de hoje
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  nascimento.max = (hoje.getFullYear() - 16) + '-' + mes + '-' + dia;

  // Projetos: pelo menos uma opção marcada
  function validarProjetos() {
    const algumMarcado = Array.from(projetos).some(function (p) { return p.checked; });
    projetos[0].setCustomValidity(algumMarcado ? '' : 'Selecione pelo menos um projeto.');
  }
  projetos.forEach(function (p) { p.addEventListener('change', validarProjetos); });
  validarProjetos();

  // O evento submit só dispara quando todas as validações nativas passam.
  // Simula o envio: o botão fica desabilitado (estado :disabled no CSS)
  // enquanto "envia", evitando cadastros duplicados por cliques repetidos.
  const botaoEnviar = form.querySelector('button[type="submit"]');
  const textoBotao = botaoEnviar.textContent;

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    botaoEnviar.disabled = true;
    botaoEnviar.textContent = 'Enviando...';
    status.textContent = '';

    setTimeout(function () {
      form.reset();
      botaoEnviar.disabled = false;
      botaoEnviar.textContent = textoBotao;
      status.textContent = 'Cadastro enviado com sucesso! Entraremos em contato em breve.';
      abrirModal('modal-cadastro');
    }, 1500);
  });

  // Tentativa de envio com campos inválidos: o navegador dispara "invalid" em
  // cada campo com problema; um único toast resume o que fazer.
  let avisoPendente = false;
  form.addEventListener('invalid', function () {
    if (avisoPendente) return;
    avisoPendente = true;
    mostrarToast('Alguns campos precisam de atenção. Confira os itens destacados em vermelho.', 'erro');
    setTimeout(function () { avisoPendente = false; });
  }, true);

  form.addEventListener('reset', function () {
    status.textContent = '';
    cpf.setCustomValidity('');
    setTimeout(validarProjetos);
  });
});
