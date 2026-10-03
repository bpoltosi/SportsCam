# SportsCam — Especificação de Arquitetura do Sistema

> **Status:** arquitetura-alvo em consolidação
> **Versão:** 0.1
> **Data:** 2026-10-03
> **Objetivo:** definir a arquitetura técnica oficial do produto antes da implementação pesada.

## 1. Objetivo

O SportsCam é uma plataforma de captura, gravação, replay e gestão de vídeo esportivo, composta por software de borda, processamento, armazenamento, backend e interfaces web/app.

A arquitetura deve permitir operar diferentes combinações de câmeras, dispositivos e perfis de deployment sem transformar cada instalação em um projeto de software independente.

Princípios:
- determinismo onde houver lógica técnica;
- separação entre produto, runtime e catálogo;
- hardware desacoplado por adapters/protocolos;
- configuração declarativa;
- observabilidade desde o início;
- tolerância a falhas de rede e dispositivos;
- IA opcional e periférica;
- instalação física fora do núcleo do Engine.

## 2. Arquitetura em camadas

```
                    ┌─────────────────────────────┐
                    │       Site / Web App        │
                    │ vendas + painel operacional │
                    └──────────────┬──────────────┘
                                   │
                              API / Auth
                                   │
                    ┌──────────────▼──────────────┐
                    │       SportsCam Backend     │
                    │ projects / users / media    │
                    │ jobs / billing / audit      │
                    └───────┬───────────┬─────────┘
                            │           │
                    ┌───────▼───┐   ┌──▼──────────┐
                    │   Engine  │   │ Media/Jobs  │
                    │ deterministic│ │ processing │
                    └───────┬───┘   └────┬────────┘
                            │             │
                    catalog/rules         │
                            │             │
                    ┌───────▼─────────────▼────────┐
                    │        Edge / Device Runtime  │
                    │ capture / recorder / uploader  │
                    └──────────────┬─────────────────┘
                                   │
                           Camera / NVR / Network
```

## 3. Componentes

### 3.1 Site público

Responsável por:
- apresentação do produto;
- soluções;
- planos;
- demonstração;
- contato;
- autenticação.

Não contém lógica técnica de resolução de hardware.

### 3.2 Painel operacional

Responsável por:
- organizações;
- projetos;
- locais lógicos;
- dispositivos;
- câmeras;
- gravações;
- eventos;
- clips;
- usuários;
- configurações;
- saúde do sistema.

### 3.3 Backend

Responsável por:
- API;
- autenticação/autorização;
- persistência;
- jobs;
- metadados de mídia;
- storage orchestration;
- billing/entitlements;
- auditoria;
- integração com edge.

### 3.4 SportsCam Engine

Responsável por:
- ProjectDefinition;
- schemas;
- módulos;
- catálogo;
- regras;
- compatibilidade;
- resolução;
- recursos;
- BOM;
- perfis de deployment.

O Engine deve ser executável sem IA.

### 3.5 SportsCam Core / Device Runtime

Responsável por:
- captura;
- gravação;
- segmentação;
- buffer/replay;
- upload;
- health checks;
- recuperação;
- comunicação com dispositivos.

O runtime Python já possui arquitetura própria em `docs/architecture/python-device-runtime.md`.

### 3.6 Processamento de mídia

Responsável por:
- geração de clips;
- thumbnails;
- previews;
- transcodificação quando necessária;
- composição futura;
- processamento assíncrono.

FFmpeg é o caminho preferencial para operações de mídia.

## 4. Domínios de dados

Entidades operacionais iniciais:

```
Organization
User
Role / Permission
Project
Venue
Field
Device
Camera
Recording
RecordingSegment
Event
Clip
MediaObject
ProcessingJob
Subscription
Plan
Entitlement
Contract
Invoice
AuditLog
```

Relação conceitual:

```
Organization
  ├── Users
  ├── Projects
  │     └── Venue / Field
  │            ├── Cameras
  │            └── Devices
  ├── Media
  └── Billing
```

O modelo físico do banco deve ser definido em uma etapa própria; este documento define o domínio, não o schema final.

## 5. ProjectDefinition e Engine

O Engine recebe:

```
ProjectDefinition
+ Catalog Version
+ Rules Version
+ Engine Version
```

e produz um resultado determinístico:

```
Validation
Modules
Compatible Hardware
Dependencies
Resources
BOM
Warnings / Errors
Deployment Profile
```

