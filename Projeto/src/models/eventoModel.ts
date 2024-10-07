// Tipo evento
export type Evento = {
    idEvento: number;
    idUsuario?: number;
    titulo: string;
    desc: string;
    valorCota: number;
    inicioApostas: Date;
    fimApostas: Date;
    dataEvento: Date;
    statusEvento: string;
    resultado: string;
    apostasQtd: number;
}
// Banco de dados temporario
export let BDeventos: Evento[] = [];