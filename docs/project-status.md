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
