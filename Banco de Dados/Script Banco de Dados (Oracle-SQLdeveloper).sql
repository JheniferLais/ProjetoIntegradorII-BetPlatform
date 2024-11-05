-- Tabela de USUARIOS
CREATE TABLE USUARIOS (
    id_usuario INT PRIMARY KEY,
    nome VARCHAR2(100) NOT NULL,
    email VARCHAR2(150) UNIQUE NOT NULL,
    senha VARCHAR2(255) NOT NULL,
    data_nascimento VARCHAR2(11) NOT NULL,
    token VARCHAR2(32) NOT NULL,
    moderador NUMBER(1) DEFAULT 0, -- DEFAULT = 0 para pessoa comum e 1 para moderador
    saldo NUMBER(20, 2) DEFAULT 0 -- Valor inicial da carteira = 0
);

-- Criando sequência para USUARIOS
CREATE SEQUENCE SEQ_USUARIOS START WITH 1 INCREMENT BY 1;

----------------------------------------------------------------------------------------------------------------------------------------

-- Tabela de TRANSACOES_FINANCEIRAS
CREATE TABLE TRANSACOES_FINANCEIRAS (
    id_transacao INT PRIMARY KEY,
    id_usuario INT NOT NULL, -- FK para a tabela USUARIOS
    tipo_transacao VARCHAR2(20) NOT NULL CHECK (tipo_transacao IN ('deposito','saque','aposta', 'ganho_aposta')),
    valor NUMBER(10, 2) NOT NULL,
    data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Hora atual no momento da inserção
);

-- Criando sequência para TRANSACOES_FINANCEIRAS
CREATE SEQUENCE SEQ_TRANSACOES_FINANCEIRAS START WITH 1 INCREMENT BY 1;

----------------------------------------------------------------------------------------------------------------------------------------

-- Tabela de EVENTOS
CREATE TABLE EVENTOS (
    id_evento INT PRIMARY KEY,
    id_usuario INT NOT NULL, -- FK para a tabela USUARIOS
    titulo VARCHAR2(50) NOT NULL,
    descricao VARCHAR2(150) NOT NULL,
    valor_cota NUMBER(10, 2) NOT NULL, -- (10,2) seria para suportar até 999999999,99
    data_hora_inicio TIMESTAMP NOT NULL,
    data_hora_fim TIMESTAMP NOT NULL,
    data_evento DATE NOT NULL,
    qtd_apostas INT NOT NULL,
    resultado VARCHAR2(20) NOT NULL CHECK (resultado IN ('sim','nao','pendente', 'reprovado')),
    status_evento VARCHAR2(20) NOT NULL CHECK (status_evento IN ('aprovado','reprovado','excluido','pendente','finalizado')),
    categoria VARCHAR2(20) NOT NULL CHECK (categoria IN ('esportes', 'catastrofes', 'eleicoes', 'bolsa de valores', 'e-sports'))
);

-- Criando sequência para EVENTOS
CREATE SEQUENCE SEQ_EVENTOS START WITH 1 INCREMENT BY 1;

----------------------------------------------------------------------------------------------------------------------------------------

-- Tabela de APOSTAS
CREATE TABLE APOSTAS (
    id_aposta INT PRIMARY KEY,
    id_evento INT NOT NULL, -- FK para a tabela EVENTOS
    id_usuario INT NOT NULL, -- FK para a tabela USUARIOS
    qtd_cotas INT NOT NULL,
    aposta VARCHAR2(3) NOT NULL CHECK (aposta IN ('sim', 'nao')),
    data_aposta TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Hora atual no momento da inserção
);

-- Criando sequência para APOSTAS
CREATE SEQUENCE SEQ_APOSTAS START WITH 1 INCREMENT BY 1;

----------------------------------------------------------------------------------------------------------------------------------------
-- Definindo as chaves estrangeiras (FK)

-- FK para vincular TRANSACOES_FINANCEIRAS ao USUARIOS
ALTER TABLE TRANSACOES_FINANCEIRAS ADD CONSTRAINT fk_transacao_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario);

-- FK para vincular EVENTOS ao USUARIOS
ALTER TABLE EVENTOS ADD CONSTRAINT fk_evento_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario);

-- FK para vincular APOSTAS ao EVENTOS e ao USUARIOS
ALTER TABLE APOSTAS ADD CONSTRAINT fk_aposta_evento FOREIGN KEY (id_evento) REFERENCES EVENTOS(id_evento);
ALTER TABLE APOSTAS ADD CONSTRAINT fk_aposta_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario);

----------------------------------------------------------------------------------------------------------------------------------------