CREATE TABLE usuarios (
  id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE,
  senha TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  saldo DECIMAL(12, 2)
);

CREATE TABLE eventos (
  id_evento INTEGER PRIMARY KEY AUTOINCREMENT,
  id_criador INTEGER,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor_cota DECIMAL(12, 2),
  data_hora_inicio DATETIME,
  data_hora_fim DATETIME,
  data_evento DATE,
  status TEXT CHECK(status IN ('aprovado', 'reprovado', 'excluido', 'pendente', 'finalizado')),
  resultado TEXT CHECK(resultado IN ('sim', 'nao', 'pendente')),
  FOREIGN KEY (id_criador) REFERENCES usuarios(id_usuario)
);

CREATE TABLE apostas (
  id_aposta INTEGER PRIMARY KEY AUTOINCREMENT,
  id_evento INTEGER,
  id_apostador INTEGER,
  valor_apostado DECIMAL(12, 2),
  aposta TEXT CHECK(aposta IN ('sim', 'nao')),
  FOREIGN KEY (id_evento) REFERENCES eventos(id_evento),
  FOREIGN KEY (id_apostador) REFERENCES usuarios(id_usuario)
);

CREATE TABLE transacoes_financeiras (
  id_transacao INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER,
  tipo_transacao TEXT CHECK(tipo_transacao IN ('credito', 'saque')),
  valor DECIMAL(12, 2),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
