# SportsCam UX — Hierarquia visual e primeira tela

> **Status:** entregável da Fase 02
> **Versão:** 0.1
> **Última revisão:** 2026-10-03

## 1. Direção visual inicial

O SportsCam App deve transmitir uma ferramenta técnica profissional sem parecer um painel administrativo genérico.

Direção:
- interface desktop-first;
- densidade moderada;
- hierarquia clara;
- foco em projetos;
- superfícies simples;
- estados técnicos muito visíveis;
- ações primárias poucas e claras;
- informação avançada progressivamente revelada.

A primeira tela estabelecida é **APP-01 — Projetos**.

## 2. Estrutura visual

```
┌──────────────────────────────────────────────────────────────────┐
│ Sidebar              │ Topbar                                    │
│                      │ Projetos                    [Novo projeto]│
│ SportsCam            │ descrição                                │
│                      │                                            │
│ Projetos             │ Projetos recentes                         │
│ Catálogo             │                                            │
│ Configurações        │ [Projeto] [Projeto] [Projeto]             │
│                      │                                            │
│                      │ ┌────────────────────────────────────────┐ │
│ Modo local           │ │ Próximo passo                          │ │
│                      │ │ Orientação contextual                  │ │
│                      │ └────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## 3. APP-01 — Projetos

### Objetivo

Ser o ponto de entrada operacional do App e permitir que o usuário:
- veja projetos recentes;
- crie um novo projeto;
- reconheça rapidamente o estado de cada projeto;
- abra um projeto existente.

### Layout

- canvas base: desktop 1440 × 900 no primeiro wireframe;
- sidebar fixa: aproximadamente 248 px;
- área principal: aproximadamente 1152 px;
- espaçamento externo generoso;
- cards de projeto em linha;
- bloco contextual abaixo dos projetos.

### Sidebar

Elementos:
1. marca SportsCam;
2. Projetos — ativo;
3. Catálogo;
4. Configurações;
5. indicador de execução local.

A sidebar não deve carregar excesso de funcionalidades. O projeto aberto será o contexto principal das próximas telas.

### Topbar

Elementos:
- título "Projetos";
- descrição curta;
- ação primária "Novo projeto".

### Cards de projeto

Cada card apresenta inicialmente:
- nome;
- esporte/domínio;
- estado de validação;
- última alteração.

Estados exemplificados:
- Válido;
- 2 avisos;
- Não validado.

A intenção é que o estado técnico seja reconhecível sem abrir o projeto.

### Bloco "Próximo passo"

Elemento contextual para orientar o usuário sem transformar a tela em um dashboard cheio de métricas.

O conteúdo será refinado conforme os fluxos forem prototipados.

## 4. Tipografia inicial

A primeira composição usa **Inter**:
- títulos: Semi Bold;
- corpo: Regular;
- estados e ações: Semi Bold.

A tipografia ainda não é o Design System definitivo. Ela será formalizada na etapa de tokens.

## 5. Linguagem de cores

A primeira composição estabelece semanticamente:
- fundo da aplicação;
- superfície/card;
- navegação escura;
- texto principal;
- texto secundário;
- borda;
- ação primária;
- sucesso;
- aviso.

Os valores visuais usados no primeiro wireframe são provisórios e deverão virar tokens formais antes da conclusão da Fase 02.

## 6. Componentes identificados

Primeira família:
- Button;
- ProjectCard;
- NavigationItem;
- StatusIndicator;
- SectionHeading;
- GuidancePanel.

Esses componentes serão consolidados no Design System antes do protótipo final.

## 7. Regra de estados

O estado técnico deve ter:
- texto;
- sinal visual;
- contexto suficiente para explicar o problema;
- caminho para ação quando aplicável.

Não depender somente de cor para comunicar estado.

## 8. Figma

Primeiro arquivo de UX:

https://www.figma.com/design/Ddi7ZrfgW91wOjrlmG2ilV

Tela criada:
- `APP-01 — Projetos`

A composição foi criada com camadas editáveis e componentes, não como imagem achatada.

## 9. Próximas telas

A ordem recomendada para continuar a composição visual é:

1. APP-02 — Criar projeto;
2. APP-04 — Visão geral;
3. APP-05 — Configuração;
4. APP-06 — Definição;
5. APP-07 — Módulos;
6. APP-08 — Hardware;
7. APP-09 — Profile;
8. APP-10 — Validação;
9. APP-11 — BOM;
10. APP-12 — Histórico;
11. APP-13 — Sincronização.

Depois, consolidar componentes e tokens e revisar o fluxo completo.
