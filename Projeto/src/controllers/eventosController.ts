import { Request, RequestHandler, Response } from 'express';
import { BDeventos, Evento } from "../models/eventoModel";
import { salvarNoBanco } from "../utils/dataBaseUtils";

export namespace eventosHandler {

    // 'Função' para addNewEvent
    export const addNewEvent: RequestHandler = (req: Request, res: Response): void => {
        const titulo = req.get('titulo');
        const desc = req.get('desc');
        const valorCota = parseFloat(req.get('valorCota') || ''); // Converte para número
        const inicioApostas = req.get('inicioApostas');
        const fimApostas = req.get('fimApostas');
        const dataEvento = req.get('dataEvento');
        //
        if (titulo && desc && valorCota && inicioApostas && fimApostas && dataEvento) {
            if (titulo.length <= 50 && desc.length <= 150) {

                // Inicia o 'statusEvento' para ser sempre 'pendente' na criação
                const statusEvento: string = 'pendente'

                // Cria um 'novoEvento' do tipo 'evento' com as informações recebidas
                const novoEvento: Evento = {
                    idEvento: BDeventos.length,
                    titulo: titulo,
                    desc: desc,
                    valorCota: valorCota,
                    inicioApostas: inicioApostas,
                    fimApostas: fimApostas,
                    dataEvento: dataEvento,
                    status: statusEvento,
                    resultado: statusEvento,
                }

                // Insere no Banco e retorna um id
                const idEvento: number = salvarNoBanco(novoEvento, BDeventos);

                const response = {
                    idEvento: idEvento,
                    titulo: `${titulo}`,
                    desc: `${desc}`,
                    valorCota: `${valorCota}`,
                    inicioApostas: `${inicioApostas}`,
                    fimApostas: `${fimApostas}`,
                    dataEvento: `${dataEvento}`,
                    status: `${statusEvento}`,
                    resultado: `${statusEvento}`,
                };
                res.statusCode = 200;
                res.send(response);
            } else {
                res.statusCode = 400;
                res.send(`Preencha todos os campos!`);
            }
        }
    }
}