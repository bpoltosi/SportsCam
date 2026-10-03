---
id: product-spec-quadras-gravacao
version: 1
scope: product
title: "Especificação de referência — Sistema de gravação de jogadas em quadras"
status: draft
---

# Especificação de referência — Sistema de gravação de jogadas em quadras

> **Status:** draft  
> **Versão:** 0.1  
> **Origem:** entrevista de requisitos consolidada em setembro de 2026  
> **Natureza:** especificação de produto e requisitos para orientar arquitetura, seleção de hardware, implementação, instalação e testes.

## 1. Objetivo

Construir uma solução reutilizável para clubes e academias que permita ao jogador solicitar a gravação de uma jogada por meio de um botão físico instalado próximo à quadra.

O sistema deve manter continuamente um buffer de vídeo, recuperar a janela anterior ao acionamento do botão e acrescentar uma janela posterior configurável, gerando um clipe independente sem interromper a captura contínua.

A solução deve funcionar de forma autônoma na instalação, priorizando operação offline e usando cloud de forma opcional e adaptável ao projeto.

A IA Factory é a **construtora e integradora técnica dos projetos**. O sistema instalado pertence operacionalmente ao cliente e deve ser capaz de funcionar sem depender de uma plataforma operacional central da IA Factory.

## 2. Escopo

### 2.1 Incluído

- captura de vídeo de uma ou duas câmeras;
- buffer circular/rolling buffer;
- acionamento por botão físico;
- geração de clipes independentes;
- suporte a clipes sobrepostos;
- armazenamento local;
- sincronização opcional com cloud;
- recuperação após indisponibilidade temporária de rede;
- interface local para acesso aos clipes;
- acesso por QR Code quando configurado;
- acesso cloud quando configurado;
- integração com sistemas de reserva quando disponível;
- identificação de clipes por metadados;
- retenção e limpeza automática;
- monitoramento local;
- alertas operacionais;
- diagnóstico de falhas;
- perfis de instalação;
- dimensionamento adaptativo de hardware;
- testes de instalação e de falhas.

### 2.2 Fora do escopo inicial

- análise automática de jogadas;
- visão computacional;
- identificação de jogadores por IA;
- reconhecimento facial;
- detecção automática de eventos;
- classificação de qualidade das jogadas;
- edição manual de vídeo;
- busca em linguagem natural;
- plataforma social;
- operação centralizada dos clubes pela IA Factory.

## 3. Princípios

1. **Offline-first:** a instalação deve continuar operando quando a Internet estiver indisponível.
2. **Cloud opcional:** cloud é uma capacidade de projeto, não uma dependência universal.
3. **Arquitetura adaptativa:** hardware, câmeras, armazenamento, conectividade e interfaces podem variar por instalação.
4. **Configuração antes de customização:** preferir configuração; depois módulos/plugins; somente então desenvolvimento específico.
5. **Continuidade da captura:** gerar clipes não deve interromper o buffer/captura.
6. **Compatibilidade:** não acoplar o núcleo a um único fabricante, codec ou modelo de câmera.
7. **Observabilidade:** falhas críticas devem ser detectáveis e comunicáveis.
8. **Isolamento:** cada instalação deve ser independente das demais.
9. **Reutilização controlada:** produtos podem compartilhar padrões e componentes, mas não devem ser artificialmente transformados em uma única plataforma.
10. **Simplicidade proporcional ao projeto:** custo, robustez e complexidade devem ser equilibrados conforme o cliente e a instalação.

## 4. Usuários e modelo de negócio

### 4.1 Usuários

- jogador/amador: solicita e acessa seus clipes;
- clube/academia: contrata e utiliza a instalação;
- equipe técnica: instala, configura, mantém e diagnostica.

Não há necessidade inicial de contas individuais de jogadores.

### 4.2 Pagador

O clube/academia é o cliente pagador.

### 4.3 Modelo comercial de referência

A assinatura pode incluir:

- hardware;
- instalação;
- software;
- manutenção;
- armazenamento;
- suporte.

