-- Tabela de USUARIOS
CREATE TABLE USUARIOS (
    id_usuario NUMBER PRIMARY KEY,  -- Será gerado pela sequência
    nome VARCHAR2(100) NOT NULL,
    email VARCHAR2(150) UNIQUE NOT NULL,
    senha VARCHAR2(255) NOT NULL,
    data_nascimento VARCHAR2(11),
    moderador NUMBER(1) DEFAULT 0 -- DEFAULT = 0 para pessoa comum e 1 para moderador
);

-- Criando sequência para USUARIOS
CREATE SEQUENCE SEQ_USUARIOS START WITH 1 INCREMENT BY 1;

-- Trigger para gerar ID automaticamente em USUARIOS
CREATE OR REPLACE TRIGGER TRG_USUARIOS_ID
BEFORE INSERT ON USUARIOS
FOR EACH ROW
BEGIN
  :NEW.id_usuario := SEQ_USUARIOS.NEXTVAL;
END;
/

----------------------------------------------------------------------------------------------------------------------------------------

-- Tabela de CARTEIRA
CREATE TABLE CARTEIRA (
    id_carteira NUMBER PRIMARY KEY,  -- Será gerado pela sequência
    id_usuario NUMBER NOT NULL, -- FK para a tabela USUARIOS
    saldo NUMBER(10, 2) DEFAULT 0, -- Valor inicial da carteira = 0
    historico VARCHAR2(255)
);

-- Criando sequência para CARTEIRA
CREATE SEQUENCE SEQ_CARTEIRA START WITH 1 INCREMENT BY 1;

-- Trigger para gerar ID automaticamente em CARTEIRA
CREATE OR REPLACE TRIGGER TRG_CARTEIRA_ID
BEFORE INSERT ON CARTEIRA
FOR EACH ROW
BEGIN
  :NEW.id_carteira := SEQ_CARTEIRA.NEXTVAL;
END;
/

----------------------------------------------------------------------------------------------------------------------------------------

-- Tabela de TRANSACOES_FINANCEIRAS
CREATE TABLE TRANSACOES_FINANCEIRAS (
    id_transacao NUMBER PRIMARY KEY,  -- Será gerado pela sequência
    id_carteira NUMBER NOT NULL, -- FK para a tabela CARTEIRA
    tipo_transacao VARCHAR2(20) NOT NULL CHECK (tipo_transacao IN ('deposito','saque','aposta')),
    valor NUMBER(10, 2) NOT NULL,
    data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Hora atual no momento da inserção
);

-- Criando sequência para TRANSACOES_FINANCEIRAS
CREATE SEQUENCE SEQ_TRANSACOES_FINANCEIRAS START WITH 1 INCREMENT BY 1;

-- Trigger para gerar ID automaticamente em TRANSACOES_FINANCEIRAS
CREATE OR REPLACE TRIGGER TRG_TRANSACOES_ID
BEFORE INSERT ON TRANSACOES_FINANCEIRAS
FOR EACH ROW
BEGIN
  :NEW.id_transacao := SEQ_TRANSACOES_FINANCEIRAS.NEXTVAL;
END;
/

----------------------------------------------------------------------------------------------------------------------------------------

-- Tabela de EVENTOS
CREATE TABLE EVENTOS (
    id_evento NUMBER PRIMARY KEY,  -- Será gerado pela sequência
    id_usuario NUMBER NOT NULL, -- FK para a tabela USUARIOS
    titulo VARCHAR2(50) NOT NULL,
    descricao VARCHAR2(150),
    valor_cota NUMBER(10, 2) NOT NULL, -- (10,2) seria para suportar até 999999999,99
    data_hora_inicio TIMESTAMP,
    data_hora_fim TIMESTAMP,
    data_evento DATE,
    qtd_apostas INTEGER NOT NULL,
    resultado VARCHAR2(20) CHECK (resultado IN ('sim','nao','pendente')),
    status_evento VARCHAR2(20) CHECK (status_evento IN ('aprovado','reprovado','excluido','pendente','finalizado'))
);

-- Criando sequência para EVENTOS
CREATE SEQUENCE SEQ_EVENTOS START WITH 1 INCREMENT BY 1;

-- Trigger para gerar ID automaticamente em EVENTOS
CREATE OR REPLACE TRIGGER TRG_EVENTOS_ID
BEFORE INSERT ON EVENTOS
FOR EACH ROW
BEGIN
  :NEW.id_evento := SEQ_EVENTOS.NEXTVAL;
END;
/

----------------------------------------------------------------------------------------------------------------------------------------

-- Tabela de APOSTAS
CREATE TABLE APOSTAS (
    id_aposta NUMBER PRIMARY KEY,  -- Será gerado pela sequência
    id_evento NUMBER NOT NULL, -- FK para a tabela EVENTOS
    id_usuario NUMBER NOT NULL, -- FK para a tabela USUARIOS
    valor_aposta NUMBER(10, 2) NOT NULL,
    escolha VARCHAR2(3) CHECK (escolha IN ('sim', 'nao')) NOT NULL, 
    data_aposta TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Hora atual no momento da inserção
);

-- Criando sequência para APOSTAS
CREATE SEQUENCE SEQ_APOSTAS START WITH 1 INCREMENT BY 1;

-- Trigger para gerar ID automaticamente em APOSTAS
CREATE OR REPLACE TRIGGER TRG_APOSTAS_ID
BEFORE INSERT ON APOSTAS
FOR EACH ROW
BEGIN
  :NEW.id_aposta := SEQ_APOSTAS.NEXTVAL;
END;
/
----------------------------------------------------------------------------------------------------------------------------------------
-- Definindo as chaves estrangeiras (FK)
ALTER TABLE CARTEIRA ADD CONSTRAINT fk_carteira_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario);

ALTER TABLE TRANSACOES_FINANCEIRAS ADD CONSTRAINT fk_transacao_carteira FOREIGN KEY (id_carteira) REFERENCES CARTEIRA(id_carteira);

ALTER TABLE EVENTOS ADD CONSTRAINT fk_evento_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario);

ALTER TABLE APOSTAS ADD CONSTRAINT fk_aposta_evento FOREIGN KEY (id_evento) REFERENCES EVENTOS(id_evento);
ALTER TABLE APOSTAS ADD CONSTRAINT fk_aposta_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario);
----------------------------------------------------------------------------------------------------------------------------------------
