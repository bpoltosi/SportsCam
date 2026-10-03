# SportsCam Device Runtime

Runtime Python para comunicação com hardware e processamento de vídeo.

## Objetivos

- manter drivers físicos separados do Engine TypeScript;
- oferecer uma interface comum para câmeras, I/O, serial, USB/UVC e NVR;
- funcionar em modo simulado quando o hardware não estiver disponível;
- usar FFmpeg como camada de mídia para RTSP, gravação e criação de clipes;
- permitir que o agente físico rode em Linux, mini-PC, Raspberry Pi ou outro gateway.

## Estrutura

- `sportscam_runtime/core`: contratos e modelos comuns.
- `sportscam_runtime/devices`: drivers/adapters.
- `sportscam_runtime/media`: gravação, segmentos e clipes.
- `sportscam_runtime/cli.py`: comandos operacionais.
- `tests/`: testes sem hardware.

## Dependências opcionais

O núcleo usa somente biblioteca padrão Python. Drivers podem ativar extras:

- `uvc`: OpenCV para câmeras USB.
- `serial`: pyserial.
- `gpio`: gpiozero.
- `onvif`: requests para integração HTTP/SOAP ONVIF.

FFmpeg é tratado como dependência de sistema para vídeo.

## Exemplos

```bash
python -m sportscam_runtime.cli devices
python -m sportscam_runtime.cli clip --input recordings/camera.mkv --start 00:10:00 --duration 15 --output clips/replay.mp4
python -m sportscam_runtime.cli segments --input recordings/camera.mkv --segment 60 --output recordings/segments
```

## Persistent clip worker

O processamento assíncrono de clips usa SQLite como fila durável e FFmpeg como hot path:

```bash
python -m sportscam_runtime.media.clip_worker --database sportscam.db --media-root media
```

Para executar apenas um job:

```bash
python -m sportscam_runtime.media.clip_worker --database sportscam.db --media-root media --once
```

O worker faz claim atômico, suporta retry com backoff, dead-letter após tentativas máximas, cria clips atravessando múltiplos segmentos e registra o media_object com checksum SHA-256.
