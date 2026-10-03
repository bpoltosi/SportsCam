# SportsCam — Sincronização de Projetos com GitHub

> **Status:** arquitetura vigente
> **Versão:** 0.1
> **Última revisão:** 2026-10-03

## Objetivo

O SportsCam App deve permitir que projetos criados localmente sejam sincronizados com GitHub para manter o conjunto de informações técnicas utilizado em cada projeto documentado, versionado e reproduzível.

GitHub é uma camada opcional de sincronização e versionamento, não uma dependência de execução do App.

## Princípios

- projeto funciona offline;
- GitHub é opcional;
- um projeto sincronizado deve ser legível como código/dados versionáveis;
- alterações devem produzir diffs úteis;
- versões de Engine/Catalog/Rules devem acompanhar o projeto;
- artefatos derivados importantes devem ser persistidos;
- credenciais não devem ser armazenadas pelo App;
- não depender de um banco remoto para manter o histórico técnico;
- formatos devem ser abertos e portáveis.

## Modelo

```
SportsCam App
   |
   +--> Local Project
   |      |
   |      +--> ProjectDefinition
   |      +--> Engine/Catalog/Rules versions
   |      +--> Validation
   |      +--> BOM
   |      +--> generated artifacts
   |
   +--> Git
          |
          +--> local repository
                 |
                 +--> GitHub remote (optional)
```

A integração preferencial é com Git local, usando o GitHub como remote. Isso reduz acoplamento com APIs específicas e permite que o projeto continue utilizável com outros remotes no futuro.

## Conteúdo versionado

O projeto deve registrar, conforme aplicável:

- definição do projeto;
- módulos;
- hardware;
- profile;
- EngineVersion;
- CatalogVersion;
- RulesVersion;
- resultado da validação;
- BOM;
- manifest;
- documentação técnica derivada;
- arquivos gerados necessários à reprodução;
- metadados de origem/geração.

Informações transitórias ou caches que não contribuam para reprodução não devem ser versionados.

## Manifest

O projeto deve possuir um manifest determinístico, por exemplo:

```yaml
project_id: ...
project_version: ...
engine_version: ...
catalog_version: ...
rules_version: ...
schema_version: ...
generated_at: ...
```

O schema final será definido na etapa de contratos e dados.

## Operações do App

O App deverá futuramente suportar, no mínimo:

1. inicializar sincronização de um projeto;
2. criar/associar um repositório Git;
3. exportar o estado do projeto para uma estrutura versionável;
4. detectar alterações locais;
5. gerar commit;
6. configurar/atualizar remote;
7. sincronizar com GitHub;
8. importar alterações versionadas;
9. informar conflitos de merge;
10. preservar o histórico local.

## Autenticação

O App não terá um sistema próprio de contas.

A autenticação com GitHub deve preferencialmente utilizar credenciais já configuradas no ambiente do usuário, como SSH ou GitHub CLI, sem armazenar tokens ou senhas do GitHub no banco do SportsCam.

## Repositório por projeto

A opção preferencial é permitir **um repositório Git por projeto**, porque isso:

- separa históricos;
- simplifica permissões;
- facilita auditoria;
- mantém o projeto autocontido;
- permite compartilhar apenas o projeto necessário.

A decisão final entre repositório por projeto e monorepositório de projetos será tomada nos contratos/dados.

## Reprodutibilidade

Um checkout do repositório deve conter informação suficiente para identificar o contexto técnico usado para produzir os resultados do projeto.

Quando uma versão específica do catálogo/Engine não puder ser reconstruída apenas pelo repositório do projeto, o manifest deve apontar para a versão correspondente do código/catalog/regras e o processo de build deve definir como obtê-la.

## Segurança

Nunca versionar:

- senhas;
- tokens;
- chaves privadas;
- secrets;
- credenciais;
- arquivos de configuração locais com segredos.

O App deve possuir validação para impedir commit acidental de secrets quando possível.

## Regra de custo zero

A sincronização deve priorizar:

1. Git local;
2. GitHub Free;
3. ferramentas Git/GitHub já disponíveis;
4. serviços gratuitos;
5. qualquer serviço pago somente mediante justificativa explícita.

O projeto não deve exigir infraestrutura paga para funcionar ou ser versionado.
