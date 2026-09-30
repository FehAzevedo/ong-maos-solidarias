// Testes das regras de validação do cadastro (js/modules/validacao.js).
// Executar com: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { regras, cpfValido, somenteDigitos } from '../js/modules/validacao.js';

// Data no formato do <input type="date">, a "anos" atrás a partir de hoje (+ ajuste em dias)
function dataHaAnos(anos, ajusteDias = 0) {
  const data = new Date();
  data.setFullYear(data.getFullYear() - anos);
  data.setDate(data.getDate() + ajusteDias);
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return data.getFullYear() + '-' + mes + '-' + dia;
}

test('somenteDigitos remove tudo o que não é número', function () {
  assert.equal(somenteDigitos('529.982.247-25'), '52998224725');
  assert.equal(somenteDigitos('(11) 98765-4321'), '11987654321');
});

test('cpfValido confere os dígitos verificadores', function () {
  assert.equal(cpfValido('529.982.247-25'), true);
  assert.equal(cpfValido('529.982.247-24'), false, 'dígito verificador errado');
  assert.equal(cpfValido('111.111.111-11'), false, 'todos os dígitos iguais');
  assert.equal(cpfValido('529.982.247'), false, 'incompleto');
});

test('nome exige nome e sobrenome, só com letras', function () {
  assert.equal(regras.nome('Maria da Silva'), '');
  assert.equal(regras.nome("Ana D'Ávila"), '');
  assert.equal(regras.nome('  Maria    Silva  '), '', 'espaços extras são ignorados');
  assert.notEqual(regras.nome(''), '');
  assert.notEqual(regras.nome('Maria'), '', 'sem sobrenome');
  assert.notEqual(regras.nome('Maria123 Silva'), '', 'com números');
  assert.notEqual(regras.nome('<script>alert(1)</script>'), '', 'com HTML');
});

test('cpf distingue vazio, formato incompleto e dígitos inválidos', function () {
  assert.equal(regras.cpf('529.982.247-25'), '');
  assert.match(regras.cpf(''), /Informe/);
  assert.match(regras.cpf('529.982'), /formato/);
  assert.match(regras.cpf('111.111.111-11'), /inválido/);
});

test('nascimento exige pelo menos 16 anos e rejeita datas impossíveis', function () {
  assert.equal(regras.nascimento(dataHaAnos(30)), '');
  assert.equal(regras.nascimento(dataHaAnos(16)), '', 'faz 16 anos hoje');
  assert.match(regras.nascimento(dataHaAnos(16, 1)), /16 anos/, 'faz 16 anos amanhã');
  assert.match(regras.nascimento(dataHaAnos(-1)), /futuro/);
  assert.match(regras.nascimento('1800-01-01'), /ano/);
  assert.match(regras.nascimento(''), /Informe/);
});

test('email, telefone, cep e número seguem os formatos esperados', function () {
  assert.equal(regras.email('maria@exemplo.com'), '');
  assert.notEqual(regras.email('maria@exemplo'), '', 'sem extensão');
  assert.notEqual(regras.email('maria @exemplo.com'), '', 'com espaço');

  assert.equal(regras.telefone('(11) 98765-4321'), '', 'celular');
  assert.equal(regras.telefone('(11) 4002-8922'), '', 'fixo');
  assert.notEqual(regras.telefone('11987654321'), '', 'sem máscara');

  assert.equal(regras.cep('08210-000'), '');
  assert.notEqual(regras.cep('08210'), '');

  assert.equal(regras.numero('123'), '');
  assert.equal(regras.numero('s/n'), '', 'S/N em minúsculas');
  assert.notEqual(regras.numero('-12'), '');
});

test('grupos exigem pelo menos uma opção marcada', function () {
  assert.equal(regras.projetos(2), '');
  assert.notEqual(regras.projetos(0), '');
  assert.notEqual(regras.disponibilidade(0), '');
  assert.notEqual(regras.termos(0), '');
});
