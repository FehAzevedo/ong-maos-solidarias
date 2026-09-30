# ONG Mãos Solidárias

Plataforma web da ONG Mãos Solidárias, que atua desde 2015 na zona leste de São Paulo com segurança alimentar, educação e inclusão digital. O site apresenta a ONG e os projetos, recebe doações e cadastra voluntários.

**Site publicado:** https://fehazevedo.github.io/ong-maos-solidarias/

Projeto desenvolvido nas Experiências Práticas da disciplina de Desenvolvimento Front-end, em HTML, CSS e JavaScript puros (sem frameworks), com uma única biblioteca externa (Leaflet) para o mapa.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução](#instalação-e-execução)
- [Testes](#testes)
- [Build de produção](#build-de-produção)
- [Deploy e CI/CD](#deploy-e-cicd)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Acessibilidade](#acessibilidade)
- [Fluxo de trabalho e versionamento](#fluxo-de-trabalho-e-versionamento)
- [Autor](#autor)

## Funcionalidades

- **Páginas:** início, projetos (com campanhas de doação), cadastro de voluntários e guia de componentes.
- **SPA:** a navegação troca só o conteúdo principal, sem recarregar a página, usando a History API. Cada rota continua sendo um arquivo `.html` real, então recarregar ou abrir um link direto funciona.
- **Design system:** cores, tipografia, espaçamentos e grade definidos como variáveis CSS.
- **Layout responsivo:** grade de 12 colunas com CSS Grid, Flexbox e 5 breakpoints (480, 768, 1024, 1280 e 1440 px).
- **Menu:** hambúrguer no celular e dropdown no desktop.
- **Templates:** cards de projetos e opções do cadastro gerados a partir de dados, com `<template>`.
- **Validação do cadastro:** regras com RegEx, dígitos do CPF e idade mínima, mensagens por campo e verificação em tempo real.
- **Persistência:** rascunho do cadastro e histórico de envios no `localStorage` (o CPF não é salvo).
- **Componentes de feedback:** badges, alertas, toast e modal.
- **Mapa da sede:** Leaflet carregado sob demanda.
- **Temas:** claro, escuro e alto contraste, escolhidos no menu ou automáticos pela preferência do sistema.

## Tecnologias

| Área | Tecnologia |
|---|---|
| Estrutura | HTML5 semântico, `<template>`, `<dialog>` |
| Estilo | CSS3: variáveis, Grid, Flexbox, `:has()`, `:where()`, media queries |
| Comportamento | JavaScript ES6+ em ES Modules, History API, `fetch`, `localStorage` |
| Biblioteca | [Leaflet 1.9.4](https://leafletjs.com/) com mapas do [OpenStreetMap](https://www.openstreetmap.org/copyright), via CDN |
| Ferramentas | Node.js, npm, [esbuild](https://esbuild.github.io/) e [html-minifier-terser](https://github.com/terser/html-minifier-terser) (build) e `node:test` (testes) |
| Hospedagem | GitHub Pages |

## Pré-requisitos

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) 20 ou superior (inclui o npm)
- Um navegador atual (Chrome, Edge, Firefox ou Safari)

O site em si não depende do Node: HTML, CSS e JavaScript rodam direto no navegador. O Node é usado só para o servidor local, os testes e o build.

## Instalação e execução

```bash
git clone https://github.com/FehAzevedo/ong-maos-solidarias.git
cd ong-maos-solidarias
npm install
npm start
```

Acesse http://localhost:5500. Para usar outra porta, defina a variável `PORT` (ex.: `PORT=8080 npm start`).

O `npm install` instala apenas as dependências de desenvolvimento usadas no build (esbuild e html-minifier-terser). O site precisa ser servido por HTTP, porque usa ES Modules e `fetch`; abrir o arquivo direto no navegador (`file://`) não carrega o JavaScript. Sem Node, qualquer servidor estático funciona, por exemplo `python -m http.server 5500`.

### Scripts

| Comando | O que faz |
|---|---|
| `npm start` | Servidor local do código-fonte em http://localhost:5500 |
| `npm test` | Executa os testes automatizados |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Servidor local da versão de produção (`dist/`) |

## Testes

```bash
npm test
```

Os testes usam o executor nativo do Node (`node --test`), sem dependências, e ficam em `tests/`:

- `validacao.test.js`: regras do cadastro (nome, CPF e dígitos verificadores, idade mínima, e-mail, telefone, CEP, número e grupos obrigatórios).
- `armazenamento.test.js`: gravação e leitura no `localStorage`, incluindo JSON corrompido e falha de armazenamento.
- `contraste.test.js`: lê as variáveis de cor do CSS e confere a razão de contraste WCAG de cada par texto/fundo nos temas claro, escuro e alto contraste (4,5:1 no texto e 3:1 em componentes).

A interface (SPA, menu, formulário e componentes) é testada manualmente no navegador, em 375 px e no desktop, com teclado e com o console aberto, seguindo o checklist do modelo de pull request.

## Build de produção

```bash
npm run build
npm run preview
```

O build gera a pasta `dist/`, que não vai para o repositório:

- **JavaScript (esbuild):** os módulos viram um único arquivo minificado (menos requisições); o Leaflet, carregado do CDN, fica fora do pacote;
- **CSS (esbuild):** minificado;
- **HTML (html-minifier-terser):** sem comentários e espaços entre tags, com o script de tema do `<head>` minificado; o espaço dentro de `<pre>` e entre textos é preservado;
- os links de CSS e JS nas páginas recebem `?v=<versão>`, para o navegador baixar os arquivos novos a cada publicação em vez de misturar versões guardadas no cache;
- as imagens são copiadas (já otimizadas em WebP e JPG/PNG).

O build mostra o tamanho antes e depois, também com gzip (a compressão aplicada pelo servidor, que é o que o navegador baixa):

| Arquivos | Fonte | Produção | Com gzip |
|---|---|---|---|
| JavaScript | 45,8 KB | 19,8 KB (-57%) | 18,5 KB → 7,5 KB (-59%) |
| CSS | 54,7 KB | 30,5 KB (-44%) | 13,3 KB → 5,8 KB (-56%) |
| HTML | 32,0 KB | 25,5 KB (-20%) | 10,5 KB → 9,4 KB (-10%) |
| **Total** | **132,5 KB** | **75,9 KB (-43%)** | **42,2 KB → 22,8 KB (-46%)** |

### Imagens

- **Formatos:** WebP para os navegadores atuais, com JPG (fotos) e PNG (logotipo) como alternativa via `<picture>`. Em relação aos arquivos originais, as imagens em WebP (fotos e logotipo) somam 198 KB contra 846 KB (-77%).
- **Resolução:** cada foto tem versões de 400 e 800 px de largura; `srcset` e `sizes` deixam o navegador baixar a menor que fica nítida no tamanho exibido e na densidade da tela. Num desktop comum, os cards de projeto baixam 58 KB em vez de 175 KB.
- **Dimensões:** `width` e `height` no HTML reservam o espaço antes do carregamento, e as imagens fora da tela usam `loading="lazy"`.

### Desempenho medido (Lighthouse 12, versão de produção)

| Página | Desempenho | Acessibilidade | Boas práticas | SEO | CLS |
|---|---|---|---|---|---|
| Início | 100 | 100 | 100 | 100 | 0 |
| Projetos | 100 | 100 | 100 | 100 | 0 |
| Cadastro | 100 | 100 | 100 | 100 | 0 |
| Componentes | 100 | 100 | 100 | 100 | 0 |

Antes das correções, Início e Projetos marcavam 79 de desempenho, com CLS de 0,487: o menu do celular recolhia depois de a página aparecer e empurrava o conteúdo. Agora a classe `js` é aplicada ao `<html>` no `<head>`, antes da primeira renderização, e a lista de cards gerada por JavaScript reserva espaço enquanto está vazia.

Para garantir que a minificação não muda o resultado, as duas versões foram comparadas no navegador: estilos calculados, posição de cada elemento e texto visível são idênticos nas quatro páginas e nos três temas.

## Deploy e CI/CD

O site é publicado no **GitHub Pages** por dois workflows do GitHub Actions, em `.github/workflows/`:

| Workflow | Quando roda | O que faz |
|---|---|---|
| `ci.yml` (CI) | Todo pull request para `develop` ou `main` e todo push na `develop` | `npm ci`, `npm test` e `npm run build`; um PR que quebre algum passo aparece com falha antes do merge |
| `deploy.yml` (CD) | Todo push na `main` (merge de release ou hotfix) e manualmente pela aba Actions | Testa, gera o build e publica a pasta `dist/` no GitHub Pages |

O GitHub Pages está configurado com a origem **GitHub Actions** (Settings → Pages → Build and deployment), então o que vai ao ar é sempre o build minificado, nunca os arquivos-fonte. Se os testes ou o build falharem, nada é publicado e o site continua na versão anterior.

Fluxo de uma entrega: `feature/*` → PR para `develop` (CI) → `release/x.y.z` → PR para `main` (CI) → merge → deploy automático → tag `vx.y.z` e release no GitHub.

## Estrutura do projeto

```
index.html          ponto de entrada; redireciona para html/index.html
html/               páginas: index, projetos, cadastro, componentes
css/estilo.css      design system (variáveis no :root) e estilos em seções numeradas
js/main.js          ponto de entrada do JavaScript (ES Modules)
js/modules/         um módulo por responsabilidade:
  roteador.js         navegação SPA (fetch + History API)
  menu.js             menu hambúrguer e dropdown
  templates.js        geração de componentes a partir de <template>
  feedback.js         toast e modal
  validacao.js        regras de validação (funções puras)
  formulario.js       máscaras, eventos e mensagens do cadastro
  armazenamento.js    acesso ao localStorage (JSON + try/catch)
  persistencia.js     rascunho e histórico do cadastro
  mapa.js             integração com o Leaflet
  tema.js             seletor de tema (claro, escuro, alto contraste)
js/dados/           dados dos projetos e dos estados
imagens/            imagens otimizadas em WebP e JPG/PNG
tests/              testes automatizados (node --test)
scripts/            servidor local e build de produção
.github/            workflows de CI/CD e modelos de issue e de pull request
CHANGELOG.md        histórico de versões
```

## Acessibilidade

O projeto segue as diretrizes da WCAG 2.1 nível AA:

- contraste mínimo de 4,5:1 no texto e 3:1 em bordas de campos e no foco;
- navegação completa por teclado, com foco visível em dois tons e link para pular ao conteúdo;
- na SPA, o foco vai para o título da nova página a cada navegação, para leitores de tela anunciarem a troca;
- erros do formulário ligados ao campo por `aria-describedby` e `aria-invalid`, sem depender só da cor;
- áreas de toque de 48 px e respeito a `prefers-reduced-motion`;
- landmarks `header`, `nav` (com `aria-label` distintos), `main` e `footer`, e um único `h1` por página;
- componentes com ARIA onde o HTML não basta: `aria-expanded`/`aria-controls` no menu, `aria-current` na página atual, `aria-busy` durante a troca de página, `role="status"` nos avisos e `<dialog>` nativo no modal;
- textos só para leitores de tela (classe `.visualmente-oculto`) em grupos obrigatórios e links que abrem nova aba;
- toasts pausam enquanto o mouse ou o foco estão sobre eles;
- três temas (claro, escuro e alto contraste), escolhidos no menu "Tema" ou aplicados pela preferência do sistema (`prefers-color-scheme` e `prefers-contrast`), com ajustes para o modo de alto contraste do Windows (`forced-colors`).

**Auditoria:** axe-core 4.10 (regras WCAG 2.0/2.1 A e AA e boas práticas) sem violações nas quatro páginas e nos três temas, inclusive com formulário em erro, modal aberto e toast visível; reflow sem rolagem horizontal em 320 px. O teste `tests/contraste.test.js` calcula a razão de contraste de cada par de cores em cada tema. Acompanhamento na [issue #2](https://github.com/FehAzevedo/ong-maos-solidarias/issues/2).

## Fluxo de trabalho e versionamento

### GitFlow

| Branch | Uso |
|---|---|
| `main` | Versões lançadas. É a branch publicada no GitHub Pages; só recebe merges de `release/*` e `hotfix/*`. |
| `develop` | Integração do desenvolvimento contínuo. Recebe as funcionalidades concluídas. |
| `feature/*` | Uma branch por funcionalidade, criada a partir de `develop` e mesclada de volta nela. |
| `release/*` | Preparação de uma versão: ajustes finais antes de mesclar em `main` e `develop`. |
| `hotfix/*` | Correção urgente criada a partir de `main` e mesclada em `main` e `develop`. |

Os merges usam `--no-ff`, para que cada funcionalidade apareça agrupada no histórico.

### Issues, milestones e pull requests

- Cada tarefa é registrada como uma **issue** e ligada ao **milestone** da versão em que será entregue (ex.: `v4.0.0: Experiência Prática IV`).
- Toda integração em `develop` ou `main` é feita por **pull request**, descrevendo o motivo, as mudanças e como testar, e citando a issue relacionada.
- Os modelos ficam em `.github/`: `pull_request_template.md` e, em `ISSUE_TEMPLATE/`, os modelos de erro e de melhoria.

### Versionamento semântico

As versões seguem o formato `MAJOR.MINOR.PATCH`:

- **MAJOR:** entrega de uma nova Experiência Prática ou mudança incompatível (ex.: na 3.0.0 as páginas foram movidas para `html/`, mudando os endereços).
- **MINOR:** nova funcionalidade compatível com a versão atual.
- **PATCH:** correção de erro sem mudar funcionalidades.

| Versão | Entrega |
|---|---|
| `v1.0.0` | Experiência Prática I: estrutura HTML semântica, formulário e imagens otimizadas |
| `v2.0.0` | Experiência Prática II: design system, layout responsivo e componentes com CSS3 |
| `v3.0.0` | Experiência Prática III: SPA, templates, validação, localStorage e Leaflet |
| `v4.0.0` | Experiência Prática IV: GitFlow, acessibilidade WCAG 2.1 AA, temas, build otimizado e deploy com CI/CD |

As versões 1 a 3 foram desenvolvidas diretamente na `main` e marcadas com tags depois. O GitFlow completo passou a ser usado a partir da Experiência Prática IV. O histórico de cada versão está no [CHANGELOG](CHANGELOG.md).

### Mensagens de commit

A partir da Experiência Prática IV, as mensagens seguem o [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/): `tipo(escopo opcional): descrição no imperativo`.

| Tipo | Quando usar |
|---|---|
| `feat` | nova funcionalidade (gera versão MINOR) |
| `fix` | correção de erro (gera versão PATCH) |
| `docs` | documentação |
| `test` | testes automatizados |
| `build` | build e dependências |
| `style` | formatação, sem mudar comportamento |
| `refactor` | reorganização de código, sem mudar comportamento |
| `perf` | melhoria de desempenho |
| `chore` | tarefas de manutenção (configuração, publicação) |

Uma mudança incompatível leva `!` depois do tipo (ex.: `feat!:`) ou um rodapé `BREAKING CHANGE:`, e gera versão MAJOR.

## Autor

Felipe, estudante de Desenvolvimento Front-end.