O Engine não modela:
- altura de câmera;
- orientação física;
- distância física;
- cabos físicos;
- suportes;
- estrutura civil/elétrica;
- instalação;
- vistoria.

A especificação canônica atual está em `docs/architecture/sportscam-engine.md`.

## 6. Catálogo de hardware

O catálogo separa:

```
Technical Contract
      ↓
Capability Requirements
      ↓
Hardware Catalog
      ↓
Compatible Options
      ↓
Project Selection
      ↓
BOM
```

O contrato técnico define capacidades mínimas. O catálogo registra produtos concretos, suas capacidades verificadas e metadados de referência.

Preço é metadado estático versionado, não parte da lógica de compatibilidade.

A primeira fonte de referência comercial pode ser AliExpress, com preço e data registrados. O sistema não terá motor de preço/frete/imposto em tempo real.

## 7. Runtime e protocolo Edge

Fluxo:

```
Camera
  ↓
Device Adapter
  ↓
Recorder / Segmenter
  ↓
Local Storage
  ↓
Uploader / Queue
  ↓
Backend
  ↓
Object Storage
```

Requisitos:
- operação offline temporária;
- retomada de uploads;
- idempotência;
- heartbeat;
- sincronização de relógio;
- health state;
- backoff;
- atualização controlada;
- logs e métricas.

O vídeo não deve passar frame a frame por Python no caminho normal. FFmpeg recebe RTSP diretamente e grava segmentos.

## 8. Pipeline de vídeo

Pipeline-base:

```
RTSP / UVC / NVR / input
          ↓
FFmpeg
          ↓
Segmented Recording
          ↓
MediaObject + Recording metadata
          ↓
Event
          ↓
Replay Window
          ↓
Clip
          ↓
Preview / Delivery
```

Gravação deve preferir stream copy. Transcoding é excepcional e assíncrono quando possível.

## 9. Eventos e clips

Evento é uma ocorrência temporal independente da origem.

Exemplos:
- manual;
- sensor;
- integração;
- algoritmo;
- IA futura.

Modelo conceitual:

```
Event(timestamp)
   ↓
pre-roll + post-roll
   ↓
Clip Job
   ↓
Clip
```

A origem do evento não deve alterar o contrato do clip.

## 10. Storage

Separar:
- storage local no edge;
- object storage central;
- metadata no banco;
- distribuição/streaming.

Requisitos:
- retenção;
- quotas;
- lifecycle;
- integridade;
- recuperação;
- limpeza segura;
- custo por projeto/plano.

## 11. API

A API deve ser versionada e possuir contratos explícitos.

Famílias iniciais:

```
/auth
/organizations
/users
/projects
/venues
/fields
/devices
/cameras
/recordings
/events
/clips
/media
/jobs
/billing
/audit
/health
```

Requisitos:
- autenticação;
- RBAC;
- validação;
- paginação;
- idempotência em comandos críticos;
- erros padronizados;
- observabilidade;
- versionamento.

## 12. Multi-tenancy e segurança

Modelo:
```
Organization → Projects → Devices / Media
```

Papéis iniciais:
- Owner;
- Admin;
- Manager;
- Operator;
- Viewer.

Princípios:
- isolamento por organization;
- menor privilégio;
- secrets fora do código;
- tokens rotacionáveis;
- auditoria;
- criptografia em trânsito;
- políticas de retenção;
- validação de origem dos dispositivos.

## 13. Billing e contratos

Separar:
- Plan;
- Subscription;
- Contract;
- Entitlement;
- Usage;
- Invoice.

Entitlements controlam limites do produto, como:
- número de câmeras;
- horas de retenção;
- storage;
- usuários;
- recursos avançados.

Billing não deve contaminar o Engine técnico.

## 14. Observabilidade

Cada dispositivo deve expor pelo menos:
- online/offline;
- last heartbeat;
- CPU;
- RAM;
- disco;
- temperatura quando disponível;
- FPS;
- dropped frames;
- bitrate;
- upload;
- espaço disponível;
- última gravação;
- erros recentes.

Backend deve ter:
- logs estruturados;
- métricas;
- tracing quando necessário;
- alertas;
- histórico de jobs.

## 15. Resiliência

Casos obrigatórios:
- câmera desconectada;
- internet indisponível;
- servidor indisponível;
- FFmpeg encerrado;
- disco cheio;
- upload parcial;
- reboot;
- relógio incorreto;
- duplicação de eventos;
- jobs repetidos.

