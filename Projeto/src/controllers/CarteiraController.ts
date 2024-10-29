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

        // Valida se os dados estão completos
        if (!idUsuario || !valor || !numeroCartao || !validade || !cvv) {
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida o cartão de crédito
        const cartaoValido = validarCartao(numeroCartao, validade, cvv);
        if (!cartaoValido) {
           res.status(400).json('Informações do cartão incompletas. Verifique os campos e tente novamente!');
           return;
        }

        // Valida se a carteira do usuario existe
        const carteira: Carteira | null = await dataBaseUtils.findCarteira(idUsuario);
        if(!carteira) {
            res.status(404).send('Carteira não encontrada!');
            return;
        }

        //-------------------------------------------------------------------------

        // Altera o saldo
        carteira.saldo = valor;

        // Executa a adição do saldo na carteira
        await dataBaseUtils.addFunds(carteira);

        //Cria uma transacao para ser usada de historico de transacoes
        const transacao: TransacaoFinanceira = {
            idUsuario: idUsuario,
            tipoTransacao: 'deposito',
            valorTransacao: valor,
        }
        await dataBaseUtils.insertTransacao(transacao);

        // Response e statusCode de sucesso
        res.status(200).send('Saldo adicionado com sucesso!');
    }

    // 'Função' para sacar fundos da carteira
    export const withdrawFunds: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const idUsuario = parseInt(req.params.id); //ID do usuario passado como parâmetro na URL

        const valor = parseFloat(req.get('valor') || '');
        const contaCorrente = req.get('contaCorrente');

        // Valida se todos os campos foram preenchidos
        if(!idUsuario || !valor || !contaCorrente){
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida se o valor do saque é maior que 0
        if (valor > 0) {
           res.status(400).json('A quantia para saque deve ser maior que zero!');
           return;
        }

        // Valida o formato da conta
        if(contaCorrente.length > 12 || contaCorrente.length < 6) {
            res.status(400).json('Conta inválida!');
            return;
        }

        // Valida se a carteira do usuario existe
        const carteira: Carteira | null = await dataBaseUtils.findCarteira(idUsuario);
        if(!carteira) {
            res.status(404).send('Carteira não encontrada!');
            return;
        }

        // Valida se o usuário tem saldo suficiente
        if (valor > carteira.saldo) {
            res.status(400).json('Saldo insuficiente para realizar o saque!');
            return;
        }

        //-------------------------------------------------------------------------

        // Altera o valor do saldo de acordo com o juros a pagar
        carteira.saldo = calcularTaxaDeSaque(valor);

        // Retira da conta o saldo do saque
        await dataBaseUtils.retirarFundos(carteira);

        // Cria uma transacao para ser usada de historico de transacoes
        const transacao: TransacaoFinanceira = {
            idUsuario: idUsuario,
            tipoTransacao: 'saque',
            valorTransacao: carteira.saldo,
        }
        await dataBaseUtils.insertTransacao(transacao);

        // Response e statusCode de sucesso
        res.status(200).json('Saldo sacado com sucesso!');
    }
}