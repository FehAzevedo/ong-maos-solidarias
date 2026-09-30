// Testes do acesso ao localStorage (js/modules/armazenamento.js).
// No Node não existe localStorage de navegador, então cada teste usa uma
// versão em memória com a mesma interface (getItem, setItem, removeItem).
// Executar com: npm test

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { salvar, carregar, remover } from '../js/modules/armazenamento.js';

function armazenamentoFalso() {
  const dados = new Map();
  return {
    getItem: (chave) => (dados.has(chave) ? dados.get(chave) : null),
    setItem: (chave, valor) => dados.set(chave, String(valor)),
    removeItem: (chave) => dados.delete(chave),
    dados,
  };
}

let armazenamento;

beforeEach(function () {
  armazenamento = armazenamentoFalso();
  Object.defineProperty(globalThis, 'localStorage', { value: armazenamento, configurable: true, writable: true });
});

test('salvar grava JSON com o prefixo do projeto e carregar devolve o objeto', function () {
  const rascunho = { versao: 1, campos: { nome: 'Maria', projetos: ['cozinha-solidaria'] } };
  assert.equal(salvar('rascunho-cadastro', rascunho), true);
  assert.equal(armazenamento.dados.get('maos-solidarias:rascunho-cadastro'), JSON.stringify(rascunho));
  assert.deepEqual(carregar('rascunho-cadastro', null), rascunho);
});

test('carregar devolve o valor padrão quando a chave não existe', function () {
  assert.deepEqual(carregar('cadastros-enviados', []), []);
});

test('carregar devolve o valor padrão quando o JSON está corrompido', function () {
  armazenamento.setItem('maos-solidarias:cadastros-enviados', '{isso não é JSON');
  assert.deepEqual(carregar('cadastros-enviados', []), []);
});

test('salvar devolve false em vez de quebrar quando o armazenamento falha', function () {
  armazenamento.setItem = function () { throw new Error('QuotaExceededError'); };
  assert.equal(salvar('rascunho-cadastro', { a: 1 }), false);
});

test('remover apaga a chave', function () {
  salvar('rascunho-cadastro', { a: 1 });
  remover('rascunho-cadastro');
  assert.equal(carregar('rascunho-cadastro', null), null);
});
