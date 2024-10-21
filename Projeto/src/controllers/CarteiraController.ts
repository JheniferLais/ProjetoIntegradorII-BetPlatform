import {Request, RequestHandler, Response} from 'express';
import {Carteira} from "../models/CarteiraModel";
import {dataBaseUtils} from "../utils/DataBaseUtils";
import {TransacaoFinanceira} from "../models/TransacaoFinanceiraModel";

export namespace carteiraHandler {

    // Função para a validação do formato do cartão de crédito
    export function validarCartao(numeroCartao: string, validade: string, cvv: string): boolean {
        return numeroCartao.length === 16 && validade.length === 5 && cvv.length === 3;
    }

    //Função para calcular o valor do saque apos o imposto
    export function calcularTaxaDeSaque(valor: number): number {
        let taxa: number;

        if (valor <= 100) {
            taxa = 0.04;  // 4%
        } else if (valor >= 101 && valor <= 1000) {
            taxa = 0.03;  // 3%
        } else if (valor >= 1001 && valor <= 5000) {
            taxa = 0.02;  // 2%
        } else if (valor >= 5001 && valor <= 101000) {
            taxa = 0.01;  // 1%
        } else {
            taxa = 0;  // Isento de taxa
        }
        const desconto: number =  valor * taxa;
        return valor - desconto;
    }

    // 'Função' para adicionar fundos na carteira
    export const addFunds: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const idUsuario = parseInt(req.params.id); //ID do usuario passado como parâmetro na URL

        const valor = parseFloat(req.get('valor') || '');
        const numeroCartao = req.get('numeroCartao');
        const validade = req.get('validade');
        const cvv = req.get('cvv');

        // Verifica se os dados estão completos
        if (!valor || !numeroCartao || !validade || !cvv || !idUsuario) {
            res.status(400).json({ erro: 'Dados incompletos'})
            return;
        }

        // Valida o cartão de crédito
        const cartaoValido = validarCartao(numeroCartao, validade, cvv);
        if (!cartaoValido) {
           res.status(400).json({ erro: 'Cartão inválido!' });
            return;
        }

        const carteira: Carteira | null = await dataBaseUtils.findCarteira(idUsuario);
        if(!carteira) {
            res.status(404).send('Carteira não encontrada!');
            return;
        }

        carteira.saldo = valor;

        await dataBaseUtils.addFunds(carteira);

        //Cria uma transacao para ser usada de historico de transacoes
        const transacao: TransacaoFinanceira = {
            idUsuario: idUsuario,
            tipoTransacao: 'deposito',
            valorTransacao: valor,
        }
        await dataBaseUtils.insertTransacao(transacao);

        res.status(200).send('Saldo adicionado com sucesso.');
    }

    // 'Função' para sacar fundos da carteira
    export const withdrawFunds: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const idUsuario = parseInt(req.params.id); //ID do usuario passado como parâmetro na URL

        const valor = parseFloat(req.get('valor') || '');
        const contaCorrente = req.get('conta');

        // Verifica se os dados estão completos
        if (!valor && valor > 0 || !contaCorrente) {
           res.status(400).json({ erro: 'Dados incompletos!' });
            return;
        }

        const carteira: Carteira | null = await dataBaseUtils.findCarteira(idUsuario);
        if(!carteira) {
            res.status(404).send('Carteira não encontrada!');
            return;
        }

        // Verifica se o usuário tem saldo suficiente
        if (valor > carteira.saldo) {
            res.status(400).json({ erro: 'Saldo insuficiente!' });
            return;
        }

        carteira.saldo = calcularTaxaDeSaque(valor);

        //Retira da conta o saldo do saque
        await dataBaseUtils.withdrawFunds(carteira);

        //Cria uma transacao para ser usada de historico de transacoes
        const transacao: TransacaoFinanceira = {
            idUsuario: idUsuario,
            tipoTransacao: 'saque',
            valorTransacao: valor,
        }
        await dataBaseUtils.insertTransacao(transacao);

        res.status(200).json('Saldo sacado com sucesso!');
    }
}