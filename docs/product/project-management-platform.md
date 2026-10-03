# SportsCam — Project Management Platform

## Objetivo

O SportsCam deve possuir um sistema web próprio para operar o ciclo de vida dos projetos, desde a criação e descoberta comercial até a configuração, orçamento, documentação, alteração e preparação da instalação.

Este sistema é diferente do SportsCam Core que roda na instalação. Ele funciona como a **camada de gestão e engenharia dos projetos**.

A plataforma deve facilitar simultaneamente:
- venda;
- descoberta de requisitos;
- documentação;
- orçamento;
- configuração;
- gestão de hardware e kits homologados;
- acompanhamento das decisões do cliente;
- controle de versões do projeto;
- análise de impacto de mudanças;
- preparação da configuração que será implantada;
- histórico e rastreabilidade.

## Visão geral

```
                         SPORTS CAM PLATFORM
                                  |
          +-----------------------+-----------------------+
          |                       |                       |
          v                       v                       v
    Project Management      Catalog / Pricing       AI Assistant
          |                       |                       |
          +-----------------------+-----------------------+
                                  |
                                  v
                         Project Definition
                                  |
                                  v
                       Configuration / BOM
                                  |
                                  v
                       Installation Profile
                                  |
                                  v
                         SportsCam Deployment
```

## Conceito principal

Cada projeto deve existir como uma entidade persistente na plataforma.

Exemplo:

```
Projeto #2026-0042
Cliente: Clube X
Status: Em configuração

v0.1 — descoberta inicial
v0.2 — duas câmeras por quadra
v0.3 — PoE adicionado
v0.4 — reservas adicionadas
v1.0 — aprovado
```

O sistema deve permitir consultar o projeto em qualquer momento e saber:
- o que foi solicitado;
- o que foi configurado;
- qual hardware foi escolhido;
- quais módulos estão ativos;
- quanto custa;
- quais decisões ainda estão pendentes;
- quais alterações ocorreram;
- qual versão foi aprovada;
- qual configuração está prevista para instalação.

## Entidades principais

### Project

Representa o projeto do cliente.

Deve conter:
- identificador;
- cliente;
- nome;
- status;
- responsável;
- datas;
- versão atual;
- versão aprovada;
- Project Definition;
- Installation Profile;
- BOM;
- estimativa/orçamento;
- módulos;
- histórico;
- observações;
- pendências.

### Customer

Dados comerciais básicos do cliente.

### Installation

Representa cada instalação física do projeto.

Um projeto pode possuir uma ou várias instalações.

Exemplo:

```
Projeto Clube X
├── Instalação 01 — Quadras 1-4
├── Instalação 02 — Quadras 5-6
└── futura expansão
```

### Court

Representa cada quadra e sua configuração.

### Hardware Item

Referência a um item do Hardware Catalog.

### Kit / Solution

Combinação homologada de hardware e configuração.

### Module

Capacidade opcional do SportsCam.

### Price / Pricing Rule

Informação comercial usada para gerar estimativas.

### Project Version

Snapshot versionado de uma configuração do projeto.

## Ciclo operacional

### 1. Criar projeto

Usuário cria um novo projeto e informa os dados básicos do cliente.

### 2. Descoberta

O sistema apresenta o guia de perguntas interno.

O usuário pode registrar:
- respostas;
- observações;
- requisitos;
- anexos;
- decisões;
- informações fornecidas pelo cliente.

### 3. Assistência de IA

A IA pode:
- resumir a conversa;
- extrair requisitos;
- identificar campos faltantes;
- sugerir perguntas;
- detectar inconsistências;
- converter texto em Project Definition.

A IA deve apresentar suas inferências como sugestões até serem confirmadas.

### 4. Configuração

O usuário configura:
- número/modalidade de quadras;
- câmeras;
- perfis de câmera;
- botões;
- rede;
- PoE;
- Edge Computer;
- storage;
- acesso;
- reservas;
- cloud;
- monetização;
- monitoramento;
- UPS;
- outros módulos.