O sistema deve preferir recuperação automática e tornar a falha visível ao operador.

## 16. CI/CD e repositório

Estrutura recomendada:

```
apps/
  web/
  api/

packages/
  engine/
  schemas/
  shared/

runtime/
  python/

catalog/
  hardware/
  modules/
  profiles/

rules/
  core/
  sport/

docs/
  architecture/
  api/
  operations/

tests/
  engine/
  api/
  runtime/
  e2e/
```

O catálogo e as regras são artefatos versionados.

CI deve validar:
- lint;
- type checks;
- unit tests;
- schema validation;
- deterministic engine fixtures;
- integration tests;
- build;
- security checks.

## 17. Estratégia de testes

### Engine
- mesma entrada → mesmo resultado;
- incompatibilidades;
- dependências;
- regras;
- BOM;
- versionamento.

### Runtime
- start/stop;
- reconnect;
- process crash;
- segment integrity;
- upload retry;
- offline queue.

### API
- auth;
- RBAC;
- tenant isolation;
- validation;
- idempotency.

### E2E
- projeto → configuração → dispositivo → gravação → evento → clip → painel.

## 18. Roadmap de implementação

### Fase 0 — Arquitetura e contratos
Fechar documentação, schemas, versionamento e critérios de aceite.

### Fase 1 — Site e painel prototipados
Construir todas as telas e fluxos principais sem depender das funções reais.

### Fase 2 — Engine formal
Schemas, catálogo mínimo, regras, resolução e BOM determinísticos.

### Fase 3 — Core/runtime
Fechar adapters, recorder, segmentation, local queue e health.

### Fase 4 — Backend
Banco, API, auth, projects, devices, recordings, events, clips.

### Fase 5 — Storage/media
Object storage, jobs, clip service, previews e retenção.

### Fase 6 — Operação
Observabilidade, recovery, update mechanism, audit e segurança.

### Fase 7 — Billing
Plans, contracts, entitlements, usage e invoices.

### Fase 8 — Integração completa
E2E e piloto com hardware real.

## 19. Definition of Architecture Complete

A arquitetura será considerada suficientemente estruturada quando:

- [ ] domínio e responsabilidades estiverem documentados;
- [ ] schemas principais estiverem definidos;
- [ ] versionamento estiver definido;
- [ ] API contracts estiverem definidos;
- [ ] modelo de dados estiver definido;
- [ ] protocolo edge/backend estiver definido;
- [ ] pipeline de vídeo estiver definido;
- [ ] evento/clip estiverem definidos;
- [ ] storage/lifecycle estiver definido;
- [ ] auth/RBAC estiver definido;
- [ ] observabilidade estiver definida;
- [ ] segurança mínima estiver definida;
- [ ] CI/CD estiver definido;
- [ ] testes críticos estiverem definidos;
- [ ] site/painel tiverem protótipo completo;
- [ ] Engine produzir resultado determinístico;
- [ ] runtime conseguir gravar e recuperar de falhas básicas;
- [ ] um fluxo E2E mínimo estiver demonstrado.

## 20. Definition of MVP técnico

O primeiro MVP técnico deve conseguir:

1. cadastrar um projeto;
2. resolver sua configuração;
3. cadastrar um dispositivo;
4. conectar uma câmera;
5. gravar segmentos;
6. registrar uma recording;
7. criar um evento;
8. gerar um replay clip;
9. armazenar o clip;
10. exibir o resultado no painel;
11. sobreviver a uma queda temporária de rede;
12. mostrar a saúde do dispositivo.

## 21. Decisões que permanecem abertas

Ainda precisam de ADR/decisão formal:
- banco principal;
- object storage;
- autenticação/provedor;
- framework final do frontend;
- framework final da API;
- mecanismo de jobs;
- protocolo de comunicação edge/backend;
- estratégia de distribuição/update do runtime;
- estratégia de streaming/playback;
- modelo comercial inicial;
- hardware de referência do primeiro piloto.

Essas decisões não devem bloquear a documentação do domínio e dos contratos.

## 22. Relação com documentos existentes

- `docs/architecture/sportscam-engine.md`: referência canônica do Engine determinístico.
- `docs/architecture/python-device-runtime.md`: referência do runtime físico Python.
- Este documento: arquitetura sistêmica que conecta produto, backend, Engine, runtime e operação.

Quando houver conflito, decisões arquiteturais explícitas e mais recentes devem atualizar os documentos afetados e registrar a mudança em issue/ADR.
