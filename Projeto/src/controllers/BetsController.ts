import { Request, RequestHandler, Response } from 'express';
import { betModelData } from "../models/BetModel";
import { eventModelData } from "../models/EventModel";
import { walletModelData } from "../models/WalletModel";
import { Aposta } from "../models/BetModel";
import { Evento } from "../models/EventModel";
import { Carteira } from "../models/WalletModel";
import { timeUtils } from "../utils/TimeUtils";



export namespace apostasHandler {

    // Rota para apostar em um evento
    export const betOnEvent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const idEvento = parseInt(req.params.idEvento); //ID do evento passado como parâmetro na URL
        const idUsuario = parseInt(req.params.id); //ID do usuario passado como parâmetro na URL

        const email = req.get('email');
        const qtd_cotas = parseInt(req.get('qtd_cotas') || '');
        const aposta = req.get('aposta');

        // Valida se todos os campos foram preenchidos
        if (!idEvento || !idUsuario || !email || !qtd_cotas || !aposta) {
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida se o email digitado e o id do usuario sao do mesmo usuario
        const user: true | null = await betModelData.validaUserAposta(email, idUsuario);
        if (!user) {
            res.status(403).send('O email fornecido não pertence a sua conta!');
            return;
        }

        // Valida se o usuario digitou valores aceitos
        if (aposta !== 'sim' && aposta !== 'nao') {
            res.status(400).send('Valor inválido para aposta! Deve ser "sim" ou "nao"!');
            return;
        }

        // Valida a quantidade de cotas
        if(qtd_cotas < 1 || !Number.isInteger(qtd_cotas) || isNaN(qtd_cotas)) {
            res.status(400).send('Valor inválido para quantidade de cotas!');
            return;
        }

        // Valida se a carteira do usuario existe
        const carteira: Carteira | null = await walletModelData.findCarteira(idUsuario);
        if (!carteira) {
            res.status(404).send('Carteira não encontrada!');
            return;
        }

        // Valida se o evento existe
        const evento: Evento | null = await eventModelData.findEvento(idEvento);
        if (!evento) {
            res.status(404).send('Evento não encontrado!');
            return;
        }

        // Valida se o usuário tem saldo suficiente
        if (carteira.saldo < evento.valor_cota * qtd_cotas) {
            res.status(400).json('Saldo insuficiente para realizar a aposta!');
            return;
        }

        // Valida se o evento pode receber apostas
        if (evento.status_evento !== 'aprovado' || evento.resultado !== 'pendente') {
            res.status(400).send('Não é possivel apostar nesse evento!');
            return;
        }

        //Valida se o evento já pode receber apostas
        if(new Date() < new Date(evento.data_hora_inicio)){
            res.status(400).send('O evento ainda não pode receber apostas!');
            return;
        }

        // Valida se o evento ainda pode receber apostas
        if(new Date() > new Date(evento.data_hora_fim)){
            res.status(400).send('O evento não pode mais receber apostas!');
            return;
        }

        //-------------------------------------------------------------------------

        const Insertaposta: Aposta = {
            idEvento: idEvento,
            idUsuario: idUsuario,
            qtd_cotas: qtd_cotas,
            aposta: aposta,
        }

        // Executa a função 'REALIZAR_APOSTA' do Banco de Dados que:
        // 1. Debita o saldo do usuário pelo valor da aposta
        // 2. Aumenta a quantidade de apostas no evento
        // 3. Registra a aposta na tabela APOSTAS
        // 4. Insere a transação financeira para registrar a aposta
        await betModelData.betOnEvent(Insertaposta);

        // Response e statusCode de sucesso
        res.status(200).send('Aposta realizada com sucesso!');
    }

    // Rota para finalizar eventos
    export const finishEvent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const idEvento: number = parseInt(req.params.idEvento); //ID do evento passado como parâmetro na URL
        const idModerador: number = parseInt(req.params.id); //ID do usuario passado como parâmetro na URL

        const veredito = req.get('veredito');

        // Valida se todos os campos foram preenchidos
        if (!idModerador || !idEvento || !veredito) {
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida se o usuario digitou valores aceitos
        if (veredito !== 'sim' && veredito !== 'nao') {
            res.status(400).send('Valor inválido para aposta! Deve ser "sim" ou "nao"!');
            return;
        }

        // Valida se o evento existe
        const evento: Evento | null = await eventModelData.findEvento(idEvento);
        if (!evento) {
            res.status(404).send('Evento não encontrado!');
            return;
        }

        // Valida se o Evento já ocorreu
        const eventoOcorreu: boolean = timeUtils.dataPassou(evento.data_evento);
        if (!eventoOcorreu) {
            res.status(400).send('O evento não pode ser finalizado porque não ocorreu!');
            return;
        }

        // Valida se o evento pode ser finalizado
        if (evento.status_evento !== 'aprovado' && evento.resultado !== 'pendente') {
            res.status(400).send('O evento não pode ser finalizado no estado atual!');
            return;
        }

        //-------------------------------------------------------------------------

        // Executa a função 'FINALIZAR_EVENTO' do Banco de Dados que:
        // 1. Atualiza o status e o resultado do evento
        // 2. Reembolsa todos os apostadores se não houver vencedores ou perdedores
        // OU
        // 2. Distribui os ganhos proporcionalmente entre os vencedores
        await betModelData.finishEvento(idEvento, veredito);

        // Response e statusCode de sucesso
        res.status(200).send('Evento finalizado e ganhos/reembolso distribuídos com sucesso!');
    }
}