A propriedade do hardware será definida contratualmente com o cliente.

Planos diferentes podem existir, mas a primeira versão deve evitar complexidade comercial desnecessária.

## 5. Fluxo operacional de referência

1. Instalação ligada.
2. Câmeras e computador iniciam automaticamente conforme o perfil.
3. O sistema mantém o buffer configurado.
4. O jogador realiza a jogada.
5. O jogador pressiona o botão.
6. O sistema registra o evento.
7. O sistema recupera o período anterior configurado.
8. Aguarda o período posterior configurado.
9. Gera o clipe sem interromper o buffer.
10. O clipe recebe metadados.
11. O clipe fica disponível localmente.
12. Se configurado, entra na fila de sincronização cloud.
13. O jogador acessa o clipe pela interface disponível no projeto.
14. Após o período de retenção, o sistema remove o clipe automaticamente, respeitando as regras de sincronização configuradas.

## 6. Captura e buffer

### 6.1 Buffer

O buffer é configurável por instalação.

A referência inicial é aproximadamente:

- 45 segundos anteriores necessários para o clipe;
- margem adicional de segurança;
- aproximadamente 60 segundos ou mais de buffer como configuração típica.

O valor final deve ser determinado pelo perfil da instalação.

### 6.2 Janela do clipe

A janela deve possuir:

- pré-roll configurável;
- pós-roll configurável;
- atraso configurável entre a jogada e o acionamento do botão, inicialmente estimado em 3–5 segundos.

O sistema não deve assumir que o botão é pressionado imediatamente após a jogada.

### 6.3 Sobreposição

Múltiplos acionamentos próximos devem gerar clipes independentes.

Clipes podem se sobrepor temporalmente.

A implementação deve evitar cópia física desnecessária dos mesmos dados quando isso puder ser feito sem comprometer simplicidade, confiabilidade ou desempenho.

## 7. Botão físico

### 7.1 Padrão

A IA Factory deve recomendar uma família de botões homologados, mantendo suporte a alternativas compatíveis quando o projeto exigir.

Preferência:

- botão grande;
- industrial/arcade;
- resistente ao uso repetido;
- feedback sonoro;
- LED de status quando possível.

### 7.2 Comunicação

A tecnologia de comunicação deve ser escolhida conforme:

- distância;
- infraestrutura;
- confiabilidade;
- custo;
- facilidade de manutenção.

Possibilidades incluem cabo, Ethernet/PoE, USB ou wireless.

### 7.3 Falha

Falha do botão é uma condição operacional relevante e deve ser detectável, registrada e alertada.

## 8. Câmeras

### 8.1 Quantidade

A arquitetura deve suportar pelo menos:

- 1 câmera;
- 2 câmeras.

### 8.2 Referência

Configuração inicial de referência:

- 1080p;
- 60 FPS.

Esses valores não são limites arquiteturais.

### 8.3 Compatibilidade

A arquitetura deve preferir compatibilidade ampla, incluindo câmeras IP e protocolos/formatos suportados pela implementação.

O sistema não deve depender de um único fabricante.

A preferência é por IP/PoE quando isso trouxer benefício operacional, mas a decisão é por projeto.

### 8.4 Posicionamento

As câmeras são fixas.

A instalação pode utilizar:

- duas câmeras de fundo;
- uma câmera lateral;
- outras configurações justificadas pelo ambiente.

## 9. Computação local

### 9.1 Princípio

A instalação deve possuir um computador/edge dimensionado conforme o projeto.

Não haverá um único modelo obrigatório.

### 9.2 Dimensionamento

O dimensionamento deve considerar automaticamente, sempre que possível:

- número de câmeras;
- resolução;
- FPS;
- codec;
- bitrate;
- necessidade de recodificação;
- armazenamento;
- número esperado de clipes;
- interfaces de rede;
- aceleração de hardware.

### 9.3 GPU

GPU dedicada/aceleração específica somente quando a carga justificar.

### 9.4 Sistema operacional

