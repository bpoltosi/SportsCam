# SportsCam Web/App — Arquitetura Canônica

> **Status:** arquitetura vigente
> **Versão:** 0.2
> **Escopo:** separação entre presença pública/marketing na Web e aplicação operacional desktop local.
> **Última revisão:** 2026-10-03

## 1. Objetivo

O produto SportsCam será dividido em duas superfícies principais:

1. **SportsCam Web:** site público voltado a marketing, apresentação comercial, soluções, tecnologia, casos de uso e geração de oportunidades.
2. **SportsCam App:** aplicação desktop local para criação, configuração, validação, versionamento e sincronização de projetos.

O App não depende de autenticação ou de um backend remoto para funcionar.

A arquitetura deve manter o domínio e o SportsCam Engine independentes da UI e da infraestrutura de sincronização.

## 2. Arquitetura de alto nível

```
                         INTERNET
                            |
                  +---------+---------+
                  |                   |
            SportsCam Web       GitHub (opcional)
            Marketing/Sales           ^
                  |                   |
                  |             project sync
                  |                   |
                  |          +--------+--------+
                  |          | SportsCam App   |
                  |          | Desktop / Local |
                  |          +--------+---------+
                  |                   |
                  |              Frontend TS
                  |                   |
                  |             API local / IPC
                  |                   |
                  |              Backend Python
                  |                   |
                  +-----------> SportsCam Engine
                                      |
                         +------------+------------+
                         |                         |
                    Local Persistence        Versioned Domain
                       SQLite/files        Schemas/Catalog/Rules
```

## 3. SportsCam Web

A Web continua sendo a superfície comercial.

Responsabilidades:

- apresentar a empresa;
- apresentar produtos e soluções;
- explicar tecnologia;
- mostrar casos de uso;
- captar contato;
- receber solicitações de projeto/orçamento;
- eventualmente direcionar o usuário para o App ou para um fluxo comercial.

Estrutura inicial:

- Home
- O que fazemos
- Produtos/Soluções
- Como funciona
- Tecnologia
- Casos de uso
- Sobre a empresa
- Contato
- Solicitação de projeto/orçamento

A Web não deve duplicar regras técnicas do Engine.

## 4. SportsCam App

O App é o sistema operacional de trabalho para projetos.

Responsabilidades:

- criar e abrir projetos;
- editar ProjectDefinition;
- selecionar módulos;
- selecionar hardware;
- selecionar profile;
- executar validações;
- gerar/visualizar BOM;
- consultar catálogo e regras;
- manter histórico;
- salvar projetos localmente;
- exportar/importar projetos;
- sincronizar projetos com GitHub;
- funcionar offline.

Não é requisito inicial:

- login;
- usuários remotos;
- organizações remotas;
- sessão de usuário;
- API pública;
- banco de dados remoto;
- SaaS multi-tenant.

## 5. Frontend

O frontend do App será prioritariamente:

- TypeScript;
- React;
- stack auxiliar de UI/UX escolhida conforme necessidade;
- design system reutilizável.

O frontend é responsável pela apresentação e interação, não pela autoridade técnica.

A mesma orientação vale para o Web quando houver componentes ou conceitos compartilhados.

## 6. Backend

O backend do sistema será prioritariamente desenvolvido em **Python**, sempre que tecnicamente apropriado.

Responsabilidades:

- application services;
- orquestração de casos de uso;
- acesso à persistência;
- import/export;
- integração com Git;
- sincronização com GitHub;
- integração com o Engine;
- tarefas de domínio que façam sentido no backend;
- futuras automações e serviços locais.

O backend será executado localmente pelo App.

A comunicação entre frontend e backend pode utilizar API local, IPC ou mecanismo equivalente, conforme a tecnologia desktop escolhida.

### Regra de linguagem

- **Frontend:** TypeScript por padrão.
- **Backend e sistemas auxiliares:** Python por padrão.
- **SportsCam Engine:** permanece um componente de domínio independente da UI e do transporte. A linguagem de implementação não deve ser usada como acoplamento arquitetural; qualquer mudança deve ser registrada explicitamente.
- Outras linguagens só devem ser introduzidas quando houver benefício técnico claro.

## 7. SportsCam Engine

O Engine continua sendo a autoridade determinística para:

- composição;
- resolução;
- compatibilidade;
- validação;
- geração de configuração;
- BOM;
- aplicação de Rules;
- uso de Hardware, Module e Profile versionados.

O frontend não implementa essas regras.

O backend também não deve criar uma segunda autoridade técnica.

Fluxo conceitual:

```
Frontend TS
    |
    v
Backend Python
    |
    v
SportsCam Engine
    |
    +--> ProjectDefinition
    +--> Hardware
    +--> Module
    +--> Rule
    +--> InstallationProfile
    +--> BOM
```

