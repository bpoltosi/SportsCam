# SportsCam — Project Configurator

## Objetivo

O Project Configurator é a camada de descoberta e pré-configuração comercial/técnica do SportsCam. Ele transforma uma conversa com o cliente em uma definição estruturada de projeto, uma composição preliminar de hardware/módulos e uma estimativa de custo.

O questionário não é necessariamente uma interface para o cliente preencher. Ele é um **guia interno de perguntas** usado pela equipe durante a descoberta de requisitos. A entrada pode ser preenchida manualmente, por conversa ou futuramente interpretada por IA.

## Princípio central

Cada projeto pode variar de acordo com os requisitos do cliente, mas o software e o sistema SportsCam devem possuir uma base sólida, modular e configurável capaz de atender essas variações sem criar forks específicos por cliente.

> **Projeto é variável; Core é estável.**

O configurador não deve criar uma solução tecnológica diferente para cada cliente. Ele deve selecionar e configurar capacidades existentes, utilizando módulos, perfis e regras de dimensionamento.

## Arquitetura conceitual

```
Conversa com cliente
        |
        v
Guia de perguntas / descoberta
        |
        v
Requirement Capture
        |
        v
IA opcional para interpretar linguagem natural
        |
        v
Project Definition
        |
        +-------------------+
        |                   |
        v                   v
   Rules Engine        Solution Catalog
        |                   |
        +---------+---------+
                  |
                  v
          Hardware / Modules
                  |
                  v
            BOM preliminar
                  |
                  v
          Estimativa de custo
                  |
                  v
        Projeto preliminar
                  |
                  v
          Installation Profile
                  |
                  v
             Deployment
```

## Separação de responsabilidades

### 1. Requirement Catalog

Define o que precisamos descobrir durante a conversa.

Exemplos:
- modalidade;
- quantidade de quadras;
- quantidade de câmeras por quadra;
- qualidade/FPS;
- ambiente interno/externo;
- localização do computador;
- Ethernet/PoE;
- disponibilidade de Internet;
- necessidade de antenas/enlaces;
- botão físico;
- acesso por QR;
- acesso externo;
- reservas;
- cobrança por mídia;
- cloud;
- retenção;
- UPS;
- monitoramento/diagnóstico remoto;
- particularidades físicas e operacionais.

Perguntas devem ser condicionais quando possível. Não devemos perguntar detalhes que não são relevantes para a configuração escolhida.

### 2. Project Definition

É a representação estruturada do que o cliente quer. É o principal artefato gerado pela descoberta.

Exemplo conceitual:

```yaml
project:
  courts:
    - modality: beach_tennis
      quantity: 4
      cameras_per_court: 2
      camera_profile: B
    - modality: padel
      quantity: 2
      cameras_per_court: 1
      camera_profile: B

  network:
    ethernet: true
    poe: true
    internet: partial

  access:
    qr: true
    external_access: false

  reservations:
    enabled: true

  monetization:
    paid_media: true

  cloud:
    enabled: false

  power:
    ups: false
```

O formato acima é ilustrativo. O schema oficial deve ser definido em uma etapa própria.

### 3. Hardware Catalog

Base de hardware conhecido/homologado pelo SportsCam.

Não deve conter apenas produtos individuais. Cada item deve possuir características técnicas suficientes para permitir dimensionamento e validação.

Categorias esperadas:
- câmeras;
- computadores Edge;
- armazenamento;
- botões;
- switches;
- switches PoE;
- cabos e acessórios;
- fontes;
- UPS;
- antenas/enlaces;
- infraestrutura de rede;
- outros componentes de instalação.

Cada item pode possuir:
- identificador estável;
- fabricante/modelo;
- custo de referência;
- especificações;
- capacidades;
- compatibilidades;
- limitações;
- status de homologação;
- alternativas;
- perfil comercial (básico/intermediário/premium, quando aplicável).

### 4. Solution Catalog

Representa combinações pré-conhecidas de componentes.

Exemplos conceituais:
- perfil de quadra com 1 câmera;
- perfil de quadra com 2 câmeras;
- perfil outdoor;
- perfil PoE;
- perfil premium;
- outros conjuntos homologados.

Kits são uma otimização e uma forma de codificar conhecimento de instalação. Não substituem o Hardware Catalog.

### 5. Sizing Rules / Rules Engine

O motor determinístico converte requisitos em recursos necessários.

Exemplos:

```
2 × Camera B por quadra
+ 3 quadras
=> 6 × Camera B

6 × Camera B
=> perfil de Edge Computer adequado
=> switches/portas necessários
=> armazenamento necessário
=> botões necessários
=> infraestrutura de rede necessária
```

Outras regras possíveis:
- PoE habilitado => infraestrutura/switch PoE compatível;
- número de câmeras acima de determinado limite => Edge Profile superior;
- câmera 4K ou FPS superior => perfil de processamento compatível;
- distância de cabeamento acima do limite => solução de infraestrutura alternativa;
- múltiplas quadras => avaliar topologia de rede;
- Internet parcial => avaliar enlaces/rede local;
- acesso externo => módulo de acesso remoto/cloud apropriado;
- mídia paga => módulo de monetização;
- reservas => adapter de reservas;
- diagnóstico remoto => módulo correspondente.

**A regra de negócio deve ser determinística. A IA não deve inventar o dimensionamento.**

### 6. Pricing Catalog

