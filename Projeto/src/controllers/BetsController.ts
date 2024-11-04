import { Request, RequestHandler, Response } from 'express';
import { TransacaoFinanceira } from '../models/FinancialTransactionModel';
import { dataBaseUtils } from '../utils/DatabaseUtils'
import { Carteira } from "../models/WalletModel";
import { Evento } from "../models/EventModel";
import { Aposta } from "../models/BetModel";
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
        const user: true | null = await dataBaseUtils.validaUserAposta(email, idUsuario);
        if (!user) {
            res.status(403).send('O email fornecido não pertence a sua conta!');
            return;
        }

        // Valida se o usuario digitou valores aceitos
        if (aposta !== 'sim' && aposta !== 'nao') {
            res.status(400).send('Valor inválido para aposta! Deve ser "sim" ou "nao"!');
            return;
        }

        // Valida se a carteira do usuario existe
        const carteira: Carteira | null = await dataBaseUtils.findCarteira(idUsuario);
        if (!carteira) {
            res.status(404).send('Carteira não encontrada!');
            return;
        }

        // Valida se o evento existe
        const evento: Evento | null = await dataBaseUtils.findEvento(idEvento);
        if (!evento) {
            res.status(404).send('Evento não encontrado!');
            return;
        }

        // Calcula o total a ser descontado do usuario
        const valorAposta: number = evento.VALOR_COTA * qtd_cotas

        // Valida se o usuário tem saldo suficiente
        if (carteira.saldo < valorAposta) {
            res.status(400).json('Saldo insuficiente para realizar a aposta!');
            return;
        }

        // Valida se o evento pode receber apostas
        if (evento.STATUS_EVENTO !== 'aprovado' || evento.RESULTADO !== 'pendente') {
            res.status(400).send('Não é possivel apostar nesse evento!');
            return;
        }

        // Valida se o evento já pode receber apostas
        if(new Date() < new Date(evento.DATA_HORA_INICIO)){
            res.status(400).send('O evento ainda não pode receber apostas!');
            return;
        }

        // Valida se o evento ainda pode receber apostas
        if(new Date() > new Date(evento.DATA_HORA_FIM)){
            res.status(400).send('O evento não pode mais receber apostas!');
            return;
        }

        //-------------------------------------------------------------------------

        // Retira da conta o saldo da aposta
        carteira.saldo = valorAposta;
        await dataBaseUtils.retirarFundos(carteira);

        // Aumenta a quantidade de aposta no evento
        evento.QTD_APOSTAS = 1;
        await dataBaseUtils.updateEventoAposta(evento);

        // Insere no Banco de dados
        const apostaDoUsuario: Aposta = {
            idEvento: idEvento,
            idUsuario: idUsuario,
            qtd_cotas: qtd_cotas,
            aposta: aposta,
        }
        await dataBaseUtils.betOnEvent(apostaDoUsuario);

        // Insere no banco essa transação
        const transacao: TransacaoFinanceira = {
            idUsuario: idUsuario,
            tipoTransacao: 'aposta',
            valorTransacao: valorAposta,
        }
        await dataBaseUtils.insertTransacao(transacao);

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
        const evento: Evento | null = await dataBaseUtils.findEvento(idEvento);
        if (!evento) {
            res.status(404).send('Evento não encontrado!');
            return;
        }

        // Valida se o Evento já ocorreu
        const eventoOcorreu: boolean = timeUtils.dataPassou(evento.DATA_EVENTO);
        if (!eventoOcorreu) {
            res.status(400).send('O evento não pode ser finalizado porque não ocorreu!');
            return;
        }

        // Valida se o evento pode ser finalizado
        if (evento.STATUS_EVENTO !== 'aprovado' && evento.RESULTADO !== 'pendente') {
            res.status(400).send('O evento não pode ser finalizado no estado atual!');
            return;
        }

        //-------------------------------------------------------------------------

        // Finaliza o evento alterando status e o veredito
        await dataBaseUtils.finishEvento(idEvento, veredito)

        // Cria uma variavel para ser a aposta perdedora
        let vereditoPerdedora: string = veredito === 'sim' ? 'nao' : 'sim';

        // Busca todas as apostas vencedoras do evento
        const apostasVencedoras: Aposta[][] | null = await dataBaseUtils.getApostasFiltered(idEvento, veredito);
        const apostasPerdedoras: Aposta[][] | null = await dataBaseUtils.getApostasFiltered(idEvento, vereditoPerdedora);

        // Busca a soma do veredito(vencedoras) e das apostas perdedoras
        const somaVencedora: number[][] | null = await dataBaseUtils.somaApostasVeredito(idEvento, veredito);
        const somaPerdedora: number[][] | null = await dataBaseUtils.somaApostasVeredito(idEvento, vereditoPerdedora);

        // Reembolsa usuários se não houver BET(usuários perdedores) ou vencedores.
        if (((!apostasVencedoras || !apostasVencedoras.length) || (!apostasPerdedoras || !apostasPerdedoras.length)) || (somaPerdedora === null || somaVencedora === null)) {
            //Busca todas as apostas  do evento
            const apostas: Aposta[][] | null = await dataBaseUtils.getApostas(idEvento);
            if (!apostas) {
                res.status(400).send('Sem apostas no evento!');
                return;
            }

            //Devolve o dinheiro apostado por todos os jogadores
            for (const aposta of apostas) {
                if (typeof aposta[3] === 'number' && typeof aposta[2] === 'number') {

                    //Calcula o quanto foi apostado pelo usuario
                    const valorApostado: number = aposta[3] * evento.VALOR_COTA

                    //Adiciona os ganhos na carteira do usuário
                    const carteira: Carteira | null = await dataBaseUtils.findCarteira(aposta[2]);
                    if (!carteira) {
                        res.status(404).send('Carteira não encontrada!');
                        return;
                    }
                    carteira.saldo = valorApostado;
                    await dataBaseUtils.addFunds(carteira);

                    //Cria uma transação para o histórico de transações
                    const transacao: TransacaoFinanceira = {
                        idUsuario: aposta[2],
                        tipoTransacao: 'ganho_aposta',
                        valorTransacao: valorApostado,
                    }
                    await dataBaseUtils.insertTransacao(transacao);
                }
            }
            res.status(400).send('Evento sem bet ou sem vencedores, evento cancelado!');
            return;
        }

        // Realiza a distribuição proporcional dos ganhos entre os vencedores
        for (const aposta of apostasVencedoras) {
            if (typeof aposta[2] === 'number' && typeof aposta[3] === 'number') {

                //Calcula o valor ganho pelo usuario
                const valorGanho: number = (aposta[3] / somaVencedora[0][0]) * ((somaVencedora[0][0] + somaPerdedora[0][0]) * evento.VALOR_COTA);

                //Adiciona os ganhos na carteira do usuário
                const carteira: Carteira | null = await dataBaseUtils.findCarteira(aposta[2]);
                if (!carteira) {
                    res.status(404).send('Carteira não encontrada!');
                    return;
                }
                carteira.saldo = valorGanho;
                await dataBaseUtils.addFunds(carteira);

                //Cria uma transação para o histórico de transações
                const transacao: TransacaoFinanceira = {
                    idUsuario: aposta[2],
                    tipoTransacao: 'ganho_aposta',
                    valorTransacao: valorGanho,
                }
                await dataBaseUtils.insertTransacao(transacao);
            }
        }

        // Response e statusCode de sucesso
        res.status(200).send('Evento finalizado e ganhos distribuídos com sucesso!');
    }
}