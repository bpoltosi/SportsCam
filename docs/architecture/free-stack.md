# SportsCam — Stack de Custo Zero

> **Status:** proposta técnica vigente para o MVP
> **Princípio:** R$ 0,00 enquanto tecnicamente viável
> **Última revisão:** 2026-10-03

## 1. Objetivo
Definir uma stack que permita construir, testar, prototipar e publicar o MVP sem custo obrigatório. A escolha deve preservar portabilidade: componentes pagos futuros devem poder ser substituídos sem reescrever o domínio.

## 2. Stack proposta

| Camada | Escolha inicial | Custo | Observação |
|---|---|---:|---|
| Código | GitHub | R$ 0 | Repositório e colaboração |
| CI | GitHub Actions | R$ 0 no uso coberto pelo plano | Público/self-hosted favorecido |
| Design/protótipo | Penpot | R$ 0 | Open source; cloud gratuita ou self-host |
| Frontend | React + TypeScript + Vite | R$ 0 | Open source |
| UI | CSS/Tailwind conforme necessidade | R$ 0 | Sem dependência paga |
| Backend | TypeScript + runtime open source | R$ 0 | Executável localmente |
| Engine | TypeScript | R$ 0 | Mesmo domínio compartilhável com Web/API |
| Banco local | SQLite | R$ 0 | Desenvolvimento e testes |
| Banco cloud MVP | Cloudflare D1 ou Supabase Free | R$ 0 dentro das quotas | Escolha final após contratos |
| Deploy web | Cloudflare Pages/Workers | R$ 0 dentro das quotas | Sem servidor pago obrigatório |
| Storage MVP | Cloudflare R2 ou armazenamento local | R$ 0 dentro das quotas | Só quando necessário |
| Testes | Vitest + Playwright | R$ 0 | Open source |
| Containers | Docker/Podman | R$ 0 | Desenvolvimento local |
| Documentação | Markdown no GitHub | R$ 0 | Versionada |

## 3. Design
Priorizar Penpot em vez de criar dependência obrigatória de ferramenta proprietária paga. Penpot oferece plataforma open source e opções gratuitas/self-hosted.

## 4. Banco de dados
A aplicação deve manter uma camada de persistência abstrata.

Desenvolvimento: Application -> Repository -> SQLite.

MVP publicado: Application -> Repository -> D1 ou serviço PostgreSQL-compatible.

Cloudflare D1 é adequado para um MVP serverless e possui plano gratuito, mas seus limites de consultas e armazenamento precisam ser respeitados. Supabase Free oferece PostgreSQL gratuito para projetos pequenos, mas possui quotas e comportamento de pausa. A decisão final será tomada na Issue de contratos/dados.

## 5. Deploy
Preferência inicial: GitHub -> GitHub Actions -> Cloudflare Pages/Workers -> D1/R2.
Nenhum servidor VPS pago deve ser requisito do MVP.

## 6. Proteção contra cobrança
Sempre que um serviço possuir consumo variável, devemos conhecer os limites gratuitos, evitar funcionalidades que gerem cobrança automaticamente, configurar limites/budgets quando disponíveis, monitorar consumo e manter alternativa local. A aplicação nunca deve assumir que um free tier é infinito.

## 7. Desenvolvimento local
O projeto deve funcionar localmente sem depender da nuvem: Browser -> Local Web -> Local API -> Local Database -> SportsCam Engine.
A nuvem serve inicialmente para colaboração, CI e demonstração/publicação, não para tornar o desenvolvimento impossível sem internet.

## 8. IA
IA não faz parte da infraestrutura obrigatória. Engine, API e aplicação devem funcionar normalmente sem chamadas de IA.

## 9. Migração
Nenhum serviço externo deve dominar o domínio. O domínio deve permanecer em código versionado, schemas, migrations, arquivos declarativos, formatos abertos e testes.

## 10. Critério de aceitação
Deve ser possível clonar o repositório, instalar dependências gratuitas, executar Web/App localmente, executar Engine localmente, executar banco local, rodar testes, gerar build, executar CI e publicar uma versão do MVP usando somente recursos gratuitos disponíveis.

## 11. Precedência
Este documento detalha a aplicação do cost-zero-principle.md à stack técnica do MVP. Se uma ferramenta deixar de oferecer condições de custo zero aceitáveis, devemos substituí-la antes de transformar seu custo em requisito do projeto.