Base de preços usada para estimativas.

Pode conter:
- hardware;
- infraestrutura;
- instalação;
- software;
- módulos;
- manutenção;
- cloud;
- serviços opcionais;
- margem/regras comerciais.

Os preços devem ser versionáveis e permitir que uma alteração de catálogo não exija alteração do motor de requisitos.

## Papel da IA

A IA é uma camada opcional de interpretação e assistência.

Ela pode:
- interpretar respostas livres;
- extrair requisitos;
- detectar ambiguidades;
- sugerir perguntas adicionais;
- identificar conflitos;
- resumir o projeto;
- consultar o catálogo;
- explicar por que determinado hardware foi selecionado;
- gerar um resumo comercial/técnico.

Ela **não deve ser a fonte de verdade para**:
- compatibilidade de hardware;
- dimensionamento;
- quantidade de equipamentos;
- preços;
- requisitos mínimos;
- regras de instalação.

Esses elementos devem vir dos catálogos e do Rules Engine.

### Exemplo

Cliente:

> Temos 3 quadras e queremos duas câmeras B em cada uma. Temos rede PoE e queremos que o jogador pegue o vídeo por QR Code.

IA:

```text
courts = 3
cameras_per_court = 2
camera_profile = B
poe = true
qr_access = true
```

Rules Engine:

```text
3 × 2 = 6 câmeras
=> Edge profile compatível
=> switch PoE compatível
=> 3 botões
=> armazenamento dimensionado
=> cabeamento/infraestrutura
=> módulo QR
```

O sistema então gera uma BOM preliminar e consulta os preços.

## IA sem dependência

O sistema deve funcionar sem IA.

A primeira implementação pode ser totalmente determinística:
- formulário interno;
- Project Definition;
- catálogo;
- Rules Engine;
- BOM;
- cálculo de custo.

A IA pode ser adicionada posteriormente como uma camada de entrada e assistência.

Isso evita dependência estrutural de uma API gratuita, modelo específico ou fornecedor de IA.

## Resultado esperado

Para cada projeto, o configurador deve conseguir produzir:

1. resumo dos requisitos;
2. requisitos ainda não definidos;
3. Project Definition estruturado;
4. módulos/capacidades necessários;
5. hardware recomendado;
6. quantidades;
7. BOM preliminar;
8. estimativa de custos;
9. premissas utilizadas;
10. riscos/itens que exigem validação técnica;
11. eventual Installation Profile inicial.

## Exemplo de saída

```text
PROJETO: Clube X

Quadras:
- 4 Beach Tennis — 2 câmeras/quadra
- 2 Padel — 1 câmera/quadra

Total:
- 10 câmeras

Capacidades:
- gravação contínua
- replay de 50 segundos
- QR
- armazenamento local
- PoE
- reservas
- mídia paga

Hardware preliminar:
- 10 × Camera B
- N × Edge Computer B
- N × Switch PoE
- 6 × Button
- N × Storage
- cabos e acessórios
- infraestrutura adicional conforme vistoria

Pendências:
- retenção
- modelo do sistema de reservas
- necessidade de acesso externo
- infraestrutura física
- disponibilidade real de Internet
```

Os números de Edge/Storage/etc. acima são apenas ilustrativos; o sistema real deve calculá-los pelas regras homologadas.

## Relação com o SportsCam Core

O Project Configurator não é o SportsCam Core.

Ele produz uma definição que posteriormente deve ser traduzida para um Installation Profile.

```
Project Definition
      |
      v
Installation Profile
      |
      v
SportsCam Core + Modules
      |
      v
Deployment
```

O Core continua responsável pelas capacidades fundamentais de gravação/replay. Módulos opcionais atendem variações como:
- múltiplas câmeras;
- reservas;
- acesso avançado;
- mídia paga;
- cloud;
- diagnóstico remoto;
- perfis avançados de câmera;
- infraestrutura específica.

## Regra arquitetural

Uma necessidade de cliente deve ser tratada como:

1. configuração de uma capacidade existente; ou
2. módulo reutilizável; ou
3. novo componente do Core somente quando for uma capacidade fundamental.

Não criar implementação específica para um cliente quando o requisito puder ser representado por configuração, regra, perfil ou módulo reutilizável.

## Evolução futura

O configurador poderá futuramente:
- conversar diretamente com o vendedor por IA;
- gerar automaticamente o Project Definition;
- gerar proposta comercial;
- gerar BOM;
- comparar configurações;
- apresentar alternativas de hardware;
- criar automaticamente o Installation Profile;
- validar compatibilidade;
- alimentar ferramentas de instalação;
- manter histórico/versionamento do projeto.

A interface pode evoluir sem alterar o modelo de dados e as regras centrais.

## Próximos artefatos

Após esta definição, devem ser criados separadamente:
- schema oficial de Project Definition;
- catálogo inicial de requisitos;
- catálogo inicial de hardware;
- catálogo inicial de soluções/kits;
- especificação do Rules Engine;
- especificação do Pricing Catalog;
- matriz de compatibilidade hardware × software;
- fluxo de perguntas interno;
- critérios para uso da IA;
- formato de BOM e estimativa;
- integração Project Definition → Installation Profile.

## Princípio final

> **O configurador deve transformar conhecimento comercial e técnico da SportsCam em projetos reproduzíveis, dimensionáveis e adaptáveis, sem transformar cada cliente em uma implementação diferente.**
