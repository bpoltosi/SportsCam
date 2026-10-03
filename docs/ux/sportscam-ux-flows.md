# SportsCam UX — Mapa de navegação e fluxos canônicos

> **Status:** proposta canônica da Fase 02
> **Versão:** 0.1
> **Escopo:** UX estrutural do SportsCam App Desktop e referência inicial do SportsCam Web
> **Última revisão:** 2026-10-03

## 1. Objetivo

Definir a estrutura de navegação, os fluxos principais e o inventário inicial de telas antes da implementação funcional.

Esta fase trata de experiência, navegação e estados. Não define ainda a implementação dos schemas nem a arquitetura interna do Engine.

## 2. Produtos

### SportsCam App Desktop

Aplicação operacional local para criar, configurar, validar, consultar e versionar projetos.

### SportsCam Web

Superfície pública/comercial para apresentação da empresa, soluções, tecnologia, casos de uso e contato.

O Web não substitui o App e não duplica a autoridade técnica do Engine.

## 3. Princípios de UX

1. **Projeto é a unidade central de trabalho.**
2. **Local-first:** o App deve funcionar sem internet.
3. **Engine é autoridade técnica:** a UI apresenta resultados e solicita operações; não reimplementa regras.
4. **Progressive disclosure:** mostrar complexidade somente quando necessária.
5. **Feedback explícito:** toda operação importante possui estado de carregamento, sucesso, erro ou vazio.
6. **Reversibilidade:** alterações devem poder ser revisadas antes de gerar/confirmar resultados.
7. **Rastreabilidade:** resultados devem mostrar versões e origem quando relevante.
8. **Portabilidade:** importação/exportação são capacidades de primeira classe.
9. **GitHub é opcional:** sincronização nunca deve bloquear o trabalho local.
10. **Custo zero:** componentes e serviços adotados no produto devem respeitar o princípio arquitetural de custo zero sempre que tecnicamente possível.

## 4. Navegação principal do App

```
SportsCam App
│
├── Projetos
│   ├── Início / Projetos recentes
│   ├── Criar projeto
│   └── Abrir projeto
│
└── Projeto aberto
    ├── Visão geral
    ├── Configuração
    │   ├── Definição
    │   ├── Módulos
    │   ├── Hardware
    │   └── Profile
    ├── Validação
    ├── BOM
    ├── Histórico
    └── Sincronização
        └── Git / GitHub
```

A navegação deve manter o contexto do projeto aberto. Operações globais como importar, exportar, preferências e abertura de outro projeto ficam fora do fluxo técnico principal.

## 5. Fluxo 01 — Criar projeto

```
Projetos
  ↓
Novo projeto
  ↓
Identificação básica
  ↓
Definição inicial
  ↓
Salvar projeto
  ↓
Visão geral do projeto
```

Dados mínimos da primeira etapa:
- nome;
- identificador;
- esporte/domínio, quando aplicável;
- versão inicial.

Não solicitar dados de instalação física.

## 6. Fluxo 02 — Configurar projeto

```
Projeto
  ↓
Configuração
  ├── Definição
  ├── Módulos
  ├── Hardware
  └── Profile
  ↓
Revisar alterações
  ↓
Salvar
```

A UI deve permitir editar a intenção do sistema sem exigir conhecimento do formato bruto dos schemas.

Quando uma escolha criar dependências, incompatibilidades ou requisitos, a interface deve apresentar o resultado do Engine em vez de tentar resolver localmente.

## 7. Fluxo 03 — Validar

```
Projeto configurado
  ↓
Validar
  ↓
SportsCam Engine
  ↓
ValidationResult
  ├── válido
  ├── avisos
  └── erros/incompatibilidades
```

A tela de validação deve separar:
- erros que impedem uma configuração válida;
- avisos que não impedem a configuração;
- informações/resultados derivados.

Quando possível, cada resultado deve apontar sua origem: regra, módulo, hardware ou dependência.

## 8. Fluxo 04 — BOM

```
Projeto
  ↓
BOM
  ↓
Itens derivados
  ↓
Origem / dependências
  ↓
Exportar
```

A BOM é apresentada como resultado derivado da configuração validada.

A UX não deve transformar preço em requisito estrutural do Engine. Se houver preço no produto, ele será tratado em camada comercial separada.

## 9. Fluxo 05 — Salvar e histórico

```
Alteração
  ↓
Salvar
  ↓
Nova versão/estado
  ↓
Histórico
  ↓
Comparar / recuperar contexto
```

A modelagem exata de ProjectVersion será fechada na Fase 04.

A UX já deve reservar espaço para:
- versão;
- data/hora;
- descrição da alteração;
- contexto técnico;
- status de sincronização.

## 10. Fluxo 06 — Importar/exportar

### Importar

```
Importar
  ↓
Selecionar arquivo/pasta
  ↓
Verificar estrutura
  ↓
Mostrar problemas
  ↓
Confirmar
  ↓
Projeto local
```

