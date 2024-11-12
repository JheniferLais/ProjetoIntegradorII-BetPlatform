-- Tabela de USUARIOS
CREATE TABLE usuarios (
    id_usuario      INT PRIMARY KEY,
    nome            VARCHAR2(100) NOT NULL,
    email           VARCHAR2(150) UNIQUE NOT NULL,
    senha           VARCHAR2(255) NOT NULL,
    data_nascimento VARCHAR2(11)  NOT NULL,
    token           VARCHAR2(32)  NOT NULL,
    moderador       NUMBER(1)     default 0, -- Valor inicial = 0 para usuario comum e 1 para moderador
    saldo           NUMBER(20, 2) default 0 -- Valor inicial da carteira = 0
);

-- Criando sequência para USUARIOS
CREATE SEQUENCE SEQ_USUARIOS START WITH 1 INCREMENT BY 1;

----------------------------------------------------------------------------------------------------------------------------------------

-- Tabela de TRANSACOES_FINANCEIRAS
CREATE TABLE transacoes_financeiras (
    id_transacao   INT PRIMARY KEY,
    id_usuario     INT NOT NULL, -- FK para a tabela USUARIOS
    tipo_transacao VARCHAR2(20)  NOT NULL CHECK (tipo_transacao IN ('deposito', 'saque', 'aposta', 'ganho_aposta', 'reembolso')),
    valor          NUMBER(10, 2) NOT NULL,
    data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Hora atual no momento da inserção
);

-- Criando sequência para TRANSACOES_FINANCEIRAS
CREATE SEQUENCE SEQ_TRANSACOES_FINANCEIRAS START WITH 1 INCREMENT BY 1;

----------------------------------------------------------------------------------------------------------------------------------------

-- Tabela de EVENTOS
CREATE TABLE eventos (
    id_evento        INT PRIMARY KEY,
    id_usuario       INT NOT NULL, -- FK para a tabela USUARIOS
    titulo           VARCHAR2(50)  NOT NULL,
    descricao        VARCHAR2(150) NOT NULL,
    valor_cota       NUMBER(10, 2) NOT NULL, -- (10,2) seria para suportar até 999999999,99
    data_hora_inicio VARCHAR2(22)  NOT NULL,
    data_hora_fim    VARCHAR2(22)  NOT NULL,
    data_evento      VARCHAR2(22)  NOT NULL,
    qtd_apostas      INT NOT NULL,
    resultado        VARCHAR2(20) NOT NULL CHECK (resultado IN ('sim', 'nao', 'pendente', 'reprovado', 'excluido')),
    status_evento    VARCHAR2(20) NOT NULL CHECK (status_evento IN ('aprovado', 'reprovado', 'excluido', 'pendente', 'finalizado')),
    categoria        VARCHAR2(20) NOT NULL CHECK (categoria IN ('esportes', 'catastrofes', 'eleicoes', 'bolsa de valores', 'e-sports'))
);

-- Criando sequência para EVENTOS
CREATE SEQUENCE SEQ_EVENTOS START WITH 1 INCREMENT BY 1;

----------------------------------------------------------------------------------------------------------------------------------------

