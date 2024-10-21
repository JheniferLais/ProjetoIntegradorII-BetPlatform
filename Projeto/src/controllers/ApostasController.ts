import { Request, RequestHandler, Response } from 'express';
import { TransacaoFinanceira } from '../models/TransacaoFinanceiraModel';
import { dataBaseUtils } from '../utils/DataBaseUtils'
import { Carteira } from "../models/CarteiraModel";
import { Evento } from "../models/EventoModel";
import { Aposta } from "../models/ApostaModel";

export namespace apostasHandler {
    // Rota para apostar em um evento
    export const betOnEvent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const idEvento = parseInt(req.params.idEvento); //ID do evento passado como parâmetro na URL
        const idUsuario = parseInt(req.params.id); //ID do usuario passado como parâmetro na URL

        const email = req.get('email');
        const valorAposta = parseFloat(req.get('valorAposta') || '');
        const aposta = req.get('aposta');

        if (!idEvento || !idUsuario || !email || !valorAposta || !aposta) {
            res.status(400).send('Preencha todos os campos!');
            return;
        }

        //Verifica se o email digitado e o id do usuario sao do mesmo usuario
        const user: true | null = await dataBaseUtils.validaUserAposta(email, idUsuario);
        if (!user) {
            res.status(404).send('O email fornecido não pertence a sua conta!');
            return;
        }

        //Verifica se o usuario digitou valores aceitos
        if(aposta !== 'sim' && aposta !== 'não' ){
            res.status(400).send('Apenas valores "(sim/não)" sao aceitos como entrada em aposta');
            return;
        }

        // Verificar se o saldo do usuário é suficiente
        const carteira: Carteira | null = await dataBaseUtils.findCarteira(idUsuario);
        if(!carteira) {
            res.status(404).send('Carteira não encontrada!');
            return;
        }

        //Verifica se saldo na carteira do usuario é menor que o valor da aposta
        if (carteira.saldo < valorAposta) {
            res.status(400).send('Saldo insuficiente para realizar a aposta.');
            return;
        }

        //Verifica se o evento existe
        const evento: Evento | null = await dataBaseUtils.findEvento(idEvento);
        if(!evento) {
            res.status(404).send('Evento não encontrado!');
            return;
        }

        //Verifica se o evento pode receber apostas
        if(evento.STATUS_EVENTO !== 'aprovado' || evento.RESULTADO !== 'pendente') {
            res.status(400).send('Não é possivel apostar nesse evento!');
            return;
        }

        //Retira da conta o saldo da aposta
        carteira.saldo = valorAposta;
        await dataBaseUtils.retirarFundos(carteira);

        //Aumenta a quantidade de aposta no evento
        evento.QTD_APOSTAS = 1;
        await dataBaseUtils.updateEventoAposta(evento);

        //Insere no banco a aposta
        const apostaDoUsuario: Aposta = {
            idEvento: idEvento,
            idUsuario: idUsuario,
            valorAposta: valorAposta,
            aposta: aposta,
        }
        await dataBaseUtils.betOnEvent(apostaDoUsuario);

        //Insere no banco essa transação
        const transacao: TransacaoFinanceira = {
            idUsuario: idUsuario,
            tipoTransacao: 'aposta',
            valorTransacao: valorAposta,
        }
        await dataBaseUtils.insertTransacao(transacao);

        res.status(200).send('Aposta realizada com sucesso!');
    }

    // Rota para finalizar eventos
    export const finishEvent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const idEvento = parseInt(req.params.idEvento); //ID do evento passado como parâmetro na URL
        const idUsuario = parseInt(req.params.id); //ID do usuario passado como parâmetro na URL
    }
}