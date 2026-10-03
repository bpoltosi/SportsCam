# SportsCam Engine — Arquitetura Canônica

> **Status:** arquitetura vigente  
> **Versão:** 0.1  
> **Escopo:** motor determinístico de composição, resolução e validação de sistemas SportsCam  
> **Última revisão:** 2026-10-03

## 1. Decisão arquitetural

O **SportsCam Engine** é o núcleo determinístico responsável por transformar uma definição declarativa de projeto em uma composição técnica validada.

Ele trabalha com:

- requisitos funcionais do sistema;
- módulos;
- hardware homologado;
- capacidades e compatibilidades;
- dependências;
- regras;
- recursos;
- BOM;
- perfis de execução/deployment.

O Engine **não é um sistema de engenharia ou instalação física**.

A fronteira é deliberada e permanente:

> **O Engine descreve, resolve, valida e gera a configuração sistemática do sistema. Ele não modela a instalação física do sistema.**

## 2. Fora do domínio do Engine

Não fazem parte de `ProjectDefinition`, `Hardware`, `Module`, `Rule`, `BOM` ou do núcleo do Engine informações como:

- tamanho da quadra;
- dimensões físicas do local;
- altura das câmeras;
- distância física das câmeras;
- direção/orientação das câmeras;
- ângulo físico de instalação;
- posição de postes ou suportes;
- rota de cabos;
- método de fixação;
- infraestrutura física do imóvel;
- procedimento de montagem;
- vistoria física;
- instruções de instalação;
- decisões de engenharia civil, elétrica ou estrutural.

Essas informações podem existir em processos externos ao Engine, mas **não são entradas necessárias para sua arquitetura e não devem ser introduzidas nos schemas para resolver o problema de instalação**.

O fato de uma câmera existir fisicamente não significa que o Engine precise saber onde ela será instalada.

## 3. Princípio determinístico

O resultado técnico deve depender somente de entradas versionadas e determinísticas.

```
ProjectDefinition
+ Catalog version
+ Rules version
+ Engine version
= Deterministic Result
```

A mesma combinação deve produzir o mesmo resultado.

O sistema completo deve funcionar sem IA.

## 4. IA é opcional e periférica

A IA pode futuramente interpretar linguagem natural, sugerir preenchimentos ou explicar resultados.

Ela não é parte da autoridade técnica do Engine.

Fluxo permitido:

```
Linguagem natural
      |
      v
IA opcional
      |
      v
ProjectDefinition
      |
      v
SportsCam Engine
      |
      +--> validação
      +--> resolução
      +--> regras
      +--> BOM
```

A IA não deve:

- inventar hardware;
- inventar compatibilidades;
- inventar dependências;
- definir quantidades sem regra;
- alterar a BOM diretamente;
- substituir o catálogo;
- substituir as regras.

## 5. Modelo conceitual

Os seis schemas principais são:

```
ProjectDefinition
      |
      +---- Hardware
      |
      +---- Module
      |
      +---- Rule
      |
      +---- InstallationProfile
      |
      v
SportsCam Engine
      |
      v
BOM
```

A relação não significa que todos sejam necessariamente entradas independentes. A BOM é principalmente um resultado derivado.

## 6. ProjectDefinition

`ProjectDefinition` é a declaração estruturada do sistema que se deseja construir.

Ele representa **o que o sistema deve fazer**, não como alguém instalará fisicamente seus componentes.

Responsabilidades:

- identificar o projeto;
- declarar o domínio esportivo;
- declarar capacidades desejadas;
- declarar módulos desejados;
- declarar hardware escolhido ou permitido;
- declarar restrições técnicas relevantes para software/sistema;
- declarar perfis de execução/deployment quando necessários.

Exemplo conceitual:

```yaml
project:
  id: football-replay
  version: 1.0

  sport: football

  hardware:
    - id: camera-main
      quantity: 4

  modules:
    - camera_capture
    - video_recording
    - instant_replay
    - operator_ui

  profile: edge-standard
```

Não deve conter atributos físicos como `camera_height`, `camera_direction` ou `court_dimensions`.

## 7. Hardware

`Hardware` representa um recurso físico relevante para o funcionamento técnico do sistema.

O schema deve descrever propriedades que possam ser consumidas pelo Engine, por exemplo:

- identidade;
- fabricante;
- modelo;
- categoria;
- capabilities;
- interfaces;
- protocolos;
- limites;
- requisitos;
- compatibilidades;
- status de homologação;
- versões.

Exemplo:

