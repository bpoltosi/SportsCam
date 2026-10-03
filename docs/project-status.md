# SportsCam — Status de Evolução

Data: 2026-10-03

## Concluído nesta etapa

- arquitetura sistêmica consolidada em `docs/architecture/sportscam-system.md`;
- schemas JSON Schema para hardware, módulos, regras, BOM, deployment profile, eventos, clips e heartbeat;
- contrato OpenAPI MVP em `docs/api/openapi.yaml`;
- protocolo Edge ↔ Backend;
- pipeline de mídia;
- baseline de segurança;
- observabilidade;
- migração SQL 005 para devices, cameras, recordings, segments, media objects, events, clips e processing jobs;
- ADRs de fronteiras arquiteturais e hot path de vídeo;
- CI Node além do CI Python existente;
- supervisor de gravadores com backoff exponencial e teste automatizado;
- backlog arquitetural mantido nas Issues #57–#68.

## Já existente antes desta etapa

- Engine determinístico com resolução de dependências, regras e compatibilidade;
- schemas de ProjectDefinition e EngineResult;
- catálogo versionado de módulos, regras e câmeras;
- CLI do Engine;
- persistência SQLite e migrations;
- autenticação/sessões;
- organização, membros, projetos comerciais, contratos e instalações;
- state machines de domínio;
- API Fastify;
- runtime Python com adapters para múltiplos tipos de dispositivo;
- FFmpeg para gravação segmentada e clips;
- testes de Engine, persistência, domínio e runtime.

## Ainda não considerado concluído

1. Implementação das novas entidades de mídia/edge no repository e API.
2. Object storage real e upload resumível.
3. Job worker persistente para clips/processamento.
4. Autenticação dedicada de dispositivos.
5. Heartbeat real persistido e comandos edge.
6. Validação automatizada de todos os JSON Schemas.
7. Isolamento multi-tenant completo em todas as rotas.
8. Rate limiting e hardening de autenticação.
9. E2E real com câmera/simulador → gravação → evento → clip → painel.
10. Frontend/painel implementado; a UX já está documentada, mas a implementação completa ainda não está fechada.
11. Billing/entitlements reais.
12. Deployment de produção e estratégia de atualização do edge.

## Bloqueios reais restantes

Não há bloqueio para continuar a implementação local/estrutural.

As decisões de infraestrutura ainda abertas (object storage, provedor de auth, mecanismo de jobs e deployment final) podem ser isoladas por interfaces e não devem bloquear o desenvolvimento do domínio.

O principal bloqueio para declarar o MVP operacional é a integração E2E com um fluxo de mídia persistente e um dispositivo/simulador real.


## Media/Edge implementation update — 2026-10-03

Implemented in repository:
- persistent media/edge repository for devices, recordings, segments, events, clips and processing jobs;
- one-time device credential issuance with SHA-256-at-rest credential storage;
- device-authenticated heartbeat path separated from human session authentication;
- recording and segment lifecycle API;
- event ingestion and tenant/project ownership checks;
- clip enqueue API that creates a persistent processing job atomically;
- Python persistent clip worker with retry/dead-letter behavior;
- clip generation spanning multiple recording segments using FFmpeg concat + stream copy;
- local media-object registration with SHA-256 checksum;
- JSON Schema compilation validation in the Node CI check;
- persistence tests for device authentication and atomic clip enqueue.

The remaining production boundary is object-storage/resumable-upload integration and a real/simulated edge agent that continuously uploads segment metadata/files. The clip worker intentionally uses a local filesystem media root so the storage provider can be replaced without changing the processing contract.