-- Tabela de APOSTAS
CREATE TABLE apostas (
    id_aposta   INT PRIMARY KEY,
    id_evento   INT NOT NULL, -- FK para a tabela EVENTOS
    id_usuario  INT NOT NULL, -- FK para a tabela USUARIOS
    qtd_cotas   INT NOT NULL,
    aposta      VARCHAR2(3) NOT NULL CHECK (aposta IN ('sim', 'nao')),
    data_aposta TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP -- Hora atual no momento da inserção
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

-- Função para finalizar o evento
create PROCEDURE finalizar_evento(idEvento IN NUMBER, veredito IN VARCHAR2) AS
    veredito_perdedor VARCHAR2(3);
    soma_vencedora NUMBER := 0;
    soma_perdedora NUMBER := 0;
    total_premio NUMBER := 0;
BEGIN
    -- Define o veredito perdedor com base no veredito fornecido
    IF veredito = 'sim' THEN veredito_perdedor := 'nao';
    ELSE
        veredito_perdedor := 'sim';
    END IF;

    -- Atualiza o status e o resultado do evento
    UPDATE eventos
    SET resultado = veredito, status_evento = 'finalizado'
    WHERE id_evento = idEvento;

    -- Calcula a soma das apostas vencedoras
    SELECT COALESCE(SUM(qtd_cotas * valor_cota), 0) INTO soma_vencedora
    FROM apostas a
             JOIN eventos e ON a.id_evento = e.id_evento
    WHERE a.id_evento = idEvento AND a.aposta = veredito;

    -- Calcula a soma das apostas perdedoras
    SELECT COALESCE(SUM(qtd_cotas * valor_cota), 0) INTO soma_perdedora
    FROM apostas a
             JOIN eventos e ON a.id_evento = e.id_evento
    WHERE a.id_evento = idEvento AND a.aposta = veredito_perdedor;

    -- Reembolsa todos os apostadores se não houver vencedores ou perdedores
    IF soma_vencedora = 0 OR soma_perdedora = 0 THEN
        FOR aposta IN (
            SELECT a.id_usuario, a.qtd_cotas * e.valor_cota AS valor_reembolso
            FROM apostas a
                     JOIN eventos e ON a.id_evento = e.id_evento
            WHERE a.id_evento = idEvento) LOOP

                -- Atualiza o saldo dos usuários
                UPDATE usuarios
                SET saldo = saldo + aposta.valor_reembolso
                WHERE id_usuario = aposta.id_usuario;

                -- Insere transação de reembolso
                INSERT INTO transacoes_financeiras (id_transacao, id_usuario, tipo_transacao, valor, data_transacao)
                VALUES (SEQ_TRANSACOES_FINANCEIRAS.NEXTVAL, aposta.id_usuario, 'reembolso', aposta.valor_reembolso, SYSDATE);
            END LOOP;
        RETURN;
    END IF;

    -- Calcula o prêmio total
    total_premio := soma_vencedora + soma_perdedora;

    -- Distribui os ganhos proporcionalmente entre os vencedores
    FOR aposta IN (
        SELECT a.id_usuario, a.qtd_cotas * e.valor_cota AS valor_aposta
        FROM apostas a
                 JOIN eventos e ON a.id_evento = e.id_evento
        WHERE a.id_evento = idEvento AND a.aposta = veredito) LOOP

            -- Calcula o valor ganho pelo usuário
            DECLARE
                valor_ganho NUMBER;
            BEGIN
                valor_ganho := (aposta.valor_aposta / soma_vencedora) * total_premio;

                -- Atualiza o saldo do vencedor
                UPDATE usuarios
                SET saldo = saldo + valor_ganho
                WHERE id_usuario = aposta.id_usuario;

                -- Insere transação de ganho com a sequência SEQ_TRANSACOES_FINANCEIRAS
                INSERT INTO transacoes_financeiras (id_transacao, id_usuario, tipo_transacao, valor, data_transacao)
                VALUES (SEQ_TRANSACOES_FINANCEIRAS.NEXTVAL, aposta.id_usuario, 'ganho_aposta', valor_ganho, SYSDATE);
            END;
        END LOOP;
END finalizar_evento;
/

-- Função para realizar uma aposta
create PROCEDURE realizar_aposta (
    idEvento IN NUMBER,
    idUsuario IN NUMBER,
    qtdCotas IN NUMBER,
    apostaSN IN VARCHAR2
) AS
BEGIN

    -- 1. Debita o saldo do usuário pelo valor da aposta
    UPDATE usuarios
    SET saldo = saldo - (qtdCotas * (SELECT valor_cota FROM eventos WHERE id_evento = idEvento))
    WHERE id_usuario = idUsuario;

    -- 2. Aumenta a quantidade de apostas no evento
    UPDATE eventos
    SET qtd_apostas = qtd_apostas + 1
    WHERE id_evento = idEvento;

    -- 3. Registra a aposta na tabela APOSTAS
    INSERT INTO apostas (id_aposta, id_evento, id_usuario, qtd_cotas, aposta)
    VALUES (SEQ_APOSTAS.NEXTVAL, idEvento, idUsuario, qtdCotas, apostaSN);

    -- 4. Insere a transação financeira para registrar a aposta
    INSERT INTO transacoes_financeiras (id_transacao, id_usuario, tipo_transacao, valor)
    VALUES (SEQ_TRANSACOES_FINANCEIRAS.NEXTVAL, idUsuario, 'aposta', qtdCotas * (SELECT valor_cota FROM eventos WHERE id_evento = idEvento));

    COMMIT;
END realizar_aposta;
/

----------------------------------------------------------------------------------------------------------------------------------------