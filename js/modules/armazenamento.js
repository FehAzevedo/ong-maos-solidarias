// Módulo de acesso ao localStorage.
// O localStorage só guarda texto, então todo dado passa por JSON.stringify ao
// gravar e por JSON.parse ao ler. As funções nunca deixam o erro chegar à
// página: em navegação privada, cota cheia ou JSON corrompido, gravar devolve
// false e ler devolve o valor padrão.

const PREFIXO = 'maos-solidarias:';   // evita conflito com outras chaves do mesmo domínio

export function salvar(chave, dados) {
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(dados));
    return true;
  } catch (erro) {
    return false;
  }
}

export function carregar(chave, padrao) {
  try {
    const texto = localStorage.getItem(PREFIXO + chave);
    return texto === null ? padrao : JSON.parse(texto);
  } catch (erro) {
    return padrao;
  }
}

export function remover(chave) {
  try {
    localStorage.removeItem(PREFIXO + chave);
  } catch (erro) {
    // Sem acesso ao armazenamento: não há o que remover
  }
}
