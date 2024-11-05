// Tipo evento
export type Evento = {
    id_evento?: number;
    id_usuario?: number;
    titulo: string;
    descricao: string;
    valor_cota: number;
    data_hora_inicio: string;
    data_hora_fim: string;
    data_evento: string;
    qtd_apostas: number;
    resultado: string;
    status_evento: string;
    categoria?: string;
}