# SportsCam — Princípio de Custo Zero

> **Status:** regra arquitetural vigente
> **Versão:** 0.1
> **Última revisão:** 2026-10-03

## 1. Regra base

O projeto SportsCam deve operar sob o princípio:

> **CUSTO ZERO SEMPRE PARA TUDO, enquanto isso for tecnicamente e operacionalmente possível.**

A decisão vale para desenvolvimento, prototipação, infraestrutura, ferramentas, serviços, armazenamento, CI/CD, observabilidade, banco de dados, hospedagem e demais recursos necessários ao projeto.

## 2. Significado prático

Antes de adotar qualquer ferramenta, serviço ou infraestrutura paga, deve existir uma tentativa documentada de resolver a necessidade com:

1. recursos já disponíveis;
2. software livre/open source;
3. infraestrutura local;
4. planos gratuitos;
5. quotas gratuitas;
6. serviços self-hosted;
7. alternativas gratuitas equivalentes.

Uma solução paga somente deve ser considerada se não houver alternativa de custo zero tecnicamente aceitável para o requisito em questão.

## 3. Não confundir gratuito com dependência desnecessária

A regra não significa aceitar qualquer ferramenta apenas porque possui plano gratuito.

Devemos priorizar:

- licença compatível;
- ausência de vendor lock-in desnecessário;
- possibilidade de exportação dos dados;
- possibilidade de migração;
- execução local quando viável;
- documentação e comunidade;
- automação;
- reprodutibilidade.

## 4. Desenvolvimento

O ambiente de desenvolvimento deve privilegiar ferramentas gratuitas/open source e execução local.

Sempre que possível:

- código no GitHub;
- testes executados localmente;
- CI utilizando quotas gratuitas quando disponíveis;
- serviços auxiliares executados localmente;
- banco local durante desenvolvimento;
- mocks para serviços externos;
- containers locais;
- ferramentas open source.

## 5. Web/App

A arquitetura deve ser desenhada para poder ser desenvolvida e demonstrada sem infraestrutura paga.

Preferências:

- frontend estático quando suficiente;
- backend local durante desenvolvimento;
- banco local;
- Engine executável localmente;
- deploy em free tier somente quando necessário;
- evitar serviços pagos obrigatórios.

O produto não deve depender estruturalmente de um serviço pago para funcionar durante o desenvolvimento.

## 6. Design e prototipação

Ferramentas gratuitas devem ser priorizadas para:

- wireframes;
- design system;
- protótipos;
- diagramas;
- documentação visual.

Quando uma ferramenta possuir limitações no plano gratuito, devemos avaliar primeiro se a necessidade pode ser atendida por outra ferramenta gratuita/open source.

## 7. IA

IA é opcional e não deve criar dependência financeira estrutural.

O sistema técnico deve funcionar sem IA.

Qualquer uso de IA deve ser tratado como recurso auxiliar, preferencialmente usando recursos já disponíveis no ambiente do projeto.

## 8. Infraestrutura

A ordem de preferência é:

1. máquina local;
2. recursos gratuitos já disponíveis;
3. free tiers;
4. serviços open source self-hosted;
5. serviços pagos somente como último recurso.

## 9. Dados

Dados do projeto devem permanecer em formatos abertos e versionáveis sempre que possível.

Evitar dependência de bancos ou serviços que impeçam migração sem custo.

## 10. Segurança

Custo zero não significa ignorar segurança.

Não devemos escolher uma solução gratuita que introduza um risco desproporcional quando existe uma alternativa gratuita mais segura.

## 11. Regra para decisões futuras

Toda nova dependência deve responder:

- Existe alternativa local?
- Existe alternativa open source?
- Existe alternativa gratuita?
- Existe free tier suficiente?
- Podemos eliminar a dependência?
- Podemos implementar internamente de forma simples?
- Existe risco de vendor lock-in?
- O custo zero continua sustentável para o MVP?

Se houver uma alternativa de custo zero tecnicamente adequada, ela deve ser preferida.

## 12. Escopo

Esta regra aplica-se a:

- arquitetura;
- código;
- bibliotecas;
- ferramentas;
- design;
- prototipação;
- CI/CD;
- hospedagem;
- banco de dados;
- armazenamento;
- observabilidade;
- autenticação;
- documentação;
- testes;
- infraestrutura;
- serviços auxiliares.

## 13. Exceções

Uma exceção somente deve ocorrer quando:

- o requisito não puder ser atendido de forma tecnicamente aceitável sem custo;
- a dependência paga for explicitamente necessária;
- a decisão for registrada antes da adoção.

A exceção deve registrar:

- motivo;
- alternativas gratuitas avaliadas;
- custo;
- impacto;
- possibilidade de substituição futura.

## 14. Princípio permanente

**Custo zero é um requisito de arquitetura, não apenas uma preferência de orçamento.**

Toda decisão futura do projeto deve partir desse princípio.
