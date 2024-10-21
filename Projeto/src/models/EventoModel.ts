// Tipo evento
export type Evento = {
    ID_EVENTO?: number;
    ID_USUARIO?: number;
    TITULO: string;
    DESCRICAO: string;
    VALOR_COTA: number;
    DATA_HORA_INICIO: Date;
    DATA_HORA_FIM: Date;
    DATA_EVENTO: Date;
    QTD_APOSTAS: number;
    RESULTADO: string;
    STATUS_EVENTO: string;
}