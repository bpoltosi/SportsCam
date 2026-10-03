# SportsCam — Princípio de Custo Zero

> **Status:** regra base do projeto
> **Versão:** 0.1
> **Última revisão:** 2026-10-03

## 1. Regra fundamental

O projeto SportsCam deve ser desenvolvido com **custo financeiro zero sempre que tecnicamente viável**.

Isso significa que, durante desenvolvimento, prototipação, testes e operação inicial, a arquitetura deve priorizar recursos gratuitos, open source, self-hosted e free tiers que não exijam pagamento.

**Custo zero é uma restrição arquitetural**, não apenas uma preferência.

## 2. Prioridade de escolha

Ao selecionar uma tecnologia, serviço ou ferramenta, a ordem padrão é:

1. gratuito e open source;
2. gratuito/self-hosted;
3. free tier suficiente para o projeto;
4. recurso já disponível no ambiente existente;
5. somente então considerar alternativa paga.

Uma solução paga não deve ser introduzida apenas por conveniência quando existir alternativa gratuita tecnicamente adequada.

## 3. O que deve ser evitado

Evitar dependências que criem custo recorrente obrigatório para:

- hospedagem;
- banco de dados;
- autenticação;
- armazenamento;
- CI/CD;
- observabilidade;
- APIs;
- IA;
- ferramentas de design;
- serviços de e-mail;
- domínio;
- infraestrutura de desenvolvimento.

## 4. Estratégia técnica

Sempre que possível:

- usar software open source;
- executar serviços localmente durante desenvolvimento;
- usar GitHub e recursos gratuitos disponíveis;
- usar bancos de dados open source;
- manter o Engine independente de serviços pagos;
- evitar lock-in de fornecedor;
- manter interfaces substituíveis;
- separar serviços opcionais da arquitetura central.

## 5. IA

IA não é requisito do produto e não deve criar custo obrigatório.

O SportsCam Engine deve funcionar integralmente sem IA.

Qualquer recurso de IA deverá ser:

- opcional;
- desacoplado;
- substituível;
- desativável;
- preferencialmente gratuito durante desenvolvimento.

## 6. Cloud e produção

A regra de custo zero se aplica especialmente ao desenvolvimento e MVP.

Caso uma operação real exija infraestrutura paga, isso deve ser tratado como uma decisão explícita posterior, documentando:

- motivo técnico;
- alternativa gratuita considerada;
- custo;
- impacto;
- possibilidade de substituição.

Nenhum serviço pago deve entrar silenciosamente na arquitetura.

## 7. Critério para novas dependências

Antes de adicionar uma dependência ou serviço, responder:

1. Existe alternativa open source?
2. Podemos executar localmente?
3. Existe free tier suficiente?
4. O recurso é realmente necessário?
5. Ele cria custo recorrente?
6. Ele cria lock-in?
7. Podemos substituí-lo posteriormente sem reescrever o domínio?

Se houver uma alternativa gratuita tecnicamente adequada, ela deve ser priorizada.

## 8. Regra de precedência

Esta regra complementa as arquiteturas do SportsCam Engine e SportsCam Web.

Em caso de conflito entre conveniência e custo, a solução deve ser desenhada para preservar custo zero, desde que isso não comprometa requisitos fundamentais de segurança, determinismo, qualidade ou funcionamento.

Toda exceção deve ser uma decisão explícita do projeto.
