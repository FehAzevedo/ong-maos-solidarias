// Servidor estático para desenvolvimento, sem dependências (só módulos do Node).
// O site usa ES Modules e fetch, que não funcionam abrindo o arquivo direto
// no navegador (file://); por isso ele precisa ser servido por HTTP.
//
// Uso:
//   node scripts/servidor.mjs          serve o código-fonte (npm start)
//   node scripts/servidor.mjs dist     serve a versão de produção (npm run preview)
// Porta: 5500, ou a definida na variável de ambiente PORT.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const raiz = resolve(process.argv[2] || '.');
const porta = Number(process.env.PORT) || 5500;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.md': 'text/plain; charset=utf-8',
};

const servidor = createServer(async function (requisicao, resposta) {
  try {
    const caminhoUrl = decodeURIComponent(new URL(requisicao.url, 'http://localhost').pathname);
    let arquivo = normalize(join(raiz, caminhoUrl));

    // Impede sair da pasta servida (ex.: /../../arquivo-do-sistema)
    if (arquivo !== raiz && !arquivo.startsWith(raiz + sep)) {
      resposta.writeHead(403).end('Acesso negado');
      return;
    }

    if ((await stat(arquivo)).isDirectory()) arquivo = join(arquivo, 'index.html');
    const conteudo = await readFile(arquivo);
    resposta.writeHead(200, {
      'Content-Type': TIPOS[extname(arquivo).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',   // em desenvolvimento, sempre a versão mais recente
    });
    resposta.end(conteudo);
  } catch (erro) {
    resposta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Não encontrado');
  }
});

servidor.listen(porta, function () {
  console.log('Servindo ' + raiz + ' em http://localhost:' + porta);
});