```yaml
hardware:
  id: camera-4k-60
  type: camera

  capabilities:
    resolution:
      width: 3840
      height: 2160

    fps:
      max: 60

    codecs:
      - h264
      - h265

    protocols:
      - rtsp
```

O Hardware schema não deve representar a posição ou instalação física do item.

## 8. Module

`Module` representa uma capacidade funcional reutilizável.

Exemplos:

- `camera_capture`;
- `video_recording`;
- `instant_replay`;
- `clip_export`;
- `operator_ui`;
- `storage`;
- `analytics`.

Um módulo pode declarar:

- dependências;
- recursos mínimos;
- capabilities requeridas;
- capabilities fornecidas;
- parâmetros;
- compatibilidades;
- versões.

Exemplo:

```yaml
module:
  id: instant_replay
  version: 1.0

  requires:
    - camera_capture
    - video_recording
    - storage

  provides:
    - replay_buffer
    - replay_control
```

## 9. Rule

`Rule` representa conhecimento técnico declarativo usado para validar ou resolver o projeto.

Regras devem ficar fora da lógica rígida espalhada pelo código sempre que forem adequadas à representação declarativa.

Exemplos de classes de regra:

- compatibilidade;
- quantidade mínima;
- dependência;
- capacidade;
- recurso;
- versão;
- seleção de hardware;
- composição de módulos.

Exemplo conceitual:

```yaml
rule:
  id: replay-requires-storage

  when:
    module.enabled: instant_replay

  then:
    requires:
      hardware.type: storage

  severity: error
```

Uma regra pode produzir erros, avisos ou resultados derivados.

## 10. BOM

`BOM` (Bill of Materials) representa os recursos necessários resultantes da resolução do projeto.

A BOM deve ser tratada principalmente como **artefato derivado**, e não como fonte primária da arquitetura.

Exemplo:

```yaml
bom:
  items:
    - hardware_id: camera-4k-60
      quantity: 4

    - hardware_id: capture-server
      quantity: 1

    - hardware_id: storage-server
      quantity: 1
```

Cada item da BOM deve poder indicar sua origem, quando aplicável:

```yaml
source:
  type: module_dependency
  module: camera_capture
```

Isso permite explicar por que um item foi incluído.

Preço não é requisito estrutural da BOM. Caso exista pricing no produto, ele deve ser uma camada separada e versionada.

## 11. InstallationProfile

O nome `InstallationProfile` é mantido por compatibilidade conceitual com o projeto, mas seu significado é estritamente técnico/sistemático.

Ele **não é um projeto de instalação física**.

Quando representar o ambiente de execução, deve descrever aspectos como:

- runtime;
- sistema operacional;
- arquitetura de CPU;
- modo de deployment;
- requisitos de rede lógica;
- requisitos de armazenamento;
- recursos mínimos;
- parâmetros de execução;
- configuração esperada dos módulos.

Exemplo:

```yaml
installation_profile:
  id: edge-standard

  runtime:
    architecture: amd64
    os: linux

  deployment:
    mode: edge

  resources:
    memory_gb: 8
    storage_gb: 1000
```

### 11.1 Decisão futura de nomenclatura

`DeploymentProfile` é um possível nome futuro mais preciso.

Até uma alteração formal do schema, `InstallationProfile` permanece o nome oficial, mas nunca deve ser interpretado como modelo de instalação física.

## 12. Pipeline do Engine

A arquitetura interna inicial é:

```
ProjectDefinition
       |
       v
Schema Validation
       |
       v
Normalization
       |
       v
Module Resolution
       |
       v
Hardware Resolution
       |
       v
Rule Evaluation
       |
       v
Resource Calculation
       |
       v
BOM Generation
       |
       v
Build/System Plan
```

### Schema Validation

Verifica estrutura e tipos.

### Normalization

Converte entradas válidas em uma representação canônica.

### Module Resolution

Resolve módulos e dependências.

### Hardware Resolution

Relaciona requisitos e capabilities com hardware homologado.

### Rule Evaluation

Executa as regras aplicáveis.

### Resource Calculation

Calcula recursos necessários.

### BOM Generation

Gera a composição final de hardware e recursos.

### Build/System Plan

Produz uma representação consumível por outras ferramentas.

## 13. Separação entre catálogo e Engine

O conhecimento técnico deve ser preferencialmente declarado como dados versionados.

Estrutura conceitual:

```
catalog/
  hardware/
  modules/
  profiles/

rules/
  core/
  sport/

schemas/
  project-definition/
  hardware/
  module/
  rule/
  bom/
  installation-profile/
```

O Engine fornece a lógica para interpretar esses dados.

