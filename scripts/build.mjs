// Build de produção: gera a pasta dist/ com os arquivos otimizados para publicar.
//
//   - JavaScript: os módulos a partir de js/main.js são unidos num único arquivo
//     (menos requisições) e minificados. O import() do Leaflet, que aponta para
//     o CDN, continua externo e sob demanda.
//   - CSS: minificado (sem comentários e espaços).
//   - HTML: os links para o CSS e o JS recebem ?v=<versão do package.json>, para
//     o navegador baixar os arquivos novos a cada publicação em vez de misturar
//     versões guardadas no cache.
//   - Imagens e páginas: copiadas como estão (as imagens já foram otimizadas).
//
// Uso: npm run build

import { build } from 'esbuild';
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DESTINO = 'dist';
const pacote = JSON.parse(await readFile('package.json', 'utf8'));
const versao = pacote.version;

async function tamanho(caminho) {
  const info = await stat(caminho);
  if (!info.isDirectory()) return info.size;
  const itens = await readdir(caminho);
  const tamanhos = await Promise.all(itens.map((item) => tamanho(join(caminho, item))));
  return tamanhos.reduce((soma, atual) => soma + atual, 0);
}

function kb(bytes) {
  return (bytes / 1024).toFixed(1).replace('.', ',') + ' KB';
}

await rm(DESTINO, { recursive: true, force: true });
await mkdir(DESTINO);

// JavaScript: um único arquivo minificado
await build({
  entryPoints: ['js/main.js'],
  bundle: true,
  minify: true,
  format: 'esm',
  target: 'es2020',
  outfile: join(DESTINO, 'js/main.js'),
  external: ['https://*'],   // bibliotecas carregadas de CDN ficam de fora do pacote
  legalComments: 'none',
  logLevel: 'warning',
});

// CSS minificado
await build({
  entryPoints: ['css/estilo.css'],
  minify: true,
  outfile: join(DESTINO, 'css/estilo.css'),
  logLevel: 'warning',
});

// Imagens e ponto de entrada da raiz
await cp('imagens', join(DESTINO, 'imagens'), { recursive: true });
await cp('index.html', join(DESTINO, 'index.html'));

// Páginas HTML com a versão nos links de CSS e JS
await mkdir(join(DESTINO, 'html'));
for (const pagina of await readdir('html')) {
  const html = await readFile(join('html', pagina), 'utf8');
  const versionado = html
    .replace('href="../css/estilo.css"', 'href="../css/estilo.css?v=' + versao + '"')
    .replace('src="../js/main.js"', 'src="../js/main.js?v=' + versao + '"');
  await writeFile(join(DESTINO, 'html', pagina), versionado);
}

// Relatório de tamanhos: código-fonte x produção
const jsFonte = await tamanho('js');
const jsProducao = await tamanho(join(DESTINO, 'js'));
const cssFonte = await tamanho('css');
const cssProducao = await tamanho(join(DESTINO, 'css'));
const reducao = (antes, depois) => Math.round((1 - depois / antes) * 100) + '%';

console.log('Build da versão ' + versao + ' gerado em ' + DESTINO + '/');
console.log('  JavaScript: ' + kb(jsFonte) + ' -> ' + kb(jsProducao) + ' (-' + reducao(jsFonte, jsProducao) + ')');
console.log('  CSS:        ' + kb(cssFonte) + ' -> ' + kb(cssProducao) + ' (-' + reducao(cssFonte, cssProducao) + ')');