A escolha deve ser orientada pelo projeto e pelo custo total de operação, não por uma plataforma fixa.

Windows e Linux podem ser considerados.

## 10. Pipeline de vídeo

O pipeline deve ser adaptativo.

### 10.1 Extração

Quando tecnicamente possível, preferir cópia direta do stream sem recodificação.

Quando necessário, realizar recodificação.

### 10.2 Saída de referência

- contêiner: MP4;
- codec: H.264;
- resolução: 1080p;
- áudio: preservar quando disponível.

Esses valores são defaults e devem ser parametrizáveis quando a instalação exigir.

## 11. Armazenamento

A arquitetura deve separar conceitualmente:

- buffer temporário;
- armazenamento de clipes;
- fila de sincronização;
- armazenamento cloud.

O meio físico do buffer pode variar conforme o perfil e o desempenho necessário.

O armazenamento local deve funcionar como fonte operacional mesmo quando a cloud estiver indisponível.

### 11.1 Referência inicial

Um primeiro cenário de instalação considerado durante a descoberta utiliza aproximadamente 2 TB de armazenamento local.

Esse valor não é requisito universal.

## 12. Cloud e sincronização

Cloud é opcional por projeto.

A arquitetura deve suportar:

- local-first;
- cloud-first;
- híbrido.

Mesmo quando cloud-first for utilizado, a perda de Internet não pode causar perda de clipes que ainda estejam disponíveis localmente.

### 12.1 Fila

A sincronização deve possuir uma fila persistente/reprocessável.

Falhas de upload devem permitir retry automático e sinalização de erro quando necessário.

### 12.2 Abstração

A camada de armazenamento cloud deve ser abstraída para evitar acoplamento desnecessário a um único provedor.

## 13. Retenção

A retenção é configurável por instalação.

24 horas é a referência inicial.

A exclusão deve ser automática.

A política de exclusão deve considerar o estado da sincronização e as regras do projeto.

Como requisito de segurança operacional, o sistema não deve apagar um clipe ainda não sincronizado quando a política exigir preservação local até confirmação.

## 14. Reservas

A integração com reservas é desejável e deve ser modular.

Quando houver integração, a reserva pode fornecer:

- quadra;
- horário;
- duração;
- nome;
- identificação da sessão.

A arquitetura deve suportar:

- sistema próprio futuro;
- APIs externas;
- importação;
- outros mecanismos de integração compatíveis.

### 14.1 Com reserva

Quando houver reserva, o sistema pode iniciar/encerrar a gravação automaticamente conforme a configuração da instalação.

### 14.2 Sem reserva

O comportamento deve ser configurável.

A instalação pode continuar operando normalmente, ou utilizar regras específicas do cliente.

## 15. Identificação de clipes

Todo clipe deve possuir um identificador interno único.

Metadados possíveis:

- data;
- hora;
- quadra;
- reserva;
- nome associado à reserva;
- identificador sequencial;
- identificador interno.

Quando não houver reserva, o mínimo de referência é:

**data + hora + quadra**.

O nome de arquivo deve ser amigável e pode ser configurável.

## 16. Acesso aos clipes

A arquitetura deve suportar múltiplas interfaces:

- site local;
- QR Code;
- cloud;
- computador local;
- pasta/armazenamento quando necessário.

A interface efetivamente exposta ao jogador é definida pelo projeto.

### 16.1 Preferência

QR Code é desejável quando o ambiente permitir.

O acesso deve funcionar sem Internet quando a instalação for configurada para operação local.

### 16.2 Segurança

O mecanismo de acesso é adaptativo e pode utilizar:

- acesso local;
- credencial;
- token/link;
- senha vinculada à reserva;
- outros mecanismos adequados ao projeto.

Quando houver integração com reservas, pode-se associar o acesso à reserva.

O isolamento entre arquivos/instalações deve ser preservado.

## 17. Monitoramento e diagnóstico

Cada instalação deve possuir monitoramento local suficiente para determinar se o serviço está operacional.

