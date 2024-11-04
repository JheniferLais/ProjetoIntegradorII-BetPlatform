// Tipo transacao
export type TransacaoFinanceira= {
    idTransacao: number;
    idUsuario?: number;
    tipoTransacao: string;
    valorTransacao: number;
}
// Banco de Dados temporario
export let BDtransacoesFinanceiras: TransacaoFinanceira[] = [];