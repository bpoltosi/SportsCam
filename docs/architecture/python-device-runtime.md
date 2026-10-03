# Python Device Runtime

## Responsabilidade

O Engine TypeScript resolve deterministicamente o projeto. O runtime Python executa a integração física e o processamento de mídia.

```
Project Definition -> TS Engine -> resolved hardware/modules
                                      |
                                      v
                              Python Device Runtime
                              |       |       |
                            camera   I/O     NVR
                              |
                            FFmpeg
                              |
                    recording -> segments -> replay clips
```

## Tipos suportados

| Tipo | Driver | Uso |
|---|---|---|
| RTSP camera | `RTSPCamera` | ingestão de vídeo |
| ONVIF camera | `ONVIFCamera` | endpoint/discovery/control; entrega stream RTSP |
| HTTP camera | `HTTPDevice` | APIs REST proprietárias |
| USB/UVC camera | `UVCCamera` | captura local USB |
| Serial | `SerialDevice` | RS-232/RS-485/controladores |
| GPIO | `GPIODevice` | trigger, LED, relé e sinais |
| NVR | `NVRDevice` | integração com gravador |
 
## Mídia

`media/recorder.py` grava RTSP em segmentos rotativos. `media/ffmpeg.py` cria clipes arbitrários e divide gravações. `media/replay.py` cria um replay centrado em um evento:

- evento em T;
- N segundos antes;
- M segundos depois;
- exportação para arquivo;
- manifesto JSON opcional.

O pipeline não depende do fabricante da câmera.

## Segurança

Credenciais não devem ser commitadas em configurações. O runtime deve receber secrets por environment, secret store ou configuração protegida.

## Limite atual

A integração ONVIF completa (WS-Discovery + SOAP GetProfiles/GetStreamUri) e APIs proprietárias de NVR ainda precisam de adapters por fabricante. O contrato do runtime já permite essas implementações sem alterar Engine ou API.