Itens monitoráveis:

- câmera online/offline;
- botão online/offline;
- armazenamento;
- temperatura;
- computador;
- rede;
- captura;
- geração de clipes;
- sincronização;
- erros de processamento;
- versão do software;
- recursos do sistema.

O cliente deve receber os alertas relevantes para sua instalação.

A IA Factory pode manter os dados técnicos necessários para manutenção e futuras atualizações, sem transformar isso em uma plataforma central de operação dos clubes.

Histórico de incidentes deve ser preservado.

## 18. Recuperação de falhas

O sistema deve ser projetado para recuperação automática sempre que razoável.

Cenários obrigatórios de teste:

- câmera desligada;
- botão desligado;
- perda de Internet;
- perda de rede local;
- reinicialização do computador;
- interrupção de energia;
- armazenamento cheio;
- falha de sincronização;
- múltiplos cliques;
- geração simultânea de clipes;
- recuperação após retorno dos dispositivos.

A resposta exata a uma falha pode depender do perfil de instalação, mas o comportamento deve ser explicitamente definido antes da implantação.

## 19. Atualizações

Atualização automática é uma decisão configurável por instalação.

Atualizações remotas são desejáveis futuramente, mas não constituem dependência do MVP.

Quando tecnicamente possível, uma atualização problemática deve permitir rollback seguro.

Nenhuma atualização deve comprometer a capacidade offline da instalação sem uma decisão explícita do projeto.

## 20. Perfis de instalação

O conceito de **Installation Profile** é requisito arquitetural.

Exemplo:

```yaml
profile:
  cameras: 2
  resolution: 1080p
  fps: 60
  button: standard-approved
  buffer_seconds: 60
  pre_roll_seconds: 45
  post_roll_seconds: configurable
  retention_hours: 24
  storage: local
  cloud: optional
  access:
    local_web: true
    qr: true
```

O perfil deve descrever a configuração efetiva de uma instalação.

### 20.1 Reconfiguração

Durante o planejamento com o cliente, qualquer parâmetro pode ser alterado.

Depois da implantação, mudanças devem seguir as regras do projeto e podem exigir validação de compatibilidade.

### 20.2 Validação

Antes da instalação, o sistema deve ser capaz, quando possível, de verificar se o hardware escolhido suporta o perfil.

## 21. Arquitetura de referência

A especificação não fixa ainda tecnologias concretas.

A arquitetura futura deve ser derivada de:

- componentes desacoplados;
- contratos claros;
- adaptadores para hardware;
- armazenamento abstrato;
- pipeline de vídeo substituível;
- interfaces de acesso substituíveis;
- integração de reservas por adapter;
- configuração por Installation Profile;
- observabilidade;
- mecanismos de recuperação.

O objetivo é evitar uma solução que só funcione com um conjunto específico de câmera, computador ou provedor cloud.

## 22. Relação com outros produtos

A decisão atual é **C**:

> produtos futuros da IA Factory podem possuir implementações independentes, mas devem poder compartilhar componentes e padrões quando isso surgir naturalmente.

Não criar uma mega-plataforma prematuramente.

O projeto de gravação deve, entretanto, documentar interfaces e componentes reutilizáveis quando houver benefício comprovado.

## 23. Testes

Antes de uma instalação real, é desejável possuir um ambiente de laboratório capaz de reproduzir a instalação.

### 23.1 Testes funcionais

- captura;
- buffer;
- acionamento;
- pré-roll;
- pós-roll;
- múltiplos cliques;
- clipes sobrepostos;
- geração do arquivo;
- metadados;
- acesso;
- download;
- retenção;
- sincronização.

### 23.2 Testes de resiliência

- Internet indisponível;
- cloud indisponível;
- câmera indisponível;
- botão indisponível;
- computador reiniciado;
- energia interrompida;
- armazenamento cheio;
- rede instável;
- recuperação dos componentes.

### 23.3 Critério

Uma instalação somente deve ser considerada apta para implantação quando os cenários críticos do perfil escolhido tiverem sido validados.

