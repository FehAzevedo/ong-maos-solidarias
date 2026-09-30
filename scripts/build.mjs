// Build de produção: gera a pasta dist/ com os arquivos otimizados para publicar.
//
//   - JavaScript (esbuild): os módulos a partir de js/main.js são unidos num
//     único arquivo (menos requisições) e minificados. O import() do Leaflet,
//     que aponta para o CDN, continua externo e sob demanda.
//   - CSS (esbuild): minificado (sem comentários e espaços).
//   - HTML (html-minifier-terser): sem comentários e espaços entre tags; o
//     script de tema do <head> também é minificado. Espaços que importam
//     (blocos <pre> e texto entre elementos) são preservados.
//   - Os links para o CSS e o JS recebem ?v=<versão do package.json>, para o
//     navegador baixar os arquivos novos a cada publicação em vez de misturar
//     versões guardadas no cache.
//   - Imagens: copiadas como estão (já foram otimizadas em WebP e JPG/PNG).
//
// Uso: npm run build

import { build } from 'esbuild';
import { minify } from 'html-minifier-terser';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const DESTINO = 'dist';
const pacote = JSON.parse(await readFile('package.json', 'utf8'));
const versao = pacote.version;

const OPCOES_HTML = {
  collapseWhitespace: true,
  removeComments: true,
  collapseBooleanAttributes: true,
  minifyJS: true,
  minifyCSS: false,          // o CSS já é minificado pelo esbuild
  keepClosingSlash: false,
};

await rm(DESTINO, { recursive: true, force: true });
await mkdir(join(DESTINO, 'html'), { recursive: true });

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

// Imagens
await cp('imagens', join(DESTINO, 'imagens'), { recursive: true });

// Páginas HTML: versão nos links de CSS e JS, depois minificação
async function gerarPagina(origem, destino) {
  const html = (await readFile(origem, 'utf8'))
    .replace('href="../css/estilo.css"', 'href="../css/estilo.css?v=' + versao + '"')
    .replace('src="../js/main.js"', 'src="../js/main.js?v=' + versao + '"');
  await writeFile(destino, await minify(html, OPCOES_HTML));
}

await gerarPagina('index.html', join(DESTINO, 'index.html'));
for (const pagina of await readdir('html')) {
  await gerarPagina(join('html', pagina), join(DESTINO, 'html', pagina));
}

// Relatório: tamanho do código-fonte x produção, sem e com gzip
// (o gzip é a compressão que o servidor aplica; é o que o navegador baixa)
async function arquivosDe(pasta, extensao) {
  const itens = await readdir(pasta, { recursive: true, withFileTypes: true });
  return itens
    .filter((item) => item.isFile() && item.name.endsWith(extensao))
    .map((item) => join(item.parentPath ?? item.path, item.name));
}

async function medir(arquivos) {
  let bruto = 0;
  let comprimido = 0;
  for (const arquivo of arquivos) {
    const conteudo = await readFile(arquivo);
    bruto += conteudo.length;
    comprimido += gzipSync(conteudo, { level: 9 }).length;
  }
  return { bruto, comprimido };
}

const kb = (bytes) => (bytes / 1024).toFixed(1).replace('.', ',') + ' KB';
const reducao = (antes, depois) => '-' + Math.round((1 - depois / antes) * 100) + '%';

const tipos = [
  ['JavaScript', await arquivosDe('js', '.js'), await arquivosDe(join(DESTINO, 'js'), '.js')],
  ['CSS', await arquivosDe('css', '.css'), await arquivosDe(join(DESTINO, 'css'), '.css')],
  ['HTML', ['index.html', ...(await arquivosDe('html', '.html'))], await arquivosDe(DESTINO, '.html')],
];

console.log('Build da versão ' + versao + ' gerado em ' + DESTINO + '/');
console.log('              fonte -> produção          | com gzip');
const total = { a: 0, d: 0, ga: 0, gd: 0 };
for (const [nome, fonte, producao] of tipos) {
  const antes = await medir(fonte);
  const depois = await medir(producao);
  total.a += antes.bruto; total.d += depois.bruto;
  total.ga += antes.comprimido; total.gd += depois.comprimido;
  console.log('  ' + nome.padEnd(11) + kb(antes.bruto).padStart(9) + ' -> ' + kb(depois.bruto).padStart(8) +
    ' (' + reducao(antes.bruto, depois.bruto) + ')' + ' | ' + kb(antes.comprimido) + ' -> ' +
    kb(depois.comprimido) + ' (' + reducao(antes.comprimido, depois.comprimido) + ')');
}
console.log('  ' + 'Total'.padEnd(11) + kb(total.a).padStart(9) + ' -> ' + kb(total.d).padStart(8) +
  ' (' + reducao(total.a, total.d) + ')' + ' | ' + kb(total.ga) + ' -> ' + kb(total.gd) +
  ' (' + reducao(total.ga, total.gd) + ')');
