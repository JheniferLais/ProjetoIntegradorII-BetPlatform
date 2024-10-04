// Tipo apostas
export type Aposta = {
    idAposta: number;
    idUsuario?: number;
    idEvento?: number;
    valorAposta: number;
    aposta: string; //sim ou nao
}
// Banco de dados temporario
export let BDapostas: Aposta[] = [];