## 8. Persistência local

A persistência inicial será local.

Preferência:

1. SQLite para estado estruturado;
2. arquivos versionáveis para artefatos/documentos quando isso trouxer vantagem;
3. formatos abertos e portáveis.

O App deve continuar funcional sem internet.

A persistência local não deve ser confundida com o repositório Git.

- **SQLite/files:** estado operacional local.
- **Git/GitHub:** versionamento, histórico técnico, colaboração e sincronização.

## 9. GitHub como sincronização e histórico técnico

Projetos do SportsCam App poderão ser sincronizados com GitHub.

O objetivo não é simplesmente fazer backup do projeto. O objetivo é manter **cada projeto reproduzível e tecnicamente documentado**.

Um projeto sincronizado deve conter, sempre que aplicável:

- ProjectDefinition;
- versão do projeto;
- EngineVersion;
- CatalogVersion;
- RulesVersion;
- InstallationProfile;
- ValidationResult;
- BOM;
- manifest do projeto;
- metadados de geração;
- referências aos módulos/hardware utilizados;
- arquivos de configuração;
- documentação técnica derivada;
- histórico de alterações.

O conteúdo deve ser organizado em uma estrutura determinística e adequada a diff/review.

Exemplo:

```
project/
├── project.yaml
├── manifest.yaml
├── definition.yaml
├── profile.yaml
├── modules/
├── hardware/
├── rules/
├── validation/
├── bom/
├── generated/
├── docs/
└── history/
```

A estrutura final será definida na etapa de contratos/dados.

## 10. GitHub não deve virar requisito de execução

Um projeto deve funcionar mesmo sem GitHub.

GitHub é uma camada de:

- sincronização;
- versionamento;
- colaboração;
- backup;
- auditoria técnica;
- rastreabilidade.

O App continua sendo capaz de criar, abrir, editar e validar projetos offline.

## 11. Autenticação

O App local não terá autenticação própria como requisito arquitetural.

Quando o usuário quiser sincronizar com GitHub, a autenticação pertence ao mecanismo Git/GitHub utilizado para o repositório.

Preferência:

- Git configurado localmente;
- credenciais/SSH/GitHub CLI já existentes no ambiente;
- nenhuma senha do GitHub armazenada pelo SportsCam App.

Assim, a ausência de autenticação no App não impede a sincronização opcional.

## 12. Reprodutibilidade

Cada projeto sincronizado deve permitir responder:

- qual configuração foi criada;
- com qual versão do Engine;
- com qual catálogo;
- com quais regras;
- com quais módulos;
- com quais hardwares;
- qual validação foi executada;
- qual BOM foi gerada;
- quais arquivos foram produzidos.

O projeto deve carregar referências suficientes para reconstruir o contexto técnico correspondente, respeitando a evolução do catálogo e do Engine.

## 13. Futuras aplicações e sistemas

Novos sistemas do ecossistema SportsCam devem seguir a mesma orientação quando apropriado:

- backend Python;
- frontend TypeScript;
- domínio independente;
- execução local quando não houver necessidade de serviço remoto;
- formatos abertos;
- Git como mecanismo de versionamento quando fizer sentido;
- custo zero como princípio arquitetural.

Isso não impede sistemas futuros de possuírem serviços remotos quando houver uma necessidade real. Apenas evita transformar infraestrutura remota em requisito artificial.

## 14. Fora do escopo

A arquitetura não deve reintroduzir no produto central os conceitos físicos explicitamente excluídos do SportsCam Engine.

Não fazem parte do modelo estrutural do projeto:

- altura de câmera;
- direção/orientação;
- distância física;
- ângulo físico;
- posição de postes/suportes;
- rota de cabos;
- montagem;
- vistoria física;
- engenharia civil/elétrica/estrutural;
- instruções de instalação física.

## 15. Ordem oficial de execução

1. **Arquitetura:** fechar fronteiras Web/App/Backend/Engine/GitHub.
2. **UX/Fluxos:** definir navegação e experiência do Web e App.
3. **Protótipo completo:** construir protótipo navegável.
4. **Contratos e dados:** definir APIs locais, schemas, persistência e formato de projeto versionável.
5. **Implementação:** frontend TypeScript, backend Python, Engine e integração Git/GitHub.
6. **Testes:** unitários, contratos, Engine determinístico, integração e E2E.
7. **Integração/Homologação:** validar criação, abertura, edição, validação, geração de BOM, persistência e sincronização.

## 16. Regra de precedência

Este documento é a referência canônica para a arquitetura Web/App.

Em caso de conflito com documentação anterior, esta definição prevalece até que uma nova decisão arquitetural seja registrada explicitamente.
