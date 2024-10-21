// Tipo apostas
export type Aposta = {
    idAposta: number;
    idEvento?: number;
    idUsuario?: number;
    valorAposta: number;
    aposta: string; //sim ou nao
    dataAposta: string;
}