O sistema aplica o Rules Engine e atualiza automaticamente:
- quantidades;
- dependências;
- kits;
- hardware;
- BOM;
- custos;
- requisitos.

### 5. Orçamento preliminar

A plataforma mostra:
- itens;
- quantidades;
- preços;
- instalação;
- módulos;
- serviços;
- custos estimados;
- premissas;
- itens ainda indefinidos.

O usuário pode trabalhar com opções, por exemplo:

```
Opção A — Básica
1 câmera / quadra
sem cloud

Opção B — Intermediária
2 câmeras / quadra
PoE
reservas

Opção C — Premium
2 câmeras / quadra
PoE
reservas
cloud
mídia paga
diagnóstico remoto
```

As opções devem ser comparáveis sem duplicar a definição do projeto.

### 6. Apresentação ao cliente

A plataforma deve permitir gerar uma visão comercial/documental do projeto contendo:
- resumo;
- funcionamento;
- quantidade de quadras;
- câmeras;
- recursos;
- hardware;
- kits;
- módulos;
- preços;
- premissas;
- opcionais;
- próximos passos.

A interface de venda pode esconder detalhes técnicos internos que não devem ser apresentados ao cliente.

### 7. Alteração do projeto

O usuário pode alterar uma configuração existente.

Exemplo:

```
Antes:
3 quadras
1 câmera/quadra
sem PoE

Depois:
3 quadras
2 câmeras/quadra
PoE
```

A plataforma deve recalcular a configuração e gerar uma análise de impacto.

### 8. Análise de impacto

Quando uma alteração ocorre, a IA pode explicar o impacto, mas a verdade técnica deve vir das regras e dependências estruturadas.

Exemplo:

```
ALTERAÇÃO
1 → 2 câmeras por quadra

IMPACTOS IDENTIFICADOS
+ 3 câmeras
+ capacidade de processamento
+ portas PoE
+ cabeamento
+ storage
+ custo

POSSÍVEIS IMPACTOS OPERACIONAIS
- necessidade de nova configuração de captura
- necessidade de validação do Edge Computer
- atualização do Installation Profile
```

A IA pode transformar isso em explicação legível:

> "Ao adicionar uma segunda câmera por quadra, o projeto passa de 3 para 6 câmeras. O perfil atual de processamento não atende à nova composição e deverá ser substituído por um perfil compatível. Também serão necessárias portas PoE e cabeamento adicionais."

### 9. Aprovação

O projeto deve possuir estados claros, por exemplo:

```
Draft
Discovery
Configured
Quotation
Customer Review
Approved
Preparing Installation
Installed
Operational
Archived
```

A aprovação deve congelar uma versão específica do projeto.

Alterações posteriores devem gerar nova versão.

### 10. Preparação da instalação

A plataforma transforma a versão aprovada em:
- Installation Profile;
- BOM final;
- lista de hardware;
- configuração esperada;
- checklist;
- documentação da instalação.

## Controle de versões

Mudanças relevantes devem gerar versões.

Exemplo:

```
v0.1
2 câmeras
sem PoE

v0.2
2 câmeras
PoE

v0.3
4 câmeras
PoE
reservas

v1.0
aprovado pelo cliente
```

A plataforma deve permitir:
- visualizar diferenças;
- comparar versões;
- saber quem alterou;
- saber quando alterou;
- registrar motivo;
- restaurar/duplicar configuração anterior quando apropriado.

## Impact Graph

A plataforma deve representar dependências entre requisitos, módulos, hardware e configuração.

Exemplo:

```
2 câmeras/quadra
       |
       +--> Camera B × 2
       |
       +--> Edge Profile B
       |
       +--> PoE ports × 2
       |
       +--> storage requirement
       |
       +--> capture configuration
```

Isso permite identificar mudanças de forma sistemática.

A IA pode consultar esse grafo e explicar os impactos, mas não deve substituir o modelo de dependências.

## Catálogo

A plataforma deve ter telas administrativas para gerenciar:

