// Tipo evento
export type Evento = {
    idEvento: number;
    idUsuario?: number;
    titulo: string;
    desc: string;
    valorCota: number;
    inicioApostas: string;
    fimApostas: string;
    dataEvento: string;
    status: string;
    resultado: string;
}
// Banco de dados temporario
export let BDeventos: Evento[] = [];