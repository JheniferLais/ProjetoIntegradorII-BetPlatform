import { Request, RequestHandler, Response } from 'express';
import { Evento } from "../models/eventoModel";
import { timeUtils } from "../utils/timeUtils";
import { dataBaseUtils } from "../utils/dataBaseUtils";
import {Conta} from "../models/usuarioModel";

export namespace eventosHandler {

    // 'Função' para addNewEvent
    export const addNewEvent: RequestHandler =  async (req: Request, res: Response): Promise<void> => {
        const idUsuario = parseInt(req.params.id); // ID do usuario passado como parâmetro na URL
        const titulo = req.get('titulo');
        const desc = req.get('desc');
        const valorCota = parseFloat(req.get('valorCota') || ''); // Converte para número
        const inicioApostas = req.get('inicioApostas');
        const fimApostas = req.get('fimApostas');
        const dataEvento = req.get('dataEvento');

        // Verifica se todos os campos obrigatórios foram preenchidos
        if (!idUsuario || !titulo || !desc || isNaN(valorCota) || valorCota < 1 || !inicioApostas || !fimApostas || !dataEvento) {
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

        // Valida o formato das datas
        const dataInicio: boolean = timeUtils.validarDataReal(inicioApostas);
        const dataFim: boolean = timeUtils.validarDataReal(fimApostas);
        const Eventodata: boolean  = timeUtils.validarDataReal(dataEvento);
        if(!dataInicio || !dataFim || !Eventodata) {
            //res.statusCode = ?
            res.send(`Formato de data invalida!`);
            return;
        }

        // Verifica se a data de início é anterior à data de fim
        if (new Date(inicioApostas) >= new Date(fimApostas)) {
            res.statusCode = 400;
            res.send(`A data de início deve ser anterior à data de fim!`);
            return;
        }

        // Cria um 'novoEvento' do tipo 'evento' com as informações recebidas
        const novoEvento: Evento = {
            ID_USUARIO: idUsuario,
            TITULO: titulo,
            DESCRICAO: desc,
            VALOR_COTA: valorCota,
            DATA_HORA_INICIO: new Date(inicioApostas),
            DATA_HORA_FIM: new Date(fimApostas),
            DATA_EVENTO: new Date(dataEvento),
            QTD_APOSTAS: 0,
            RESULTADO: 'pendente',
            STATUS_EVENTO: 'pendente',
        }

        await dataBaseUtils.insertEvento(novoEvento);

        res.statusCode = 200;
        res.send(`Evento criado com sucesso`);
    };

    // 'Função' para getEvent
    export const getEvent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const statusEvento = req.get('statusEvento');

        // Verifica se o statusEvento foi fornecido
        if (!statusEvento) {
            res.statusCode = 400;
            res.send(`Preencha todos os campos!`);
            return;
        }

        // Obtém eventos filtrados
        const filteredEvents = await dataBaseUtils.getFilteredEvents(statusEvento);

        if (!filteredEvents || filteredEvents.length === 0) {
            //res.statusCode = 400;
            res.send('sem eventos com esse status');
            return;
        }
        res.statusCode = 200;
        res.send(filteredEvents);
    }

    // 'Função para deleteEvent
    export const deleteEvent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const idEvento = parseInt(req.params.idEvento); //ID do evento passado como parâmetro na URL
        const idUsuario = parseInt(req.params.id); //ID do usuario passado como parâmetro na URL

        if (!idEvento || !idUsuario) {
            res.status(400).send('Preencha todos os campos!');
            return;
        }

        //Verifica se o evento existe
        const evento: Evento | null = await dataBaseUtils.findEvento(idEvento); // Recebe o evento como um objeto
        if (!evento) {
            res.status(404).send('Evento não encontrado!');
            return;
        }

        //Verifica se o usuário é o proprietário do evento
        if (evento.ID_USUARIO !== idUsuario) {
            res.status(403).send('Você não tem permissão para excluir este evento.');
            return;
        }

        //Verifica se o evento pode ser excluído (não deve estar aprovado e não deve ter apostas)
        if (evento.STATUS_EVENTO === 'aprovado' || evento.STATUS_EVENTO === 'excluido' || (evento.QTD_APOSTAS && evento.QTD_APOSTAS > 0)) {
            res.status(400).send('O evento não pode ser excluído porque já está aprovado, recebeu apostas ou já está excluido.');
            return;
        }

        evento.STATUS_EVENTO = 'excluido';  // Atualiza o status do evento

        await dataBaseUtils.updateEvento(evento);  //Executa a atualização no banco de dados

        res.status(200).send('Evento excluído com sucesso.');
    }

    // 'Função' para evaluateNewEvent
    export const evaluateNewEvent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const idEvento = parseInt(req.params.idEvento); //ID do evento passado como parâmetro na URL
        const idModerador = parseInt(req.params.id); //ID do moderador passado como parâmetro na URL
        const resultado = req.get('resultado'); // Resultado pode ser 'aprovado' ou 'reprovado'

        // Verifica se o resultado foi fornecido corretamente
        if (!resultado || (resultado !== 'aprovado' && resultado !== 'reprovado')) {
            res.statusCode = 400;
            res.send(`Resultado inválido! Deve ser "aprovado" ou "reprovado".`);
            return;
        }

        const moderador: Conta[][] = await dataBaseUtils.findModerador(idModerador);
        if (!moderador || moderador.length === 0) {
            res.status(401).send('Não autorizado para essa rota!');
            return;
        }

        // Verifica se o evento existe
        const evento: Evento | null = await dataBaseUtils.findEvento(idEvento);
        if (!evento) {
            res.status(404).send('Evento não encontrado!');
            return;
        }

        // Verifica se o evento pode ser avaliado
        if (evento.STATUS_EVENTO !== 'pendente') {
            res.statusCode = 400;
            res.send(`Não é possivel avaliar esse evento!`);
            return;
        }

        evento.STATUS_EVENTO = resultado; // Atualiza o status do evento

        await dataBaseUtils.updateEvento(evento); //Executa a atualização no banco de dados

        res.status(200).send(`Evento ${resultado} com sucesso!`);
    };
}