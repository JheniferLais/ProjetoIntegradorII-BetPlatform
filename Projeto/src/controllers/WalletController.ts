import {Request, RequestHandler, Response} from 'express';
import {Carteira} from "../models/WalletModel";
import {dataBaseUtils} from "../utils/DatabaseUtils";
import {TransacaoFinanceira} from "../models/FinancialTransactionModel";

export namespace carteiraHandler {

    // Função para a validação do formato do cartão de crédito
    export function validarCartao(numeroCartao: string, validade: string, cvv: string): boolean {
        return numeroCartao.length === 16 && validade.length === 5 && cvv.length === 3;
    }

    // Função para a validação da chave pix
    function validarChavePix(chave: string): boolean {
        const regexCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;
        const regexCNPJ = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/;
        const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        const regexTelefone = /^\+55\d{11}$|^\d{11}$/;
        const regexAleatoria = /^[a-zA-Z0-9]{32,36}$/;

        return (
            regexCPF.test(chave) ||
            regexCNPJ.test(chave) ||
            regexEmail.test(chave) ||
            regexTelefone.test(chave) ||
            regexAleatoria.test(chave)
        );
    }

    //Função para calcular o valor do saque apos o imposto
    export function calcularTaxaDeSaque(valor: number): number {
        let taxa: number;

        if (valor <= 100) {
            taxa = 0.04;  // 4%
        } else if (valor <= 1000) {
            taxa = 0.03;  // 3%
        } else if (valor <= 5000) {
            taxa = 0.02;  // 2%
        } else if (valor <= 101000) {
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
        const cartaoValido: boolean = validarCartao(numeroCartao, validade, cvv);
        if (!cartaoValido) {
           res.status(400).send('Informações do cartão inválidas. Verifique os campos e tente novamente!');
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
        const pix = req.get('pix');

        // Valida se todos os campos foram preenchidos
        if(!idUsuario || !valor || !pix){
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida se o valor do saque é maior que 0
        if (valor <= 0) {
           res.status(400).send('A quantia para saque deve ser maior que zero!');
           return;
        }

        const chaveValida: boolean = validarChavePix(pix);
        if(!chaveValida) {
            res.status(400).send('Informação da Chave pix inválidas. Verifique os campos e tente novamente!');
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
            res.status(400).send('Saldo insuficiente para realizar o saque!');
            return;
        }

        //-------------------------------------------------------------------------

        // Cria o valor que o usuario vai receber na 'Conta Corrente' após o desconto
        const valorDescontado: number = calcularTaxaDeSaque(valor);

        // Altera o valor do saldo do usuario
        carteira.saldo = valor;

        // Retira da conta o valor do saque
        await dataBaseUtils.retirarFundos(carteira);

        // Cria uma transacao para ser usada de historico de transacoes
        const transacao: TransacaoFinanceira = {
            idUsuario: idUsuario,
            tipoTransacao: 'saque',
            valorTransacao: valorDescontado,
        }
        await dataBaseUtils.insertTransacao(transacao);

        // Response
        const response = {
            status: 'Saldo sacado com sucesso!',
            saque: `Valor retirado da conta: ${valor}`,
            deposito: `Valor depositado após a taxa: ${valorDescontado}`
        };

        // Response e statusCode de sucesso
        res.status(200).send(response);
    }
}