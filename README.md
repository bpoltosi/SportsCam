# SportsCam

Arquitetura e implementação do SportsCam Engine e seus componentes.

A referência arquitetural canônica está em `docs/architecture/sportscam-engine.md`.


## Python Device Runtime

A execução física fica em `runtime/python`, separada do Engine TypeScript.

Suporta adapters para RTSP, ONVIF, HTTP, USB/UVC, Serial, GPIO e NVR, além de um pipeline FFmpeg para gravação em segmentos e criação de clipes/replays.

Exemplo:

```bash
python -m sportscam_runtime.cli replay --input recording.mkv --event 600 --pre 10 --post 10 --output clips/replay.mp4
```

Arquitetura detalhada: `docs/architecture/python-device-runtime.md`.
