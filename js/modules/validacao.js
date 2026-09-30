// Módulo com as regras de consistência do cadastro.
// Cada regra é uma função pura: recebe o valor do campo e devolve a mensagem de
// erro, ou '' quando o valor está correto. Nada aqui mexe no DOM; quem mostra o
// resultado na tela é o módulo formulario.js.

// Expressões regulares de formato
export const PADROES = {
  nome: /^[A-Za-zÀ-ÖØ-öø-ÿ'-]{2,}( [A-Za-zÀ-ÖØ-öø-ÿ'-]+)+$/,  // nome e sobrenome, só letras
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,                      // 000.000.000-00
  email: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,                // algo@dominio.ext
  telefone: /^\(\d{2}\) \d{4,5}-\d{4}$/,                   // (00) 0000-0000 ou (00) 00000-0000
  cep: /^\d{5}-\d{3}$/,                                    // 00000-000
  numero: /^(\d{1,6}|S\/N)$/i,                             // 123 ou S/N
};

export function somenteDigitos(valor) {
  return valor.replace(/\D/g, '');
}

// Confere os dois dígitos verificadores do CPF (e rejeita 000.000.000-00 etc.)
export function cpfValido(valor) {
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

function idadeEm(dataNascimento, hoje) {
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const aniversarioJaPassou = hoje.getMonth() > dataNascimento.getMonth() ||
    (hoje.getMonth() === dataNascimento.getMonth() && hoje.getDate() >= dataNascimento.getDate());
  return aniversarioJaPassou ? idade : idade - 1;
}

// Regras por nome do campo. Nos grupos (checkbox/radio/termos) o valor recebido
// é a quantidade de opções marcadas.
export const regras = {
  nome(valor) {
    const nome = valor.trim().replace(/\s+/g, ' ');
    if (!nome) return 'Informe seu nome completo.';
    if (!PADROES.nome.test(nome)) return 'Informe nome e sobrenome, usando apenas letras.';
    return '';
  },

  cpf(valor) {
    if (!valor) return 'Informe seu CPF.';
    if (!PADROES.cpf.test(valor)) return 'Complete o CPF no formato 000.000.000-00.';
    if (!cpfValido(valor)) return 'CPF inválido. Confira os números digitados.';
    return '';
  },

  nascimento(valor) {
    if (!valor) return 'Informe sua data de nascimento.';
    const data = new Date(valor + 'T00:00:00');
    const hoje = new Date();
    if (Number.isNaN(data.getTime())) return 'Data inválida.';
    if (data > hoje) return 'A data de nascimento não pode estar no futuro.';
    const idade = idadeEm(data, hoje);
    if (idade < 16) return 'É preciso ter pelo menos 16 anos para ser voluntário.';
    if (idade > 120) return 'Confira o ano de nascimento.';
    return '';
  },

  email(valor) {
    if (!valor.trim()) return 'Informe seu e-mail.';
    if (!PADROES.email.test(valor.trim())) return 'Informe um e-mail válido, como nome@exemplo.com.';
    return '';
  },

  telefone(valor) {
    if (!valor) return 'Informe um telefone para contato.';
    if (!PADROES.telefone.test(valor)) return 'Informe DDD e número, como (11) 98765-4321.';
    return '';
  },

  cep(valor) {
    if (!valor) return 'Informe seu CEP.';
    if (!PADROES.cep.test(valor)) return 'Complete o CEP no formato 00000-000.';
    return '';
  },

  logradouro(valor) {
    if (valor.trim().length < 3) return 'Informe a rua, avenida ou travessa.';
    return '';
  },

  numero(valor) {
    if (!valor.trim()) return 'Informe o número (ou S/N se não houver).';
    if (!PADROES.numero.test(valor.trim())) return 'Use apenas números ou S/N.';
    return '';
  },

  bairro(valor) {
    return valor.trim().length < 2 ? 'Informe o bairro.' : '';
  },

  cidade(valor) {
    return valor.trim().length < 2 ? 'Informe a cidade.' : '';
  },

  estado(valor) {
    return valor ? '' : 'Selecione o estado.';
  },

  projetos(marcados) {
    return marcados > 0 ? '' : 'Escolha pelo menos um projeto.';
  },

  disponibilidade(marcados) {
    return marcados > 0 ? '' : 'Escolha um período de disponibilidade.';
  },

  termos(marcados) {
    return marcados > 0 ? '' : 'É preciso autorizar o uso dos dados para concluir o cadastro.';
  },
};
