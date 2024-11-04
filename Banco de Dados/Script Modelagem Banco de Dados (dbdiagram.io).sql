TABLE usuarios {
  id_usuario INT [PK, INCREMENT]

  nome VARCHAR(100) [NOT NULL]
  email VARCHAR(100) [UNIQUE]
  senha VARCHAR(100) [NOT NULL]
  data_nascimento DATE [NOT NULL]
  saldo DECIMAL(12,2)
}

TABLE eventos {
  id_evento INT [PK, INCREMENT]
  id_criador INT [REF: > usuarios.id_usuario]

  titulo VARCHAR(50) [NOT NULL]
  descrição VARCHAR(150) [NOT NULL]
  valor_cota DECIMAL(12,2)
  data_hora_inicio DATETIME2
  data_hora_fim DATETIME2
  data_evento DATE
  status ENUM('aprovado', 'reprovado', 'excluido', 'pendente','finalizado')
  resultado ENUM('sim', 'nao', 'pendente')
}

TABLE apostas {
  id_aposta INT [PK, INCREMENT]
  id_evento INT [REF: > eventos.id_evento]
  id_apostador INT [REF: > usuarios.id_usuario]

  valor_apostado DECIMAL(12,2)
  aposta ENUM('sim', 'nao')
}

Table transacoes_financeiras {
  id_transacao INT [pk, increment] // Identificador único da transação
  id_usuario INT [ref: > usuarios.id_usuario] // Identificador do usuário

  tipo_transacao ENUM('credito', 'saque') // Tipo de transação
  valor DECIMAL(12,2) // Valor da transação
}