## 24. Decisões deliberadamente deixadas em aberto

As seguintes decisões **não devem ser inventadas neste documento**:

- fabricante/modelo definitivo das câmeras;
- modelo definitivo do botão;
- hardware definitivo do computador;
- sistema operacional obrigatório;
- provedor cloud;
- tecnologia definitiva do buffer;
- mecanismo definitivo de autenticação;
- política definitiva de atualização;
- formato definitivo de integração com cada sistema de reservas;
- valores definitivos de retenção;
- dimensionamento universal de armazenamento.

Essas decisões serão derivadas do perfil de cada instalação e de testes de compatibilidade.

## 25. Riscos técnicos principais

1. **Buffer de vídeo:** memória, disco e codec podem alterar significativamente a estratégia.
2. **Recodificação:** pode elevar bastante a demanda de CPU/GPU.
3. **Câmeras heterogêneas:** diferenças de RTSP, codecs, timestamps e comportamento podem exigir adapters.
4. **Clipes sobrepostos:** exigem coordenação correta para evitar corrupção ou uso excessivo de armazenamento.
5. **Falhas de energia:** podem afetar buffer, arquivos em gravação e recuperação.
6. **Cloud indisponível:** exige fila persistente e política clara de retenção.
7. **Ambiente físico:** calor, umidade, chuva, iluminação e cabeamento variam por instalação.
8. **Integrações externas:** sistemas de reserva podem ter APIs e modelos de dados diferentes.
9. **Segurança local:** acesso simplificado não pode resultar em exposição indevida de arquivos.
10. **Manutenção:** excesso de variantes de hardware pode aumentar custo operacional.

## 26. Requisitos para o MVP de referência

O MVP de referência deve priorizar:

- 1–2 câmeras;
- captura contínua;
- buffer configurável;
- botão físico;
- pré-roll;
- pós-roll;
- clipes sobrepostos;
- armazenamento local;
- operação sem Internet;
- MP4/H.264;
- 1080p como referência;
- identificação por data/hora/quadra;
- interface web local;
- QR Code;
- download;
- retenção automática;
- monitoramento básico;
- recuperação após falhas essenciais.

Cloud, integração de reservas, atualização remota e variantes avançadas devem permanecer modulares para não bloquear o núcleo offline.

## 27. Próxima decomposição recomendada

A especificação deve ser transformada posteriormente em blocos de engenharia, aproximadamente nesta ordem:

1. arquitetura lógica;
2. modelo de Installation Profile;
3. pipeline de captura e buffer;
4. contrato do botão;
5. abstração de câmeras;
6. pipeline de clipping;
7. armazenamento local;
8. fila de sincronização;
9. camada cloud;
10. metadados e reserva;
11. interface local/QR;
12. monitoramento;
13. recuperação de falhas;
14. seleção/dimensionamento de hardware;
15. ambiente de laboratório;
16. testes automatizados;
17. teste de instalação;
18. documentação de implantação.

A ordem exata deve ser revisada quando a arquitetura técnica for definida.

## 28. Relação com a IA Factory

Este documento é uma **especificação de produto de referência** para orientar a construção de projetos de gravação de quadras.

Ele não constitui uma alteração na arquitetura interna da IA Factory e não cria um segundo sistema de requisitos ou tarefas.

Decisões arquiteturais permanentes que surgirem da implementação devem ser registradas separadamente como ADRs em `docs/adr/`.

Questões ainda abertas podem ser registradas como Discovery/Knowledge antes de serem promovidas a decisões permanentes.

## 29. Estado atual

**Especificação:** draft v0.1.

**Requisitos de produto:** suficientemente definidos para iniciar o desenho da arquitetura de referência.

**Tecnologias:** deliberadamente não congeladas.

**Hardware:** deliberadamente não congelado.

**Implementação:** não iniciada a partir deste documento.

**Próximo marco:** arquitetura de referência + perfis de instalação + matriz de hardware/software + estratégia de testes.
