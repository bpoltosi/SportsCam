# SportsCam Engine — arquitetura e princípios

## Objetivo

O **SportsCam Engine** é o núcleo determinístico responsável por transformar uma definição estruturada de projeto em uma configuração técnica validada, com hardware, dependências, módulos, BOM, dimensionamento, custos e Installation Profile.

O engine deve funcionar **sem IA**.

A IA, se existir no futuro, será apenas uma camada opcional de interface que transforma linguagem/conversa em uma Project Definition. A verdade técnica continua sendo determinada pelo catálogo, schemas e regras versionadas do engine.

## Princípio central

> **IA pode interpretar; o Engine decide.**

Nenhuma câmera, hardware, quantidade, preço, dependência ou compatibilidade deve ser inventada por IA.

O engine deve validar tudo contra dados e regras homologados.

## Arquitetura conceitual

GitHub Repository
  ├── catalog/
  ├── solutions/
  ├── modules/
  ├── rules/
  └── schemas/
          |
          v
   SportsCam Engine
  ├── Project Definition
  ├── Validation
  ├── Compatibility
  ├── Sizing
  ├── Dependencies
  ├── BOM
  ├── Pricing
  ├── Impact Analysis
  └── Installation Profile
          |
          +-------------------+
          |                   |
          v                   v
      Web App / Site       CLI / API

O site ou aplicativo não deve conter a lógica técnica principal. Ele deve consumir o engine.

## Responsabilidades do Engine

O engine deve conseguir:

1. validar uma Project Definition;
2. resolver requisitos em módulos e soluções;
3. resolver dependências;
4. verificar compatibilidade de hardware;
5. dimensionar quantidades;
6. dimensionar storage e recursos de processamento;
7. montar BOM;
8. calcular preços conforme catálogo/regras;
9. detectar conflitos e lacunas;
10. explicar o motivo de cada dependência calculada;
11. comparar versões de projeto;
12. calcular impactos de alterações;
13. gerar um Installation Profile;
14. funcionar de forma determinística e reproduzível.

## Exemplo

Entrada:

    {
      "courts": 3,
      "camerasPerCourt": 2,
      "cameraProfile": "camera-b",
      "poe": true,
      "qrAccess": true
    }

O engine deve resolver algo conceitualmente como:

    3 quadras
    x
    2 câmeras/quadra
    =
    6 câmeras

    6 câmeras
    -> edge profile compatível
    -> storage compatível
    -> rede/PoE
    -> switches
    -> cabeamento/acessórios
    -> botões
    -> módulo QR

O resultado deve conter os itens, quantidades, regras aplicadas, dependências, avisos e eventuais incompatibilidades.

## Catálogos

O conhecimento técnico deve ser preferencialmente declarado como dados versionados no repositório, e não espalhado pelo código.

Estrutura inicial sugerida:

    catalog/
      cameras/
      edge-computers/
      storage/
      buttons/
      switches/
      poe/
      network/
      accessories/

    solutions/
      single-camera-court/
      dual-camera-court/
      poe-court/
      outdoor-court/
      premium-court/

    modules/
      qr-access/
      reservations/
      cloud-sync/
      paid-media/
      remote-diagnostics/

    rules/
      camera-sizing/
      edge-sizing/
      storage-sizing/
      network-sizing/
      compatibility/
      pricing/

    schemas/
      project-definition/
      installation-profile/
      hardware/
      module/
      rule/
      bom/

## Regras declarativas

Evitar regras de negócio rígidas espalhadas pelo código.

Preferir regras declarativas versionadas. O formato exato será definido durante a implementação.

Exemplo conceitual:

    id: dual-camera-court

    requirements:
      cameras_per_court: 2

    dependencies:
      - camera
      - edge_computer
      - storage
      - network

    rules:
      - cameras.quantity = courts * cameras_per_court
      - edge.profile = dual-camera

## Impact Analysis

Alterações na Project Definition devem produzir uma análise de impacto.

Exemplo:

    2 câmeras/quadra
          |
          +--> 6 câmeras
          |
          +--> edge
          |
          +--> storage
          |
          +--> PoE
          |
          +--> switches
          |
          +--> cabos
          |
          +--> custo

Se o usuário alterar 2 para 3 câmeras por quadra, o engine deve recalcular os nós afetados e apresentar o diff.

O sistema deve conseguir explicar:

- o que mudou;
- quais itens foram afetados;
- por qual regra;
- quais dependências foram adicionadas/removidas;
- impacto no BOM;
- impacto no preço;
- eventuais incompatibilidades.

## GitHub como fonte versionada

