// Módulo dos componentes de feedback: toast e modal.
// Uso (depois de importar):
//   mostrarToast('Chave PIX copiada!', 'sucesso');   // tipos: sucesso, aviso, erro, info
//   abrirModal('id-do-dialog');

const ICONES_TOAST = { sucesso: '✓', aviso: '!', erro: '×', info: 'i' };
const DURACAO_TOAST = 5000;

// Área onde os toasts aparecem. É uma região "status" (aria-live), então
// leitores de tela anunciam a mensagem sem tirar o foco do que a pessoa faz.
function areaDeToasts() {
  let area = document.querySelector('.toast-area');
  if (!area) {
    area = document.createElement('div');
    area.className = 'toast-area';
    area.setAttribute('role', 'status');
    area.setAttribute('aria-live', 'polite');
    document.body.appendChild(area);
  }
  return area;
}

export function mostrarToast(mensagem, tipo) {
  tipo = tipo || 'info';

  const toast = document.createElement('div');
  toast.className = 'toast toast--' + tipo;

  const icone = document.createElement('span');
  icone.className = 'toast__icone';
  icone.setAttribute('aria-hidden', 'true');
  icone.textContent = ICONES_TOAST[tipo];

  const texto = document.createElement('p');
  texto.className = 'toast__mensagem';
  texto.textContent = mensagem;

  const fechar = document.createElement('button');
  fechar.type = 'button';
  fechar.className = 'toast__fechar';
  fechar.setAttribute('aria-label', 'Fechar notificação');
  fechar.textContent = '×';

  toast.append(icone, texto, fechar);
  areaDeToasts().appendChild(toast);

  // Um quadro depois da inserção, a classe dispara a transição de entrada
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      toast.classList.add('toast--visivel');
    });
  });

  function remover() {
    toast.classList.remove('toast--visivel');
    setTimeout(function () { toast.remove(); }, 250);
  }

  fechar.addEventListener('click', remover);

  // A contagem para sumir pausa enquanto o mouse ou o foco estão no toast,
  // para dar tempo de ler (WCAG 2.2.1: tempo ajustável)
  let temporizador = setTimeout(remover, DURACAO_TOAST);
  function pausar() { clearTimeout(temporizador); }
  function retomar() { temporizador = setTimeout(remover, DURACAO_TOAST); }
  toast.addEventListener('mouseenter', pausar);
  toast.addEventListener('mouseleave', retomar);
  toast.addEventListener('focusin', pausar);
  toast.addEventListener('focusout', function (evento) {
    if (!toast.contains(evento.relatedTarget)) retomar();
  });
}

// Modal com <dialog>: showModal() já prende o foco dentro dele e fecha com Esc.
// Aqui só acrescentamos o fechamento ao clicar no fundo escurecido.
export function abrirModal(id) {
  const modal = document.getElementById(id);
  if (!modal.dataset.preparado) {
    modal.addEventListener('click', function (evento) {
      const area = modal.getBoundingClientRect();
      const foraDoModal = evento.clientX < area.left || evento.clientX > area.right ||
        evento.clientY < area.top || evento.clientY > area.bottom;
      if (evento.target === modal && foraDoModal) modal.close();
    });
    modal.dataset.preparado = 'sim';
  }
  modal.showModal();
}

// Delegação de eventos: um único ouvinte no documento atende todos os botões com
// data-toast, data-abrir-modal e data-copiar, inclusive os que chegam depois em
// conteúdo injetado pela SPA. Por isso é iniciado uma vez só, sem religar a cada página.
export function iniciarFeedback() {
  document.addEventListener('click', function (evento) {
    const botao = evento.target.closest('[data-toast], [data-abrir-modal], [data-copiar]');
    if (!botao) return;

    // Botões do guia de componentes: data-toast="tipo" e data-abrir-modal="id"
    if (botao.dataset.toast) {
      mostrarToast(botao.dataset.mensagem, botao.dataset.toast);
    } else if (botao.dataset.abrirModal) {
      abrirModal(botao.dataset.abrirModal);
    } else {
      // data-copiar="texto": copia o texto e confirma com um toast
      navigator.clipboard.writeText(botao.dataset.copiar)
        .then(function () {
          mostrarToast('Chave PIX copiada! Agora é só colar no app do seu banco.', 'sucesso');
        })
        .catch(function () {
          mostrarToast('Não foi possível copiar. Selecione a chave e copie manualmente.', 'erro');
        });
    }
  });
}
