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

        // Verifica se todos os campos obrigatórios foram preenchidos
        if (!titulo || !desc || isNaN(valorCota) || valorCota <= 0 || !inicioApostas || !fimApostas || !dataEvento) {
            res.statusCode = 400;
            res.send(`Preencha todos os campos!`);
            return;
        }
        // Verifica os tamanhos dos campos de título e descrição
        if (titulo.length > 50 || desc.length > 150) {
            res.statusCode = 400;
            res.send(`Tamanho inválido para os campos(titulo ou descrição)!`);
            return;
        }
        // Verifica se a data de início é anterior à data de fim
        if (new Date(inicioApostas) >= new Date(fimApostas)) {
            res.statusCode = 400;
            res.send(`A data de início deve ser anterior à data de fim!`);
            return;
        }

        // Inicia o 'statusEvento' para ser sempre 'pendente' na criação
        const statusEvento: string = 'pendente'

        // Cria um 'novoEvento' do tipo 'evento' com as informações recebidas
        const novoEvento: Evento = {
            idEvento: BDeventos.length,
            idUsuario: 1, // TESTE!!!
            titulo: titulo,
            desc: desc,
            valorCota: valorCota,
            inicioApostas: new Date(inicioApostas),
            fimApostas: new Date(fimApostas),
            dataEvento: new Date(dataEvento),
            statusEvento: statusEvento,
            resultado: statusEvento,
            apostasQtd: 0,
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
    };

    // Função para procurar todos os eventos de acordo com o parametro
    function getFilteredEvents(status: string): Evento[] {
        return BDeventos.filter(evento => evento.statusEvento === status);
    }

    // 'Função' para getEvent
    export const getEvent: RequestHandler = (req: Request, res: Response): void => {
        const statusEvento = req.get('statusEvento');

        // Verifica se o statusEvento foi fornecido
        if (!statusEvento) {
            res.statusCode = 400;
            res.send(`Preencha todos os campos!`);
            return;
        }

        // Obtém eventos filtrados
        const filteredEvents: Evento[] = getFilteredEvents(statusEvento);

        if (filteredEvents.length > 0){
            res.statusCode = 200;
            res.send(filteredEvents);
        } else {
            res.statusCode = 204;
            res.send(`sem eventos com esse status`);
        }
    }

    // 'Função' para deleteEvent
    export const deleteEvent: RequestHandler = (req: Request, res: Response): void => {
        const idEvento = parseInt(req.params.id); // ID do evento passado como parâmetro na URL
        const usuarioId = req.get('usuarioId'); // ID do usuário, deve ser obtido através de autenticação

        if(!idEvento || !usuarioId){
            res.statusCode = 400;
            res.send(`Preencha todos os campos!`);
            return;
        }
        // Verifica se o evento existe
        const evento = BDeventos.find(e => e.idEvento === idEvento);
        if (!evento) {
            res.statusCode =404;
            res.send('Evento não encontrado.');
            return;
        }
        // Verifica se o usuário é o proprietário do evento
        if (evento.idUsuario !== parseInt(usuarioId)) {
            res.statusCode = 403;
            res.send('Você não tem permissão para excluir este evento.');
            return;
        }
        // Verifica se o evento pode ser excluído (não deve estar aprovado e não deve ter apostas)
        if (evento.statusEvento === 'aprovado' || evento.apostasQtd > 0) {
            res.statusCode = 400;
            res.send('O evento não pode ser excluído porque já está aprovado ou recebeu apostas.');
            return;
        }

        // Altera o status do evento para 'excluído'
        evento.statusEvento = 'excluído';

        res.status(200).send('Evento excluído com sucesso.');
    }

    // 'Função' para evaluateNewEvent
    export const evaluateNewEvent: RequestHandler = (req: Request, res: Response): void => {
        const idEvento = parseInt(req.params.id); // ID do evento passado como parâmetro na URL
        const resultado = req.get('resultado'); // Resultado pode ser 'aprovado' ou 'reprovado'
        //const moderadorId = req.get('moderadorId'); // ID do moderador, deve ser obtido através de autenticação

        // Verifica se o resultado foi fornecido
        if (!resultado || (resultado !== 'aprovado' && resultado !== 'reprovado')) {
            res.statusCode = 400;
            res.send(`Resultado inválido! Deve ser "aprovado" ou "reprovado".`);
            return;
        }

        // Verifica se o evento existe
        const evento = BDeventos.find(e => e.idEvento === idEvento);
        if (!evento) {
            res.statusCode = 404;
            res.send(`Evento não encontrado.`);
            return;
        }

        // Verifica se o evento pode ser avaliado
        if (evento.statusEvento !== 'pendente') {
            res.statusCode =400;
            res.send(`O evento já foi avaliado.`);
        }

        // Atualiza o status do evento
        evento.statusEvento = resultado;

        res.statusCode = 200;
        res.send(`Evento ${resultado} com sucesso.`);
    };
}