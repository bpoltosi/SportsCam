# SportsCam

Plataforma modular para captura de vídeo esportivo, processamento de mídia e geração de **clips/replays**, com um Engine determinístico, backend, runtime Python para dispositivos e site público.

## Visão geral

O projeto separa a lógica de configuração do produto, os serviços de negócio, a integração com dispositivos físicos e o processamento de vídeo. A arquitetura busca permitir que diferentes câmeras e módulos de hardware sejam descritos por catálogo e conectados por contratos explícitos.

## Componentes

- **Engine TypeScript (`packages/engine/`)** — resolução determinística de projetos, módulos, regras, compatibilidade e catálogo de hardware.
- **Domínio (`packages/domain/`)** — entidades de negócio e transições de estado.
- **Persistência (`packages/persistence/`)** — SQLite, migrations, projetos, instalações, mídia e resoluções.
- **Autenticação (`packages/auth/`)** — autenticação e sessões.
- **API (`apps/api/`)** — servidor Fastify, autorização, serviços de negócio e endpoints.
- **Runtime Python (`runtime/python/`)** — adapters para RTSP, ONVIF, HTTP, NVR, USB/UVC, serial e GPIO; simulação; gravação e processamento de clips via FFmpeg.
- **Catálogos e schemas (`catalog/`, `schemas/`)** — definições versionadas de câmeras, módulos, regras e contratos JSON.
- **Site (`apps/web/`)** — site público estático.
- **Documentação (`docs/`)** — arquitetura, API, segurança, UX, operação e status.

## Tecnologias

TypeScript, Node.js, Fastify, Zod, SQLite, Python, FFmpeg, OpenCV (em adapters que necessitam de câmera), JSON Schema e GitHub Actions.

## Desenvolvimento

Requer Node.js e npm para o Engine/API:

```bash
npm install
npm run check
npm run dev
```

Comandos definidos no `package.json`:
- `npm run build` — compilação TypeScript.
- `npm run typecheck` — verificação de tipos.
- `npm test` — testes automatizados.
- `npm run check` — typecheck, validação de catálogos/schemas e testes.
- `npm run engine` — CLI do Engine.

O runtime Python possui configuração e instruções próprias em [runtime/python/README.md](runtime/python/README.md). FFmpeg é uma dependência de sistema para processamento de vídeo.

## Arquitetura e estado

- [Arquitetura sistêmica](docs/architecture/sportscam-system.md)
- [Engine](docs/architecture/sportscam-engine.md)
- [Runtime de dispositivos](docs/architecture/python-device-runtime.md)
- [Pipeline de mídia](docs/architecture/media-pipeline.md)
- [Status do projeto](docs/project-status.md)
- [Contrato OpenAPI](docs/api/openapi.yaml)

## Status

Projeto em desenvolvimento ativo. O status documentado registra componentes implementados e pendências; não assuma que toda a cadeia está validada em hardware real ou pronta para produção sem executar os testes e verificações do ambiente.