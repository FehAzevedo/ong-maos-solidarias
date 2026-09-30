// Teste de contraste dos temas (claro, escuro e alto contraste).
// Lê as variáveis de cor de css/estilo.css e calcula a razão de contraste da
// WCAG 2.1 para cada par de texto/fundo usado no site:
//   - texto: mínimo 4,5:1 (critério 1.4.3, nível AA)
//   - componentes e ícones (bordas de campos, foco, ícones): mínimo 3:1 (1.4.11)
// Executar com: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../css/estilo.css', import.meta.url), 'utf8');

// Lê as declarações "--nome: valor;" de um bloco que começa com "seletor {"
function lerBloco(seletor) {
  const inicio = css.indexOf(seletor + ' {');
  assert.notEqual(inicio, -1, 'bloco não encontrado: ' + seletor);
  const fim = css.indexOf('}', inicio);
  const variaveis = {};
  for (const [, nome, valor] of css.slice(inicio, fim).matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    variaveis[nome] = valor.trim();
  }
  return variaveis;
}

const base = lerBloco(':root');
const temas = {
  claro: base,
  escuro: { ...base, ...lerBloco(':root[data-tema="escuro"]') },
  'alto-contraste': { ...base, ...lerBloco(':root[data-tema="alto-contraste"]') },
};

// Resolve var(--x) até chegar numa cor hexadecimal
function cor(tema, nome) {
  let valor = temas[tema][nome];
  while (valor && valor.startsWith('var(')) valor = temas[tema][valor.slice(4, -1)];
  assert.match(valor || '', /^#[0-9a-f]{6}$/i, tema + ': ' + nome + ' não é uma cor hexadecimal');
  return valor;
}

// Luminância relativa e razão de contraste, como definidas na WCAG 2.1
function luminancia(hex) {
  const [r, g, b] = [1, 3, 5].map(function (i) {
    const canal = parseInt(hex.slice(i, i + 2), 16) / 255;
    return canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a, b) {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}

// [primeiro plano, fundo, mínimo, onde aparece]
const PARES = [
  ['--cor-texto', '--cor-fundo', 4.5, 'texto da página'],
  ['--cor-texto', '--cor-superficie', 4.5, 'texto em cards e formulários'],
  ['--cor-texto-suave', '--cor-superficie', 4.5, 'legendas e dicas'],
  ['--cor-texto-suave', '--cor-fundo', 4.5, 'introduções'],
  ['--cor-enfase', '--cor-fundo', 4.5, 'links'],
  ['--cor-enfase', '--cor-superficie', 4.5, 'números e links em cards'],
  ['--cor-enfase-forte', '--cor-fundo', 4.5, 'títulos'],
  ['--cor-enfase-forte', '--cor-primaria-clara', 4.5, 'opção marcada e badge de categoria'],
  ['--cor-secundaria-escura', '--cor-primaria-clara', 4.5, 'texto do destaque da home'],
  ['--cor-secundaria-escura', '--cor-aviso-fundo', 4.5, 'alertas e badges de aviso'],
  ['--cor-secundaria', '--cor-superficie', 4.5, 'badge neutro e alerta informativo'],
  ['--cor-sobre-marca', '--cor-primaria', 4.5, 'cabeçalho, botões e chamada'],
  ['--cor-sobre-marca', '--cor-primaria-escura', 4.5, 'rodapé e botão em hover'],
  ['--cor-sobre-destaque', '--cor-destaque', 4.5, 'botão de doação e link de pular'],
  ['--cor-sobre-destaque', '--cor-destaque-escura', 4.5, 'botão de doação em hover'],
  ['--cor-sucesso', '--cor-sucesso-fundo', 4.5, 'mensagem de sucesso'],
  ['--cor-erro', '--cor-erro-fundo', 4.5, 'campo com erro'],
  ['--cor-erro', '--cor-superficie', 4.5, 'mensagem de erro do campo'],
  ['--cor-inverso-texto', '--cor-inverso-fundo', 4.5, 'toast e blocos de código'],
  ['--cor-borda-forte', '--cor-superficie', 3, 'borda dos campos'],
  ['--cor-sucesso', '--cor-superficie', 3, 'borda de campo válido'],
  // Foco (1.4.11): o contorno usa --cor-texto e precisa se destacar do fundo ao
  // redor; o anel amarelo é o que aparece sobre o cabeçalho vinho
  ['--cor-texto', '--cor-fundo', 3, 'contorno de foco sobre a página'],
  ['--cor-texto', '--cor-superficie', 3, 'contorno de foco sobre cards e campos'],
  ['--cor-destaque', '--cor-primaria', 3, 'página atual no menu e foco no cabeçalho'],
  ['--cor-sucesso-clara', '--cor-inverso-fundo', 3, 'ícone de sucesso no toast'],
  ['--cor-erro-clara', '--cor-inverso-fundo', 3, 'ícone de erro no toast'],
  ['--cor-sobre-feedback', '--cor-sucesso', 3, 'símbolo do ícone de sucesso'],
  ['--cor-sobre-feedback', '--cor-erro', 3, 'símbolo do ícone de erro'],
  ['--cor-sobre-feedback', '--cor-secundaria', 3, 'símbolo do ícone informativo'],
];

for (const tema of Object.keys(temas)) {
  test('contraste do tema ' + tema, function () {
    const falhas = PARES
      .map(function ([frente, fundo, minimo, uso]) {
        const razao = contraste(cor(tema, frente), cor(tema, fundo));
        return { frente, fundo, minimo, uso, razao };
      })
      .filter((par) => par.razao < par.minimo)
      .map((par) => par.uso + ': ' + par.frente + ' sobre ' + par.fundo + ' = ' +
        par.razao.toFixed(2) + ':1 (mínimo ' + par.minimo + ':1)');
    assert.deepEqual(falhas, [], 'pares abaixo do mínimo no tema ' + tema);
  });
}

test('temas automáticos (media queries) são idênticos aos escolhidos no seletor', function () {
  assert.deepEqual(lerBloco('@media (prefers-color-scheme: dark) {\n  :root:not([data-tema])'),
    lerBloco(':root[data-tema="escuro"]'));
  assert.deepEqual(lerBloco('@media (prefers-contrast: more) {\n  :root:not([data-tema])'),
    lerBloco(':root[data-tema="alto-contraste"]'));
});
