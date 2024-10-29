import { Request, RequestHandler, Response } from 'express';
import { Evento } from "../models/EventoModel";
import { timeUtils } from "../utils/TimeUtils";
import { dataBaseUtils } from "../utils/DataBaseUtils";
import { Conta } from "../models/UsuarioModel";

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

        // Valida se todos os campos foram preenchidos
        if (!idUsuario || !titulo || !desc || !valorCota || !inicioApostas || !fimApostas || !dataEvento) {
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida se valorCota é numero e maior ou igual a 1
        if (isNaN(valorCota) || valorCota < 1){
            res.status(400).send('Valor inválido para cota!');
            return;
        }

        // Valida os tamanhos dos campos de título e descrição
        if (titulo.length > 50 || desc.length > 150) {
            res.status(400).send('O campo (titulo/descrição) é muito longo!');
            return;
        }

        // Valida o formato das datas
        const dataInicio: boolean = timeUtils.validarDataReal(inicioApostas);
        const dataFim: boolean = timeUtils.validarDataReal(fimApostas);
        const Eventodata: boolean  = timeUtils.validarDataReal(dataEvento);
        if(!dataInicio || !dataFim || !Eventodata) {
            res.status(400).send('Formato de data inválido!');
            return;
        }

        // Valida se a data de início é anterior à data de fim
        if (new Date(inicioApostas) >= new Date(fimApostas)) {
            res.status(400).send('A data de início deve ser anterior à data de fim!');
            return;
        }

        //-------------------------------------------------------------------------

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

        // Insere no Banco de dados
        await dataBaseUtils.insertEvento(novoEvento);

        // Response e statusCode de sucesso
        res.status(201).send('Evento criado com sucesso!');
    };

    // 'Função' para getEvent
    export const getEvent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const statusEvento = req.get('statusEvento');

        // Valida se todos os campos foram preenchidos
        if (!statusEvento) {
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        //-------------------------------------------------------------------------

        // Obtém eventos filtrados
        const filteredEvents: Evento[][] = await dataBaseUtils.getFilteredEvents(statusEvento);

        // Valida se existe algum evento com esse status
        if (!filteredEvents || filteredEvents.length === 0) {
            res.status(404).send('Sem eventos com esse status!');
            return;
        }

        // Response e statusCode de sucesso
        res.status(200).send(filteredEvents);
    }

    // 'Função para deleteEvent
    export const deleteEvent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const idEvento = parseInt(req.params.idEvento); //ID do evento passado como parâmetro na URL
        const idUsuario = parseInt(req.params.id); //ID do usuario passado como parâmetro na URL

        // Valida se todos os campos foram preenchidos
        if (!idEvento || !idUsuario) {
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida se o evento existe
        const evento: Evento | null = await dataBaseUtils.findEvento(idEvento); // Recebe o evento como um objeto
        if (!evento) {
            res.status(404).send('Evento não encontrado!');
            return;
        }

        // Valida se o usuário é o proprietário do evento
        if (evento.ID_USUARIO !== idUsuario) {
            res.status(403).send('Você não tem permissão para excluir este evento!');
            return;
        }

        // Valida se o evento pode ser excluído (não deve estar aprovado e não deve ter apostas)
        if (evento.STATUS_EVENTO === 'aprovado' || evento.STATUS_EVENTO === 'excluido' || (evento.QTD_APOSTAS && evento.QTD_APOSTAS > 0)) {
            res.status(409).send('Este evento não pode ser excluído pois ele já foi excluído, aprovado ou possui apostas!');
            return;
        }

        //-------------------------------------------------------------------------

        // Altera o status_evento para excluido
        evento.STATUS_EVENTO = 'excluido';  // Atualiza o status do evento

        // Executa a atualização no banco de dados
        await dataBaseUtils.updateEvento(evento);

        // Response e statusCode de sucesso
        res.status(200).send('Evento excluído com sucesso!');
    }

    // 'Função' para evaluateNewEvent
    export const evaluateNewEvent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const idEvento = parseInt(req.params.idEvento); //ID do evento passado como parâmetro na URL
        const idModerador = parseInt(req.params.id); //ID do moderador passado como parâmetro na URL
        const resultado = req.get('resultado'); // Resultado pode ser 'aprovado' ou 'reprovado'

        // Valida se todos os campos foram preenchidos
        if(!idEvento || !idModerador || !resultado){
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida se o resultado foi fornecido corretamente
        if (resultado !== 'aprovado' && resultado !== 'reprovado') {
            res.status(400).send('Valor inválido para resultado! Deve ser "aprovado" ou "reprovado".');
            return;
        }

        // Valida se o usuario é moderador
        const moderador: Conta[][] = await dataBaseUtils.findModerador(idModerador);
        if (!moderador || moderador.length === 0) {
            res.status(403).send('Não autorizado para essa rota!');
            return;
        }

        // Valida se o evento existe
        const evento: Evento | null = await dataBaseUtils.findEvento(idEvento);
        if (!evento) {
            res.status(404).send('Evento não encontrado!');
            return;
        }

        // Valida se o evento pode ser avaliado
        if (evento.STATUS_EVENTO !== 'pendente') {
            res.status(409).send('Este evento já foi avaliado e não pode ser avaliado novamente!');
            return;
        }

        // Executa a alteração do status_evento e resultado caso o evento seja reprovado
        if(resultado == 'reprovado'){

            // Atualiza o status_evento e resultado
            evento.STATUS_EVENTO = resultado;
            evento.RESULTADO = 'reprovado';

            // Executa a atualização no Banco de dados
            await dataBaseUtils.updateEventoReprovado(evento);

            // Response e statusCode de sucesso
            res.status(200).send(`Evento ${resultado} com sucesso!`);
        }

        // Atualiza o status_evento
        evento.STATUS_EVENTO = resultado;

        // Executa a atualização no banco de dados
        await dataBaseUtils.updateEvento(evento);

        // Response e statusCode de sucesso
        res.status(200).send(`Evento ${resultado} com sucesso!`);
    };

    // 'Função' para searchEvent
    export const searchEvent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const palavraChave = req.get('palavraChave');

        // Valida se todos os campos foram preenchidos
        if (!palavraChave) {
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida se existe algum evento com a palavra fornecida
        const eventos: Evento | null = await dataBaseUtils.searchEvent(palavraChave);
        if (!eventos) {
            res.status(404).send('Sem eventos com essa palavra chave!');
            return;
        }

        // Response e statusCode de sucesso
        res.status(200).send(eventos);
    }
}