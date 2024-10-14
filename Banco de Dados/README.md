# Modelo de Banco de Dados de Apostas

## Introdução

Este projeto descreve o modelo conceitual de um sistema de apostas, representado através de um Diagrama de Entidade-Relacionamento (DER) criado com a ferramenta **brModelo**. O sistema gerencia usuários, carteiras, transações financeiras, apostas e eventos.

### Ferramenta Utilizada

- **brModelo**: Uma ferramenta de modelagem de banco de dados que permite criar diagramas de entidade-relacionamento (DER) e diagramas de modelo lógico, além de facilitar a geração de scripts SQL. No modelo, usamos a notação DER para representar entidades, relacionamentos e atributos.

## Entidades e Relacionamentos

### 1. USUÁRIOS
- **Descrição**: Representa os usuários da plataforma de apostas.
- **Atributos**:
  - `id_usuario` (PK): Identificador único do usuário.
  - `nome`: Nome completo do usuário.
  - `email`: Endereço de e-mail.
  - `senha`: Senha de acesso.
  - `data_nascimento`: Data de nascimento do usuário.
  - `moderador`: Indica se o usuário é um moderador.

#### Relacionamentos:
- **Possui**: Cada usuário possui uma carteira.
- **Faz**: Um usuário pode fazer várias apostas.

### 2. CARTEIRA
- **Descrição**: Representa o saldo financeiro do usuário.
- **Atributos**:
  - `id_carteira` (PK): Identificador único da carteira.
  - `saldo`: Quantia de dinheiro disponível.
  - `historico`: Histórico de transações realizadas.

#### Relacionamentos:
- **Realiza**: Uma carteira pode realizar várias transações financeiras.

### 3. TRANSAÇÕES_FINANCEIRAS
- **Descrição**: Registra todas as movimentações financeiras da carteira do usuário.
- **Atributos**:
  - `id_transacao` (PK): Identificador único da transação.
  - `tipo_transacao`: Tipo da transação (ex: depósito, saque).
  - `valor`: Valor da transação.
  - `data_transacao`: Data em que a transação foi realizada.

### 4. APOSTAS
- **Descrição**: Representa as apostas feitas pelos usuários.
- **Atributos**:
  - `id_aposta` (PK): Identificador único da aposta.
  - `valor_aposta`: Valor apostado.
  - `escolha`: Escolha feita pelo usuário para a aposta.
  - `data_aposta`: Data em que a aposta foi realizada.

#### Relacionamentos:
- **Cria**: Cada aposta é vinculada a um evento.

### 5. EVENTOS
- **Descrição**: Representa os eventos nos quais os usuários podem apostar.
- **Atributos**:
  - `id_evento` (PK): Identificador único do evento.
  - `titulo`: Nome do evento.
  - `descricao`: Descrição do evento.
  - `valor_cota`: Valor da cota do evento.
  - `data_hora_inicio`: Data e hora de início do evento.
  - `data_hora_fim`: Data e hora de término do evento.
  - `data_evento`: Data específica do evento.
  - `status_evento`: Status atual do evento (ativo, finalizado, etc.).
  - `qtd_apostas`: Quantidade de apostas feitas no evento.
  - `resultado`: Resultado final do evento.

#### Relacionamentos:
- **Pertence**: Cada evento pode conter várias apostas.

## Relacionamentos Importantes

- Um **usuário** possui uma **carteira** e pode realizar **transações financeiras**.
- Um **usuário** pode fazer várias **apostas**.
- Cada **aposta** é associada a um **evento**.
- Cada **carteira** pode realizar várias **transações financeiras**.

## Requisitos do Sistema

Este modelo de banco de dados visa suportar os seguintes requisitos funcionais:

- Gestão de usuários, incluindo informações pessoais e moderação.
- Gestão de carteiras e controle de saldo.
- Registro de transações financeiras (depósitos, saques, etc.).
- Criação e participação em apostas relacionadas a eventos específicos.
- Acompanhamento de eventos e apostas feitas pelos usuários.
