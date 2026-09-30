# Changelog

Todas as mudanças relevantes do projeto, organizadas por versão.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), as versões seguem o [Versionamento Semântico](https://semver.org/lang/pt-BR/) e os tipos de mudança seguem o [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/). Os commits das versões 1 a 3 foram escritos antes da adoção do Conventional Commits; aqui eles aparecem classificados pelo tipo correspondente, com o hash original.

## [Não lançado]

### feat
- Temas escuro e de alto contraste, escolhidos no menu ou automáticos por `prefers-color-scheme` e `prefers-contrast`, com a escolha salva no `localStorage`
- Ajustes para o modo de alto contraste do Windows (`forced-colors`)

### refactor
- Variáveis de cor separadas por papel (`--cor-enfase`, `--cor-sobre-marca`, `--cor-inverso-fundo`...), para cada tema trocar o fundo sem afetar o texto sobre o vinho

### fix
- Acessibilidade: o `<main>` recebe foco pelo link "Pular para o conteúdo"; o grupo "Projetos de interesse" é anunciado como obrigatório; o link para o OpenStreetMap avisa que abre em nova aba; o toast pausa enquanto o mouse ou o foco estão sobre ele; a dica do campo nome acompanha a regra de validação

### build
- `package.json` com os scripts `start`, `test`, `build` e `preview`
- Servidor local em Node, sem dependências
- Build de produção com esbuild: JavaScript em um arquivo minificado, CSS minificado e versão nos links para evitar cache desatualizado

### test
- Testes automatizados das regras de validação e do acesso ao `localStorage` com `node --test`
- Teste de contraste WCAG dos pares de cor nos três temas

### docs
- README com descrição, estrutura, execução local e fluxo GitFlow (`6f76708`)
- CHANGELOG e padrão de mensagens de commit (`1858d53`)
- Modelos de issue e de pull request (`31faf3a`, PR #6)
- README com pré-requisitos, instalação, scripts, testes e build

## [3.0.0] - 2026-09-29

Experiência Prática III: lógica em JavaScript.

### ⚠ BREAKING CHANGES
- As páginas foram movidas para a pasta `html/`. Endereços antigos como `/projetos.html` passam a ser `/html/projetos.html`; a raiz redireciona para `html/index.html` (`27baadf`).

### feat
- Navegação SPA com History API e JavaScript em ES Modules (`27baadf`)
- Cards de projetos e opções do cadastro gerados com `<template>` a partir de dados (`e81f85f`)
- Verificação do formulário com regras, RegEx e mensagens por campo (`302e70f`)
- Rascunho e histórico do cadastro no `localStorage`; mapa da sede com Leaflet (`1d495e3`)

### refactor
- Delegação de eventos para os botões de feedback e os checkboxes gerados (`65cae4a`)

### fix
- Condição de corrida ao clicar rápido em links da SPA e tratamento de perda de conexão (`9064969`)

## [2.0.0] - 2026-09-29

Experiência Prática II: estilização com CSS3.

### feat
- Design system com variáveis CSS e layout responsivo (`5c4f7f6`)
- Grade de 12 colunas e cinco pontos de quebra (`8eb5d10`)
- Submenu dropdown e animação do menu hambúrguer (`049f61f`)
- Estados interativos dos botões e feedback de validação (`85e6313`)
- Componentes de feedback: badges, alertas, toast e modal (`c649f81`)

### chore
- Republicação do GitHub Pages (`2dff6a8`)

## [1.0.0] - 2026-09-28

Experiência Prática I: estrutura HTML.

### feat
- Estrutura inicial do site: páginas semânticas e formulário de cadastro (`b400e9f`)

### fix
- Autocomplete do telefone apontado pelo W3C Validator (`abeaa3d`)

### perf
- Imagens otimizadas em JPG/PNG e WebP (`9d37d08`)

[Não lançado]: https://github.com/FehAzevedo/ong-maos-solidarias/compare/v3.0.0...develop
[3.0.0]: https://github.com/FehAzevedo/ong-maos-solidarias/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/FehAzevedo/ong-maos-solidarias/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/FehAzevedo/ong-maos-solidarias/releases/tag/v1.0.0
