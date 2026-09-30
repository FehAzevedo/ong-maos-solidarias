// Módulo do mapa da sede, com a biblioteca Leaflet (mapas interativos, código aberto).
//
// Como a biblioteca é integrada sem conflitar com o resto do código:
//   - vem de um CDN na versão ES module e é carregada com import() dinâmico,
//     então não cria a variável global "L": ela existe só dentro deste módulo;
//   - só é baixada quando a seção de contato está perto de aparecer na tela
//     (IntersectionObserver), e uma única vez, mesmo navegando pela SPA;
//   - o CSS da biblioteca é verificado com SRI (integrity) antes de ser aplicado;
//   - se o CDN falhar, o link para o OpenStreetMap que já está no HTML continua
//     visível, e a página funciona normalmente.

const VERSAO = '1.9.4';   // versão fixa: uma atualização da biblioteca não muda o site sem aviso
const URL_JS = 'https://cdn.jsdelivr.net/npm/leaflet@' + VERSAO + '/dist/leaflet-src.esm.min.js';
const URL_CSS = 'https://cdn.jsdelivr.net/npm/leaflet@' + VERSAO + '/dist/leaflet.css';
const INTEGRIDADE_CSS = 'sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H';

// Sede em Itaquera (localização aproximada do endereço de contato)
const SEDE = { latitude: -23.5427, longitude: -46.4718, zoom: 16 };

let carregamento = null;   // promessa do módulo Leaflet, compartilhada entre as páginas
let mapaAtual = null;      // instância ativa, removida antes de criar outra
let observadorAtual = null;

function carregarLeaflet() {
  if (!carregamento) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = URL_CSS;
    css.integrity = INTEGRIDADE_CSS;
    css.crossOrigin = 'anonymous';
    document.head.append(css);
    carregamento = import(URL_JS);
  }
  return carregamento;
}

// As cores do marcador vêm do Design System (variáveis CSS), não do JavaScript
function corDoTema(variavel) {
  return getComputedStyle(document.documentElement).getPropertyValue(variavel).trim();
}

async function montarMapa(container) {
  try {
    const L = await carregarLeaflet();
    if (!container.isConnected) return;   // a pessoa trocou de página durante o download

    mapaAtual?.remove();                  // libera o mapa de uma visita anterior (SPA)
    container.replaceChildren();          // tira o link alternativo; o mapa ocupa o lugar

    const posicao = [SEDE.latitude, SEDE.longitude];
    mapaAtual = L.map(container, { scrollWheelZoom: false }).setView(posicao, SEDE.zoom);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapaAtual);

    L.circleMarker(posicao, {
      radius: 10,
      weight: 3,
      color: corDoTema('--cor-superficie'),
      fillColor: corDoTema('--cor-primaria'),
      fillOpacity: 1,
    })
      .addTo(mapaAtual)
      .bindPopup('<strong>ONG Mãos Solidárias</strong><br>Rua das Flores, 123, Itaquera')
      .openPopup();
  } catch (erro) {
    carregamento = null;                  // permite tentar de novo numa próxima visita
    container.classList.add('mapa--indisponivel');
  }
}

// Chamado a cada página renderizada; só age se o contêiner do mapa estiver nela
export function iniciarMapa(raiz) {
  observadorAtual?.disconnect();
  const container = raiz.querySelector('#mapa-sede');
  if (!container) return;

  observadorAtual = new IntersectionObserver(function (entradas) {
    if (entradas.some(function (entrada) { return entrada.isIntersecting; })) {
      observadorAtual.disconnect();
      montarMapa(container);
    }
  }, { rootMargin: '200px' });   // começa a baixar um pouco antes de aparecer

  observadorAtual.observe(container);
}