Isso permite alterar catálogo ou regras sem necessariamente alterar o runtime do Engine.

## 14. GitHub como fonte versionada

O repositório GitHub deve ser a fonte versionada de:

- código do Engine;
- schemas;
- catálogo de hardware;
- módulos;
- regras;
- perfis;
- exemplos;
- testes;
- documentação.

A interface web/app pode consumir essas definições.

O GitHub não precisa ser o banco de dados operacional de projetos; ele é principalmente a fonte versionada do sistema e de seus artefatos declarativos.

## 15. Web/App

A aplicação web ou app não deve duplicar a lógica técnica principal.

Arquitetura possível:

```
GitHub
  |
  +--> schemas
  +--> catalog
  +--> rules
  +--> modules
  |
  v
SportsCam Engine
  |
  v
Web/App
```

Uma primeira implementação pode executar o Engine no navegador, desde que os schemas, catálogo e regras sejam carregados de forma determinística.

O mesmo Engine deve poder futuramente ser executado:

- no browser;
- via CLI;
- via API;
- em CI;
- em serviços backend.

## 16. SportsCam Core versus SportsCam Engine

São componentes diferentes.

### SportsCam Core

É o software/runtime que executa as capacidades do sistema, por exemplo:

- captura;
- buffer;
- gravação;
- replay;
- armazenamento;
- interfaces operacionais;
- recuperação;
- monitoramento.

### SportsCam Engine

É o motor de definição e análise:

- ProjectDefinition;
- catálogo;
- módulos;
- regras;
- compatibilidade;
- resolução;
- dimensionamento lógico;
- BOM;
- perfis técnicos.

O Engine pode gerar configuração para o Core, mas não é o runtime do sistema instalado.

## 17. O que não pertence ao Engine

Além da instalação física, ficam fora do núcleo:

- CAD;
- desenho da quadra;
- planejamento de postes;
- cálculo estrutural;
- roteamento físico de cabos;
- instruções de montagem;
- checklist de instalação física;
- vistoria;
- execução de obra.

Isso não impede que ferramentas externas tratem desses assuntos.

A decisão é simplesmente que esses problemas **não fazem parte do modelo central do SportsCam Engine**.

## 18. Princípios permanentes

1. **Determinismo:** mesma entrada e mesmas versões produzem o mesmo resultado.
2. **Reprodutibilidade:** um resultado deve poder ser reproduzido posteriormente.
3. **Schema-first:** contratos de dados são explícitos e versionados.
4. **Configuração antes de customização:** diferenças devem preferencialmente ser representadas por dados, módulos e regras.
5. **Catálogo homologado:** hardware precisa existir no catálogo para participar de uma configuração válida.
6. **Explicabilidade:** decisões derivadas devem indicar suas regras/origens quando possível.
7. **Versionamento:** Engine, schemas, catálogo e regras devem ser versionáveis.
8. **Core estável:** o Engine não deve carregar lógica específica de cliente.
9. **Módulos reutilizáveis:** capacidades opcionais devem ser isoladas.
10. **IA não obrigatória:** nenhum resultado técnico fundamental depende de IA.
11. **Fronteira física:** instalação física não pertence ao domínio do Engine.
12. **Separação de responsabilidades:** UI, Engine, catálogo e runtime não devem ser confundidos.

## 19. Critério de sucesso do MVP

Deve ser possível fornecer um `ProjectDefinition` diretamente ao Engine e obter uma resposta determinística contendo:

- validade estrutural;
- módulos resolvidos;
- hardware compatível;
- dependências;
- regras aplicadas;
- recursos calculados;
- BOM;
- avisos;
- incompatibilidades;
- perfil técnico/deployment quando necessário.

Tudo isso deve funcionar sem IA e sem qualquer conhecimento sobre a instalação física.

## 20. Próximos artefatos

A próxima etapa da arquitetura é definir formalmente:

1. `ProjectDefinition.schema.json`;
2. `Hardware.schema.json`;
3. `Module.schema.json`;
4. `Rule.schema.json`;
5. `BOM.schema.json`;
6. `InstallationProfile.schema.json`;
7. formato de referências entre schemas;
8. formato de versionamento;
9. primeiro conjunto de regras;
10. contrato de entrada/saída do Engine;
11. testes determinísticos;
12. estrutura do catálogo.

## 21. Regra de precedência documental

Este documento é a referência arquitetural canônica para o `SportsCam Engine`.

Documentos anteriores que tratavam o Engine como sistema de instalação, dimensionamento físico, planejamento de quadras, posicionamento de câmeras ou geração de instruções de instalação não fazem mais parte da arquitetura vigente.

