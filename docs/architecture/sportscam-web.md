# SportsCam Web — Arquitetura Canônica

> **Status:** arquitetura vigente
> **Versão:** 0.1
> **Escopo:** arquitetura do produto web, separando presença pública/marketing da aplicação autenticada de gestão de projetos.
> **Última revisão:** 2026-10-03

## 1. Objetivo

O SportsCam Web terá duas áreas claramente separadas:

1. **Site público/marketing:** apresenta a empresa, soluções, tecnologia, casos de uso e canais comerciais.
2. **Aplicação autenticada:** permite operar o produto, gerenciar projetos e consumir o SportsCam Engine.

A aplicação web não deve duplicar a autoridade técnica do Engine.

## 2. Arquitetura de alto nível

```
                    SportsCam Web
                         |
             +-----------+-----------+
             |                       |
       Public / Marketing      Authenticated App
             |                       |
             +-----------+-----------+
                         |
                     Backend/API
                         |
              +----------+----------+
              |                     |
          Database            SportsCam Engine
              |                     |
              |              Schemas / Catalog
              |              Modules / Rules
              +---------------------+
```

### Responsabilidades

- **Public/Marketing:** comunicação e aquisição comercial.
- **App:** experiência operacional e gestão de projetos.
- **Backend/API:** autenticação, autorização, persistência, orquestração e contratos.
- **Database:** estado operacional e histórico dos projetos.
- **SportsCam Engine:** resolução técnica determinística.
- **Schemas/Catalog/Rules:** conhecimento versionado consumido pelo Engine.

## 3. Site público

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

O site público deve explicar o produto sem expor complexidade técnica desnecessária.

## 4. Aplicação autenticada

A aplicação terá o projeto como objeto central.

Estrutura inicial:

- Dashboard
- Projetos
- Novo projeto
- Projeto
  - Overview
  - Definition
  - Modules
  - Hardware
  - Profile
  - Validation
  - BOM
  - History
- Catálogo
- Regras
- Configurações

Rotas iniciais:

```
/
/app
/app/dashboard
/app/projects
/app/projects/new
/app/projects/[project]/overview
/app/projects/[project]/definition
/app/projects/[project]/modules
/app/projects/[project]/hardware
/app/projects/[project]/profile
/app/projects/[project]/validation
/app/projects/[project]/bom
/app/projects/[project]/history
/app/catalog
/app/rules
/app/settings
```

## 5. Fluxo principal do produto

Fluxo de referência para o protótipo:

```
Home
  -> Solicitar projeto
  -> Login / acesso
  -> Dashboard
  -> Novo projeto
  -> Definir projeto
  -> Selecionar módulos
  -> Selecionar hardware
  -> Selecionar profile
  -> Validar
  -> Corrigir problemas
  -> Gerar/visualizar BOM
  -> Resumo do projeto
```

O protótipo deve permitir percorrer esse fluxo mesmo quando os dados e funções forem simulados.

## 6. Project como centro

Um projeto representa uma configuração técnica versionada.

Conceitualmente:

```
Project
  |
  +-- ProjectVersion
       |
       +-- ProjectDefinition
       +-- Modules
       +-- Hardware
       +-- InstallationProfile
       +-- ValidationResult
       +-- BOM
       +-- History
```

A BOM e os resultados de validação devem ser associados à versão que os produziu.

## 7. Fronteira entre Web e Engine

O Web não deve implementar regras técnicas duplicadas.

Fluxo:

```
Frontend
   |
   v
API Contract
   |
   v
Backend
   |
   +--> Database
   |
   +--> SportsCam Engine
            |
            +--> Schemas
            +--> Catalog
            +--> Modules
            +--> Rules
```

Exemplos conceituais de contratos:

- `GET /projects/{id}`
- `POST /projects`
- `POST /projects/{id}/versions`
- `POST /projects/{id}/validation`
- `GET /projects/{id}/bom`

Os contratos finais serão definidos depois do protótipo e antes da implementação funcional.

## 8. Modelo operacional inicial

Entidades candidatas do banco:

- users
- organizations
- projects
- project_members
- project_versions
- project_definitions
- validations
- bom_snapshots
- audit_log

Catálogos técnicos como hardware, modules, rules e profiles pertencem ao domínio versionado do Engine. A aplicação poderá manter referências/cache operacional, mas não deve criar uma segunda autoridade para esses dados.

## 9. Versionamento

Um projeto deve permitir histórico de versões.

Uma versão deve identificar, no mínimo:

- ProjectDefinition;
- EngineVersion;
- CatalogVersion;
- RulesVersion;
- resultado de validação;
- BOM derivada.

Isso permite reproduzir e explicar resultados técnicos.

## 10. Design e protótipo

Antes da implementação funcional será criado um protótipo navegável completo.

O protótipo deve cobrir:

- identidade visual;
- design system;
- navegação;
- páginas públicas;
- autenticação;
- dashboard;
- fluxo completo de projeto;
- tabelas;
- formulários;
- estados vazios;
- loading;
- sucesso;
- erro;
- validações;
- histórico;
- BOM.

O protótipo pode usar dados mockados. O objetivo é validar estrutura, UX e fluxos antes de definir os contratos finais.

## 11. Fora do escopo

A arquitetura web não deve reintroduzir no produto central os conceitos físicos explicitamente excluídos do SportsCam Engine.

Não fazem parte do modelo de projeto do produto:

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

Esses assuntos podem existir em processos externos, mas não devem aparecer como requisitos estruturais do ProjectDefinition ou como lógica do Engine.

## 12. Ordem oficial de execução

A construção do produto seguirá esta sequência:

1. **Arquitetura:** fechar arquitetura do Web/App e suas fronteiras.
2. **UX/Fluxos:** definir navegação, atores e fluxos principais.
3. **Protótipo completo:** construir o protótipo navegável, ainda sem funções reais.
4. **Contratos e dados:** definir API, schemas de persistência, versionamento e modelo de banco.
5. **Implementação:** desenvolver frontend, backend e integração com o Engine.
6. **Testes:** testes unitários, contratos, Engine determinístico e E2E.
7. **Integração/Homologação:** validar o produto integrado e corrigir inconsistências.

A ordem é deliberada: não implementar lógica antes de estabilizar a experiência e os contratos.

## 13. Critério para avançar de etapa

Cada etapa deve deixar um artefato verificável.

- Arquitetura -> documento e mapa de navegação.
- UX/Fluxos -> fluxos e estados definidos.
- Protótipo -> protótipo completo e navegável.
- Contratos/Dados -> API e modelo persistente definidos.
- Implementação -> funcionalidades integradas.
- Testes -> suíte automatizada e critérios de aceitação.
- Homologação -> fluxo integrado validado.

## 14. Regra de precedência

Este documento é a referência canônica para a arquitetura do SportsCam Web.

Em caso de conflito com documentação anterior, esta definição prevalece até que uma nova decisão arquitetural seja registrada explicitamente.
