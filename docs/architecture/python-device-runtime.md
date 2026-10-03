# Python Device Runtime

## Responsabilidade

O Engine TypeScript resolve deterministicamente o projeto. O runtime Python executa integração física e mídia. Nenhum driver conhece Fastify, SQLite ou o Engine.

## Regra de dependências

```
core
  ^        ^
  |        |
devices  media
   \      /
    composition/CLI
```

O núcleo define contratos/modelos. Drivers dependem do núcleo. Mídia depende do núcleo. A API não é importada pelos drivers. A montagem concreta fica na factory/CLI.

Isso permite trocar uma câmera, NVR, biblioteca ou protocolo sem alterar o restante do sistema.

## Hot path de vídeo

A gravação não passa frames por Python. FFmpeg recebe o RTSP diretamente e escreve segmentos no disco. Python apenas inicia, monitora e encerra o processo.

Isso evita:
- cópia de cada frame para Python;
- uso desnecessário de CPU;
- crescimento de memória;
- bloqueio do processo principal.

Processos de longa duração usam `Popen` sem buffer de stdout/stderr em memória. Operações curtas, como gerar um clip, usam subprocesso bloqueante porque o resultado é necessário antes de continuar.

## Gravação

`start_rtsp_recording()` retorna imediatamente um `RecorderHandle`. O chamador pode consultar `running` e chamar `stop()`.

Segmentos são gerados pelo próprio FFmpeg com stream copy, evitando transcoding durante a gravação.

## Clips e replay

O clip usa stream copy por padrão. Isso é muito mais barato que recodificar. Recodificação H.264/AAC fica disponível quando necessário para compatibilidade.

`create_replay_clip()` converte um timestamp de evento em uma janela:

`max(0, evento - pré)` até `evento + pós`.

## Otimização

- FFmpeg faz ingestão, mux e segmentação;
- Python não processa frames salvo quando uma integração UVC realmente precisa deles;
- drivers opcionais são carregados apenas quando usados;
- factory usa dependency injection para evitar acoplamento do core;
- processos longos não acumulam logs na RAM;
- clips usam stream copy por padrão;
- validações rejeitam parâmetros inválidos antes de iniciar FFmpeg.

## Próximo nível

Para produção, o supervisor do runtime deverá manter uma tabela de processos por câmera, detectar exit codes, aplicar backoff exponencial em reconexões e expor métricas. Isso deve continuar fora dos drivers individuais.
