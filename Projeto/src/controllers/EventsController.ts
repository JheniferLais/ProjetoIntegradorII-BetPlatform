import { Request, RequestHandler, Response } from 'express';
import { eventModelData } from "../models/EventModel";
import { userModelData } from "../models/UserModel";
import { Evento } from "../models/EventModel";
import { Conta } from '../models/UserModel';
import { timeUtils } from "../utils/TimeUtils";
import { emailUtils } from "../utils/EmailUtils";



export namespace eventosHandler {

    // 'Função' para addNewEvent
    export const addNewEvent: RequestHandler =  async (req: Request, res: Response): Promise<void> => {
        const idUsuario = parseInt(req.params.id); // ID do usuario passado como parâmetro na URL
        const titulo = req.get('titulo');
        const desc = req.get('desc');
        const valorCota = parseFloat(req.get('valorCota') || ''); // Converte para número

        const dataHoraInicioApostas = req.get('inicioApostas'); //YYYY-MM-DDTHH:mm:ss
        const dataHoraFimApostas = req.get('fimApostas'); //YYYY-MM-DDTHH:mm:ss
        const dataEvento = req.get('dataEvento'); //YYYY-MM-DD
        const categoria = req.get('categoria'); // esportes, catastrofes, eleicoes, bolsa de valores, e-sports

        // Valida se todos os campos foram preenchidos
        if (!idUsuario || !titulo || !desc || !valorCota || !dataHoraInicioApostas || !dataHoraFimApostas|| !dataEvento || !categoria) {
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida se a entrada da categoria está correta
        const validCategoria = ['esportes', 'catastrofes', 'eleicoes', 'bolsa de valores', 'e-sports'];
        if (!validCategoria.includes(categoria)){
            res.status(400).send('Valor inválido para a categoria! Deve ser "esportes", "catastrofes", "eleicoes", "bolsa de valores", "e-sports".');
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
        const dataInicio: boolean = timeUtils.validarDataHora(dataHoraInicioApostas);
        const dataFim: boolean = timeUtils.validarDataHora(dataHoraFimApostas);
        const eventoData: boolean  = timeUtils.validarDataReal(dataEvento);
        if(!dataInicio || !dataFim || !eventoData) {
            res.status(400).send('Formato de data inválido!');
            return;
        }

        // Valida se a data de início é anterior à data de fim
        if (new Date(dataHoraInicioApostas) > new Date(dataHoraFimApostas)) {
            res.status(400).send('A data de início deve ser anterior à data de fim!');
            return;
        }

        // Valida se a data do evento é após o periodo de apostas
        if(new Date(dataEvento) < new Date(dataHoraFimApostas)){
            res.status(400).send('A data do evento deve ser após o periodo de apostas!');
            return;
        }

        //-------------------------------------------------------------------------

        // Cria um 'novoEvento' do tipo 'evento' com as informações recebidas
        const novoEvento: Evento = {
            id_usuario: idUsuario,
            titulo: titulo,
            descricao: desc,
            valor_cota: valorCota,
            data_hora_inicio: dataHoraInicioApostas,
            data_hora_fim: dataHoraFimApostas,
            data_evento: dataEvento,
            qtd_apostas: 0,
            resultado: 'pendente',
            status_evento: 'pendente',
            categoria: categoria,
        }

        // Insere no Banco de dados
        await eventModelData.insertEvento(novoEvento);

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

        const statusValidos = ['aprovado', 'reprovado', 'excluido', 'pendente', 'finalizado'];

        if (!statusValidos.includes(statusEvento)) {
            res.status(400).send('Valor inválido para a busca! Deve ser "aprovado", "reprovado", "excluido", "pendente", "finalizado".');
            return;
        }
        //-------------------------------------------------------------------------

        // Obtém eventos filtrados
        const filteredEvents: Evento[] | null = await eventModelData.getFilteredEvents(statusEvento);

        // Valida se existe algum evento com esse status
        if (!filteredEvents) {
            res.status(404).send('Sem eventos com esse status!');
            return;
        }

        // Response e statusCode de sucesso
        res.status(200).json(filteredEvents);
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
        const evento: Evento | null = await eventModelData.findEvento(idEvento); // Recebe o evento como um objeto
        if (!evento) {
            res.status(404).send('Evento não encontrado!');
            return;
        }

        // Valida se o usuário é o proprietário do evento
        if (evento.id_usuario !== idUsuario) {
            res.status(403).send('Você não tem permissão para excluir este evento!');
            return;
        }

        // Valida se o evento pode ser excluído (não deve estar aprovado e não deve ter apostas)
        if (evento.status_evento === 'aprovado' || evento.status_evento === 'excluido' || (evento.qtd_apostas && evento.qtd_apostas > 0)) {
            res.status(409).send('Este evento não pode ser excluído pois ele já foi excluído, aprovado ou possui apostas!');
            return;
        }

        //-------------------------------------------------------------------------

        // Altera o status_evento e resultado para excluido
        evento.status_evento = 'excluido';
        evento.resultado = 'excluido';

        // Executa a atualização no banco de dados
        await eventModelData.updateEventoStatusResultado(evento);

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

        // Valida se o evento existe
        const evento: Evento | null = await eventModelData.findEvento(idEvento);
        if (!evento) {
            res.status(404).send('Evento não encontrado!');
            return;
        }

        // Valida se o evento pode ser avaliado
        if (evento.status_evento !== 'pendente') {
            res.status(409).send('Este evento já foi avaliado e não pode ser avaliado novamente!');
            return;
        }

        // Valida se o usuario existe
        if (!evento.id_usuario){
            res.status(404).send(`Usuario não localizado!`);
            return;
        }

        //-------------------------------------------------------------------------

        const User: Conta | null = await userModelData.findIdUserEmail(evento.id_usuario);
        const UserMod: Conta | null = await userModelData.findIdUserEmail(idModerador);
        if(!User || !UserMod){
            res.status(404).send(`Usuario não localizado!`);
            return;
        }

        // Caso seja reprovado é executada a atualização no banco de dados e manda um email para o usuario informando
        if(resultado == 'reprovado'){

            // Atualiza o status_evento e resultado
            evento.status_evento = resultado;
            evento.resultado = 'reprovado';

            // Executa a atualização no banco de dados
            await eventModelData.updateEventoStatusResultado(evento);

            const options = emailUtils.mailOptions(User.email, User.nome, evento.titulo, UserMod.nome)
            try {
                await emailUtils.transporter.sendMail(options);
                res.status(200).send(`Evento ${resultado} com sucesso! E-mail enviado com sucesso.`);
                return;
            } catch (error) {
                res.status(500).send(`Evento ${resultado} com sucesso! Falha ao enviar e-mail.`);
                return;
            }
        }

        // Atualiza o status_evento
        evento.status_evento = resultado;

        // Executa a atualização no banco de dados
        await eventModelData.updateEventoStatus(evento);

        // Response e statusCode de sucesso
        res.status(200).send(`Evento ${resultado} com sucesso!`);
    };

    // 'Função' para searchEvent
    export const searchEvent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const palavraChave = req.params.palavraChave;

        // Valida se todos os campos foram preenchidos
        if (!palavraChave) {
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida se existe algum evento com a palavra fornecida
        const eventos: Evento[] | null = await eventModelData.searchEvent(palavraChave);
        if (!eventos) {
            res.status(404).send('Sem eventos com essa palavra chave!');
            return;
        }

        //-------------------------------------------------------------------------

        // Response e statusCode de sucesso
        res.status(200).json(eventos);
    }

    // 'Função' para buscar todas as informações do evento
    export const getAllInformationEvent = async (req: Request, res: Response): Promise<void> => {
        const idEvento = parseInt(req.params.idEvento); //ID do evento passado como parâmetro na URL

        // Valida se todos os campos foram preenchidos
        if(!idEvento){
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida se o evento existe
        const evento = await eventModelData.findEvento(idEvento);
        if (!evento) {
            res.status(404).send('Evento não encontrado!');
            return;
        }

        // Response e statusCode de sucesso
        res.status(200).json(evento);
    }
}