# SportsCam

Arquitetura e implementação do SportsCam Engine e seus componentes.

## Arquitetura

A arquitetura sistêmica está documentada em `docs/architecture/sportscam-system.md`.

Referências canônicas:
- `docs/architecture/sportscam-system.md` — arquitetura do produto completo.
- `docs/architecture/sportscam-engine.md` — Engine determinístico, catálogo, regras e BOM.
- `docs/architecture/python-device-runtime.md` — runtime físico Python e pipeline FFmpeg.

## Roadmap

As próximas etapas estruturais estão registradas nas GitHub Issues **#57–#68**, cobrindo schemas, banco, API, protocolo Edge, vídeo, clips, storage, segurança, observabilidade, CI/CD, protótipo web/painel e fluxo E2E.

## Python Device Runtime

A execução física fica em `runtime/python`, separada do Engine TypeScript.

Suporta adapters para RTSP, ONVIF, HTTP, USB/UVC, Serial, GPIO e NVR, além de um pipeline FFmpeg para gravação em segmentos e criação de clipes/replays.

Exemplo:

```bash
python -m sportscam_runtime.cli replay --input recording.mkv --event 600 --pre 10 --post 10 --output clips/replay.mp4
```


## SportsCam Web

O site público/comercial está em `apps/web` e é publicado por GitHub Pages via `.github/workflows/web-pages.yml`. A pesquisa e as decisões de UX estão em `docs/research/public-site-design-research.md` e `docs/ux/public-site.md`.