### Exportar

```
Exportar
  ↓
Selecionar formato/destino
  ↓
Gerar artefatos
  ↓
Confirmar resultado
```

Formatos concretos serão definidos na Fase 04.

## 11. Fluxo 07 — Git/GitHub

```
Projeto local
  ↓
Sincronização
  ├── Não conectado
  │    └── Associar repositório
  │
  ├── Alterações locais
  │    └── Commit / Push
  │
  ├── Alterações remotas
  │    └── Pull / Revisar
  │
  └── Conflito
       └── Revisar / resolver / cancelar
```

GitHub é opcional. O usuário deve conseguir continuar trabalhando localmente quando não houver conexão ou repositório remoto.

A UX não deve pedir senha do GitHub. A autenticação pertence ao mecanismo Git/GitHub disponível no ambiente.

## 12. Fluxo 08 — Abrir projeto existente

```
Projetos
  ↓
Abrir
  ↓
Selecionar projeto local
  ↓
Carregar contexto
  ↓
Verificar compatibilidade de versões
  ↓
Visão geral
```

Se o contexto técnico não puder ser reproduzido, o App deve explicar o problema antes de executar operações que dependam dele.

## 13. Fluxo 09 — Offline

O estado offline não é uma exceção arquitetural.

Quando sem internet:
- criar/editar projeto: permitido;
- validar com Engine local: permitido;
- gerar BOM: permitido;
- salvar: permitido;
- importar/exportar: permitido;
- Git local: permitido quando o repositório já estiver disponível;
- sincronizar com GitHub: aguardará conexão.

A interface deve diferenciar claramente "App offline" de "erro do projeto".

## 14. Inventário inicial de telas — App

| ID | Tela | Objetivo |
|---|---|---|
| APP-01 | Projetos | Entrada, projetos recentes e ações globais |
| APP-02 | Criar projeto | Criar definição inicial |
| APP-03 | Abrir projeto | Localizar/carregar projeto |
| APP-04 | Visão geral | Resumo do projeto e estado técnico |
| APP-05 | Configuração | Hub da configuração |
| APP-06 | Definição | Editar intenção/requisitos do projeto |
| APP-07 | Módulos | Selecionar e configurar módulos |
| APP-08 | Hardware | Selecionar/consultar hardware |
| APP-09 | Profile | Configurar ambiente/runtime/deployment |
| APP-10 | Validação | Mostrar ValidationResult |
| APP-11 | BOM | Mostrar composição derivada |
| APP-12 | Histórico | Consultar versões/estados |
| APP-13 | Sincronização | Estado Git/GitHub e operações |
| APP-14 | Importar | Importar projeto/artefatos |
| APP-15 | Exportar | Exportar projeto/artefatos |
| APP-16 | Preferências | Configurações locais do App |

## 15. Estados obrigatórios

Toda tela que executar operações ou depender de dados deve considerar:

- **empty:** ainda não há conteúdo;
- **loading:** operação em andamento;
- **ready:** conteúdo disponível;
- **success:** operação concluída;
- **warning:** operação concluída com ressalvas;
- **error:** operação falhou;
- **offline:** dependência remota indisponível;
- **conflict:** estado local/remoto incompatível;
- **unsaved:** existem alterações não salvas.

Esses estados devem ser projetados antes do protótipo navegável.

## 16. SportsCam Web — mapa inicial

```
Home
├── Soluções
├── Tecnologia
├── Casos de uso
├── Sobre
└── Contato
    └── Solicitação de projeto/orçamento
```

Fluxo comercial principal:

```
Home
  ↓
Solução / Caso de uso
  ↓
Tecnologia / Como funciona
  ↓
Solicitação de projeto
  ↓
Contato
```

O Web não deve exigir autenticação nem apresentar a configuração operacional completa do App.

## 17. Fora do UX central

Não criar telas ou etapas centrais para:
- altura de câmera;
- distância física;
- direção/orientação;
- ângulo físico;
- posição de postes/suportes;
- rota de cabos;
- montagem/fixação;
- vistoria física;
- engenharia civil/elétrica/estrutural;
- instruções de instalação física.

Esses assuntos permanecem fora do modelo central definido para o Engine.

## 18. Critério de conclusão desta etapa

Antes de iniciar a Fase 03, devem existir:

1. mapa de navegação do App;
2. mapa inicial do Web;
3. fluxos principais documentados;
4. inventário de telas;
5. estados de UI definidos;
6. fronteiras de responsabilidade entre UI, Backend e Engine registradas;
7. base para o Design System;
8. ausência de conceitos da arquitetura antiga.

## 19. Próxima etapa

Após esta estrutura, a Fase 02 deve detalhar:
- hierarquia visual;
- componentes;
- padrões de interação;
- design tokens;
- wireframes;
- comportamento de cada tela.

Somente depois disso o projeto entra na Fase 03 para construção do protótipo completo e navegável.
