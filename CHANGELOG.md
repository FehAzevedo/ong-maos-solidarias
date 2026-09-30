# Changelog

Todas as mudanças relevantes do projeto, organizadas por versão.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), as versões seguem o [Versionamento Semântico](https://semver.org/lang/pt-BR/) e os tipos de mudança seguem o [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/). Os commits das versões 1 a 3 foram escritos antes da adoção do Conventional Commits; aqui eles aparecem classificados pelo tipo correspondente, com o hash original.

## [Não lançado]

### build
- `package.json` com os scripts `start`, `test`, `build` e `preview`
- Servidor local em Node, sem dependências
- Build de produção com esbuild: JavaScript em um arquivo minificado, CSS minificado e versão nos links para evitar cache desatualizado

### test
- Testes automatizados das regras de validação e do acesso ao `localStorage` com `node --test`

### docs
- README com descrição, estrutura, execução local e fluxo GitFlow (`8e8a5f7`)
- CHANGELOG e padrão de mensagens de commit (`4b435fb`)
- Modelos de issue e de pull request (`f2a8ca9`, PR #6)
- README com pré-requisitos, instalação, scripts, testes e build

## [3.0.0] - 2026-09-29

Experiência Prática III: lógica em JavaScript.

### ⚠ BREAKING CHANGES
- As páginas foram movidas para a pasta `html/`. Endereços antigos como `/projetos.html` passam a ser `/html/projetos.html`; a raiz redireciona para `html/index.html` (`217bf1d`).

### feat
- Navegação SPA com History API e JavaScript em ES Modules (`217bf1d`)
- Cards de projetos e opções do cadastro gerados com `<template>` a partir de dados (`367a1ce`)
- Verificação do formulário com regras, RegEx e mensagens por campo (`15e8665`)
- Rascunho e histórico do cadastro no `localStorage`; mapa da sede com Leaflet (`e43db81`)

### refactor
- Delegação de eventos para os botões de feedback e os checkboxes gerados (`49691a0`)

### fix
- Condição de corrida ao clicar rápido em links da SPA e tratamento de perda de conexão (`d288fc8`)

## [2.0.0] - 2026-09-29

Experiência Prática II: estilização com CSS3.

### feat
- Design system com variáveis CSS e layout responsivo (`912d2d4`)
- Grade de 12 colunas e cinco pontos de quebra (`158252a`)
- Submenu dropdown e animação do menu hambúrguer (`7ded75a`)
- Estados interativos dos botões e feedback de validação (`66e527c`)
- Componentes de feedback: badges, alertas, toast e modal (`98a3b5d`)

### chore
- Republicação do GitHub Pages (`b965bbc`)

## [1.0.0] - 2026-09-28

Experiência Prática I: estrutura HTML.

### feat
- Estrutura inicial do site: páginas semânticas e formulário de cadastro (`53a1f07`)

### fix
- Autocomplete do telefone apontado pelo W3C Validator (`da50033`)

### perf
- Imagens otimizadas em JPG/PNG e WebP (`53d1e01`)

[Não lançado]: https://github.com/FehAzevedo/ong-maos-solidarias/compare/v3.0.0...develop
[3.0.0]: https://github.com/FehAzevedo/ong-maos-solidarias/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/FehAzevedo/ong-maos-solidarias/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/FehAzevedo/ong-maos-solidarias/releases/tag/v1.0.0
