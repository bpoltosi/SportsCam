# SportsCam — Status de Evolução

Data: 2026-10-03

## Concluído nesta etapa

- arquitetura sistêmica consolidada em `docs/architecture/sportscam-system.md`;
- schemas JSON Schema para hardware, módulos, regras, BOM, deployment profile, eventos, clips, heartbeat e sessões de upload;
- contrato OpenAPI MVP em `docs/api/openapi.yaml`;
- protocolo Edge ↔ Backend;
- pipeline de mídia;
- baseline de segurança;
- observabilidade;
- migrações SQL 005–007 para mídia, edge, comandos e sessões de upload;
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

## Implementado no fluxo Media/Edge

- persistência de devices, cameras, recordings, segments, events, clips e processing jobs;
- emissão de credencial de dispositivo uma única vez com hash SHA-256 em repouso;
- heartbeat autenticado por dispositivo;
- comandos edge duráveis com pull + ACK;
- rotação de credencial;
- lifecycle de recording/segment;
- ingestão de eventos com validação de tenant/projeto;
- enqueue atômico de clip + processing job;
- worker Python persistente com retry/dead-letter;
- geração de clips atravessando múltiplos segmentos com FFmpeg;
- registro de media object local com checksum SHA-256;
- contrato `ObjectStore` provider-neutral;
- upload multipart/resumível local como implementação de referência;
- persistência de sessões de upload e contrato JSON Schema;
- testes do multipart local;
- validação dos JSON Schemas no CI Node;
- contrato Python `EdgeClient` stdlib-only para heartbeat, pull e ACK.

## Ainda não considerado concluído

1. Adapter de object storage de produção e transporte resumível real.
2. E2E com o simulador produzindo segmentos e executando o ciclo completo de upload/registro no backend.
3. Isolamento multi-tenant completo em todas as rotas e testes negativos abrangentes.
4. Rate limiting e hardening de autenticação.
5. Frontend/painel implementado; a UX já está documentada, mas a implementação completa ainda não está fechada.
6. Billing/entitlements reais.
7. Deployment de produção e estratégia de atualização do edge.
8. Implementação completa ONVIF SOAP/WS-Discovery.

## Bloqueios reais restantes

Não há bloqueio para continuar a implementação local/estrutural.

As decisões de infraestrutura ainda abertas podem ser isoladas por interfaces e não devem bloquear o domínio.

O principal bloqueio para declarar o MVP operacional continua sendo o E2E persistente: dispositivo/simulador → segmentos → upload → backend → evento → clip → media object → painel.

### Observação sobre ONVIF

O adapter ONVIF existente permanece deliberadamente conservador. A implementação completa de SOAP/WS-Discovery não foi aplicada nesta execução porque o mecanismo de alteração do repositório bloqueou esse trecho de código de rede. Isso não bloqueia o restante da arquitetura, pois o protocolo está isolado atrás do contrato de Device.

### Próximo bloco recomendado

- transformar o contrato de upload em endpoints backend;
- adicionar simulador de câmera/edge que gera segmentos determinísticos;
- conectar esse simulador ao lifecycle de recording/segment;
- fechar E2E automatizado com storage local;
- depois substituir somente o adapter de storage por S3-compatible/object storage.
