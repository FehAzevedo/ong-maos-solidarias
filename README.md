# ONG Mãos Solidárias

Plataforma web da ONG Mãos Solidárias, que atua desde 2015 na zona leste de São Paulo com segurança alimentar, educação e inclusão digital. O site apresenta a ONG e os projetos, recebe doações e cadastra voluntários.

**Site publicado:** https://fehazevedo.github.io/ong-maos-solidarias/

Projeto desenvolvido nas Experiências Práticas da disciplina de Desenvolvimento Front-end, em HTML, CSS e JavaScript puros (sem frameworks), com uma única biblioteca externa (Leaflet) para o mapa.

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
- **Acessibilidade:** contraste WCAG AA, navegação por teclado, foco visível, link para pular ao conteúdo e respeito a `prefers-reduced-motion`.

## Estrutura

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
js/dados/           dados dos projetos e dos estados
imagens/            imagens otimizadas em WebP e JPG/PNG
```

## Como executar localmente

O site usa ES Modules e `fetch`, então precisa ser servido por HTTP (abrir o arquivo direto no navegador não carrega o JavaScript). Na pasta do projeto:

```bash
python -m http.server 5500
```

Depois, acesse http://localhost:5500.

## Fluxo de trabalho (GitFlow)

| Branch | Uso |
|---|---|
| `main` | Versões lançadas. É a branch publicada no GitHub Pages; só recebe merges de `release/*` e `hotfix/*`. |
| `develop` | Integração do desenvolvimento contínuo. Recebe as funcionalidades concluídas. |
| `feature/*` | Uma branch por funcionalidade, criada a partir de `develop` e mesclada de volta nela. |
| `release/*` | Preparação de uma versão: ajustes finais antes de mesclar em `main` e `develop`. |
| `hotfix/*` | Correção urgente criada a partir de `main` e mesclada em `main` e `develop`. |

Os merges usam `--no-ff`, para que cada funcionalidade apareça agrupada no histórico. Cada versão lançada recebe uma tag:

| Versão | Entrega |
|---|---|
| `v1.0.0` | Experiência Prática I: estrutura HTML semântica, formulário e imagens otimizadas |
| `v2.0.0` | Experiência Prática II: design system, layout responsivo e componentes com CSS3 |
| `v3.0.0` | Experiência Prática III: SPA, templates, validação, localStorage e Leaflet |

As versões 1 a 3 foram desenvolvidas diretamente na `main` e marcadas com tags depois. O GitFlow completo passou a ser usado a partir da Experiência Prática IV.

### Versionamento semântico

As versões seguem o formato `MAJOR.MINOR.PATCH`:

- **MAJOR:** entrega de uma nova Experiência Prática ou mudança incompatível (ex.: na 3.0.0 as páginas foram movidas para `html/`, mudando os endereços).
- **MINOR:** nova funcionalidade compatível com a versão atual.
- **PATCH:** correção de erro sem mudar funcionalidades.

O histórico de cada versão está no [CHANGELOG](CHANGELOG.md).

### Mensagens de commit

A partir da Experiência Prática IV, as mensagens seguem o [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/): `tipo(escopo opcional): descrição no imperativo`.

| Tipo | Quando usar |
|---|---|
| `feat` | nova funcionalidade (gera versão MINOR) |
| `fix` | correção de erro (gera versão PATCH) |
| `docs` | documentação |
| `style` | formatação, sem mudar comportamento |
| `refactor` | reorganização de código, sem mudar comportamento |
| `perf` | melhoria de desempenho |
| `chore` | tarefas de manutenção (configuração, publicação) |

Uma mudança incompatível leva `!` depois do tipo (ex.: `feat!:`) ou um rodapé `BREAKING CHANGE:`, e gera versão MAJOR.

## Tecnologias

- HTML5 semântico, CSS3 (variáveis, Grid, Flexbox, `:has()`, `:where()`) e JavaScript ES6+ (ES Modules)
- [Leaflet 1.9.4](https://leafletjs.com/) com mapas do [OpenStreetMap](https://www.openstreetmap.org/copyright)
- Hospedagem no GitHub Pages

## Autor

Felipe, estudante de Desenvolvimento Front-end.
