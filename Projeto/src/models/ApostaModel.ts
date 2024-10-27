// Tipo apostas
export type Aposta = {
    idAposta?: number;
    idEvento: number;
    idUsuario: number;
    qtd_cotas: number;
    aposta: string; //sim ou nao
    dataAposta?: string;
}