Quando houver conflito, esta definição prevalece até que uma nova decisão arquitetural seja registrada explicitamente.


## 22. Contrato técnico de hardware e catálogo de referências

O catálogo de hardware deve separar claramente **requisito técnico** de **produto concreto**.

### 22.1 Contrato técnico

O contrato responde:

> O que o projeto exige?

Ele define um piso de capacidades, não um modelo comercial específico.

Exemplo inicial para câmera: `CAMERA_BASE_V1`

- resolução mínima: 1920x1080;
- taxa mínima: 30 FPS;
- transporte: rede/IP ou tecnologia wireless equivalente;
- alimentação externa;
- armazenamento interno não requerido;
- PTZ/rotação não requerido;
- microfone não requerido;
- bateria não requerida;
- gravação local não requerida;
- uso anunciado pelo fabricante não é critério de compatibilidade.

HDMI e USB não fazem parte da arquitetura primária para transporte de vídeo de longa distância.

### 22.2 Variantes de capacidade

O contrato pode possuir variantes para diferentes níveis de capacidade, sem transformar cada variante em um produto:

- 1080p30;
- 1080p60;
- 1080p30/60 com PoE;
- 2K30;
- 2K60;
- 4K30;
- outras variantes futuras.

Uma capacidade superior pode satisfazer uma exigência inferior quando todas as demais restrições forem atendidas.

O Engine deve retornar **opções compatíveis**, não um "melhor produto" implícito. A escolha entre alternativas pode ser feita pela configuração do projeto ou pelo usuário.

### 22.3 Hardware concreto

O hardware concreto é um registro de catálogo que informa quais capacidades um produto realmente possui.

Modelo conceitual mínimo:

```yaml
hardware:
  id: CAM-001
  category: camera
  model: example-model

  capabilities:
    resolution:
      width: 1920
      height: 1080
    fps:
      max: 30
    transmission:
      - wifi
    power:
      - external

  compatibility:
    protocols:
      - rtsp

  reference_price:
    value: 185.00
    currency: BRL
    reference_date: 2026-10-03

  purchase_reference:
    source: aliexpress
    url: https://example.invalid/product
```

Os campos exatos serão formalizados no schema de Hardware. O exemplo é conceitual.

### 22.4 Preço de referência

Preço é metadado do catálogo, não parte do contrato técnico.

Para o MVP:

- AliExpress é a fonte de referência prioritária para pesquisa;
- o custo efetivamente verificado pode considerar frete e tributos no momento da pesquisa;
- o valor verificado é então armazenado como **preço de referência estático**;
- a data da referência deve ser registrada;
- o link de compra/referência deve ser registrado.

O sistema **não** deve implementar:

- cálculo dinâmico de frete;
- cálculo de impostos;
- simulador de importação;
- câmbio em tempo real;
- histórico automático de preços;
- monitoramento de anúncios;
- APIs de preço de fornecedores.

Esses processos pertencem à pesquisa/manutenção do catálogo, não ao Engine.

### 22.5 Modelo de resolução

A resolução de hardware segue:

```
ProjectDefinition
      |
      v
Technical Contract
      |
      v
Capability Requirements
      |
      v
Hardware Catalog
      |
      v
Compatible Hardware
      |
      v
Project Configuration
      |
      v
BOM + reference costs
```

A responsabilidade de cada camada é:

- **Contract:** define o que é necessário;
- **Catalog:** registra produtos e capacidades verificadas;
- **Engine:** verifica compatibilidade de forma determinística;
- **Project Configuration:** registra quais opções foram escolhidas e quantidades;
- **BOM:** consolida os recursos derivados.

O catálogo não deve exigir um inventário físico detalhado de cada unidade instalada. O sistema trabalha com perfis/capacidades de hardware e referências de produtos.

### 22.6 Famílias iniciais

O mesmo princípio de contrato + variante + catálogo deve ser aplicado às demais famílias:

- câmera;
- rede (Ethernet, PoE, Wi-Fi e wireless/IP);
- alimentação;
- cabos;
- antenas/rádio;
- processamento;
- armazenamento.

Cada família deve expor somente as capacidades relevantes para as regras do Engine.

### 22.7 Decisão arquitetural

A arquitetura oficial passa a considerar:

```
CONTRACT
  = requisito/capability floor

HARDWARE CATALOG
  = produto concreto + capabilities + referência de preço/link

ENGINE
  = compatibilidade e resolução determinística

PROJECT CONFIGURATION
  = seleção + quantidade

BOM
  = resultado derivado
```

Não será criado um motor de compras ou de preços em tempo real.