O GitHub deve ser tratado como fonte de código e, quando apropriado, de conhecimento técnico versionado:

- catálogo de hardware;
- perfis homologados;
- módulos;
- kits/soluções;
- regras;
- schemas;
- documentação;
- testes.

Isso permite revisão por Pull Request, histórico, comparação, rollback e auditoria.

Projetos comerciais aprovados não devem depender implicitamente do estado atual do catálogo. Eles devem preservar referências/versionamentos necessários para reproduzir a configuração aprovada.

## Web App / GitHub Pages

A primeira interface pode ser uma aplicação web estática.

Arquitetura possível:

    GitHub
       |
       +--> catalog + rules
       |
    GitHub Pages
       |
       +--> Project Configurator
       |
       +--> SportsCam Engine

Para uma primeira versão, o engine pode rodar no próprio navegador, sem backend.

Isso permite validar:

- modelagem;
- regras;
- dimensionamento;
- BOM;
- UX;
- impacto de alterações.

Posteriormente, a Project Management Platform pode adicionar backend e persistência para projetos, usuários, versões, propostas e aprovações.

## IA como camada opcional

Se IA for adicionada futuramente:

    Conversa
       |
       v
      IA
       |
       v
    Project Definition
       |
       v
    SportsCam Engine
       |
       +--> Validation
       +--> BOM
       +--> Pricing
       +--> Compatibility

A IA não deve escrever diretamente no BOM nem escolher hardware fora do catálogo.

Exemplo:

Usuário:
"São 3 quadras, duas câmeras por quadra, PoE e QR."

A IA pode produzir:

    {
      "courts": 3,
      "camerasPerCourt": 2,
      "poe": true,
      "qrAccess": true
    }

O engine decide o restante.

Se a IA sugerir um perfil inexistente, o engine deve rejeitar ou marcar como inválido.

## Separação de responsabilidades

### SportsCam Core

Runtime da instalação:

- captura;
- buffer temporal;
- botão;
- replay;
- storage;
- acesso local;
- retenção;
- monitoramento;
- recuperação.

### SportsCam Engine

Conhecimento e análise de projetos:

- Project Definition;
- catálogo;
- regras;
- compatibilidade;
- dimensionamento;
- BOM;
- pricing;
- impacto;
- Installation Profile.

### Project Management Platform

Interface operacional:

- projetos;
- clientes;
- descoberta;
- configuração;
- versões;
- propostas;
- comparação;
- aprovação;
- visualização técnica/comercial.

### IA

Interface opcional:

- interpretar conversas;
- preencher Project Definition;
- explicar resultados;
- auxiliar operadores.

## Princípios de implementação

1. **Determinismo:** mesma entrada + mesma versão do catálogo/regras = mesmo resultado.
2. **Reprodutibilidade:** resultado deve poder ser reproduzido posteriormente.
3. **Validação:** nenhuma dependência crítica pode depender de texto livre ou inferência de IA.
4. **Configuração antes de fork:** diferenças entre projetos devem ser resolvidas por configuração, módulos e regras.
5. **Catálogo homologado:** hardware deve existir no catálogo antes de poder ser usado em uma configuração válida.
6. **Explicabilidade:** o engine deve registrar as regras que produziram cada decisão.
7. **Versionamento:** regras, catálogos e projetos precisam de versionamento compatível com auditoria.
8. **Core estável:** o engine não deve carregar lógica específica de um cliente.
9. **Módulos opcionais:** funcionalidades realmente opcionais devem ser isoladas em módulos.
10. **IA não obrigatória:** o sistema completo deve funcionar sem qualquer serviço de IA.

## Próximas etapas

1. Definir os schemas formais.
2. Criar catálogo inicial de hardware homologado.
3. Criar modelo de Rule.
4. Criar modelo de Dependency.
5. Criar modelo de Solution/Kit.
6. Implementar primeiro analyzeProject().
7. Criar testes determinísticos.
8. Implementar BOM.
9. Implementar Impact Analysis.
10. Implementar geração de Installation Profile.
11. Criar CLI para testes do engine.
12. Criar primeiro Web Configurator.
13. Depois conectar à Project Management Platform.

## Critério de sucesso da primeira versão do Engine

Deve ser possível fornecer uma Project Definition sem interface gráfica e obter uma resposta completa e determinística contendo:

- configuração validada;
- hardware;
- quantidades;
- dependências;
- módulos;
- BOM;
- regras aplicadas;
- avisos;
- incompatibilidades;
- custo estimado quando houver pricing;
- Installation Profile.

Tudo isso deve funcionar sem IA.
