// Tipo transacao
export type TransacaoFinanceira= {
    idTransacao?: number;
    idUsuario?: number;
    tipoTransacao: string;
    valorTransacao: number;
    dataTransacao?: string;
}