### Hardware
- câmera;
- computador;
- storage;
- switch;
- PoE;
- botão;
- UPS;
- antena;
- cabos;
- acessórios.

### Kits
- kit 1 câmera;
- kit 2 câmeras;
- kit outdoor;
- kit PoE;
- outros.

### Módulos
- reservas;
- cloud;
- mídia paga;
- acesso externo;
- diagnóstico remoto;
- multi-camera;
- outros.

### Preços
- custo;
- preço de venda;
- instalação;
- serviço;
- validade;
- fornecedor;
- histórico.

Alterações no catálogo não devem modificar retroativamente projetos já aprovados.

## Separação entre catálogo e projeto

Um projeto aprovado deve guardar uma referência versionada do item utilizado.

Exemplo:

```
Camera B
Catalog version: 2026.03
Price: R$ X
```

Se o preço da Camera B mudar posteriormente, o projeto aprovado continua refletindo a versão usada na aprovação.

Uma nova versão do projeto pode atualizar para o catálogo atual.

## IA e controle

A IA deve operar como assistente da equipe, não como autoridade silenciosa.

Ela pode:
- sugerir;
- explicar;
- resumir;
- identificar inconsistências;
- propor perguntas;
- analisar impacto.

Mudanças críticas devem exigir confirmação humana.

Exemplos:
- troca de câmera;
- mudança de quantidade;
- alteração de arquitetura;
- inclusão de módulo;
- alteração de preço;
- mudança de Installation Profile.

## Visibilidade

A plataforma deve possuir pelo menos duas perspectivas:

### Interna

Para equipe SportsCam:
- todos os detalhes técnicos;
- custos;
- margens;
- fornecedores;
- regras;
- hardware;
- riscos;
- dependências;
- histórico.

### Comercial/cliente

Para apresentação:
- funcionamento;
- escopo;
- opções;
- benefícios;
- hardware relevante;
- preço;
- premissas;
- opcionais.

Não expor automaticamente regras internas, custos ou informações de fornecedores.

## Princípios

1. Um projeto possui uma definição estruturada e versionada.
2. Alterações são rastreáveis.
3. Catálogo é separado dos projetos.
4. Projetos aprovados preservam a versão dos itens utilizados.
5. Dimensionamento é determinístico.
6. IA auxilia, mas não inventa hardware, preço ou dependências.
7. Nenhum cliente deve exigir um fork do software.
8. O mesmo projeto pode possuir diferentes opções comerciais.
9. Project Definition precede Installation Profile.
10. A plataforma de gestão não deve ficar acoplada ao runtime local do SportsCam Core.
11. O sistema deve continuar útil sem IA.
12. A interface deve facilitar tanto venda quanto engenharia e operação.

## MVP da plataforma

A primeira versão não precisa implementar tudo.

Prioridade:

1. criar projeto;
2. editar projeto;
3. guia de perguntas;
4. Project Definition;
5. catálogo de hardware;
6. catálogo de kits;
7. catálogo de preços;
8. Rules Engine básico;
9. BOM;
10. orçamento preliminar;
11. histórico de alterações;
12. comparação de versões;
13. visão comercial;
14. visão técnica;
15. geração de Installation Profile.

Depois:
- IA conversacional;
- análise de impacto assistida;
- propostas automáticas;
- aprovação do cliente;
- integração com instalação;
- inventário;
- gestão pós-instalação;
- métricas de projetos;
- automações.

## Resultado esperado

A plataforma deve permitir que a equipe diga:

> "Vamos criar um novo projeto."

E, a partir daí, consiga conduzir a descoberta, configurar a solução, visualizar hardware e kits homologados, calcular uma estimativa, apresentar opções, registrar alterações, entender os impactos e finalmente transformar a configuração aprovada em uma instalação SportsCam reproduzível.

O objetivo é que **a gestão do projeto e a engenharia da solução estejam conectadas**, sem transformar a ferramenta comercial em uma dependência do software que roda na quadra.
