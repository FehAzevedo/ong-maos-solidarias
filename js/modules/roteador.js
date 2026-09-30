// Módulo do roteador da SPA (Single Page Application), com History API.
//
// Cada rota é um arquivo .html real dentro de /html. Assim, recarregar a página
// ou abrir um link direto funciona no GitHub Pages sem configurar o servidor,
// e sem JavaScript os links continuam navegando normalmente.
//
// Com JavaScript, o fluxo de uma navegação é:
//   1. o clique em um link interno é interceptado (preventDefault);
//   2. a página de destino é buscada com fetch() e lida com DOMParser;
//   3. a URL muda com history.pushState(), sem recarregar o documento;
//   4. o <main id="conteudo"> atual é limpo e recebe o <main> da página nova;
//   5. título, item ativo do menu, foco e rolagem são atualizados;
//   6. os comportamentos do novo conteúdo são ligados (callback aoRenderizar).
// Os botões Voltar/Avançar do navegador disparam "popstate" e repetem 4 a 6.

const paginasEmCache = new Map();
let aoRenderizar = function () {};
let paginaExibida = location.pathname;

// Só intercepta links do próprio site para páginas .html
function ehRotaInterna(link) {
  if (!link || link.target || link.hasAttribute('download')) return false;
  const url = new URL(link.href, location.href);
  return url.origin === location.origin && url.pathname.endsWith('.html');
}

// Busca o HTML da página (uma vez só) e devolve o documento já interpretado
async function buscarPagina(url) {
  if (!paginasEmCache.has(url.pathname)) {
    const resposta = await fetch(url.pathname);
    if (!resposta.ok) throw new Error('Página não encontrada: ' + url.pathname);
    paginasEmCache.set(url.pathname, await resposta.text());
  }
  return new DOMParser().parseFromString(paginasEmCache.get(url.pathname), 'text/html');
}

// Marca no menu (aria-current) a página exibida; links com âncora (#) são do submenu
function atualizarMenu(url) {
  document.querySelectorAll('.menu a').forEach(function (link) {
    const destino = new URL(link.href);
    if (destino.pathname === url.pathname && !destino.hash) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

// Função principal: limpa o contêiner e injeta o novo fragmento HTML
function renderizar(pagina, url) {
  const conteudo = document.getElementById('conteudo');
  const novoConteudo = pagina.getElementById('conteudo');

  conteudo.replaceChildren(...document.importNode(novoConteudo, true).childNodes);
  document.title = pagina.title;
  paginaExibida = url.pathname;
  atualizarMenu(url);
  aoRenderizar(conteudo);

  // Animação de entrada (desligada por prefers-reduced-motion no CSS)
  conteudo.classList.remove('conteudo--entrando');
  void conteudo.offsetWidth;
  conteudo.classList.add('conteudo--entrando');

  // Rola até a âncora pedida (ex.: projetos.html#doacoes) ou até o topo.
  // Instantâneo: a página nova já "abre" na posição certa, como num carregamento normal.
  const alvo = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (alvo) alvo.scrollIntoView({ behavior: 'instant' });
  else window.scrollTo({ top: 0, behavior: 'instant' });

  // Leva o foco ao título da nova página, para leitores de tela anunciarem a troca
  const titulo = conteudo.querySelector('h1');
  if (titulo) {
    titulo.tabIndex = -1;
    titulo.focus({ preventScroll: true });
  }
}

async function carregar(url, adicionarAoHistorico) {
  const conteudo = document.getElementById('conteudo');
  conteudo.setAttribute('aria-busy', 'true');
  try {
    const pagina = await buscarPagina(url);
    if (adicionarAoHistorico) history.pushState({ spa: true }, '', url.href);
    renderizar(pagina, url);
  } catch (erro) {
    // Se algo falhar (ex.: sem conexão), faz a navegação tradicional
    location.href = url.href;
  } finally {
    conteudo.removeAttribute('aria-busy');
  }
}

export function iniciarRoteador(callback) {
  aoRenderizar = callback;
  history.scrollRestoration = 'manual';

  // Delegação de eventos: um único ouvinte no documento cobre todos os links,
  // inclusive os que chegam depois, dentro de conteúdo injetado
  document.addEventListener('click', function (evento) {
    const link = evento.target.closest('a[href]');
    const comModificador = evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey;
    if (evento.defaultPrevented || evento.button !== 0 || comModificador || !ehRotaInterna(link)) return;

    const url = new URL(link.href);
    // Âncora na mesma página: o navegador já rola sozinho
    if (url.pathname === location.pathname && url.hash) return;

    evento.preventDefault();
    if (url.pathname !== location.pathname) carregar(url, true);
  });

  // Voltar/Avançar do navegador. Se só a âncora mudou, o navegador cuida sozinho.
  window.addEventListener('popstate', function () {
    if (location.pathname !== paginaExibida) carregar(new URL(location.href), false);
  });
}
