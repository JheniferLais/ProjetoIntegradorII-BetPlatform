import { Request, RequestHandler, Response } from 'express';
import { walletModelData } from "../models/WalletModel";
import { Carteira } from "../models/WalletModel";
import { TransacaoFinanceira } from "../models/WalletModel";
import {eventModelData} from "../models/EventModel";



export namespace carteiraHandler {

    // Função para a validação do formato do cartão de crédito
    function validarCartao(numeroCartao: string, validade: string, cvv: string): boolean {
        return numeroCartao.length === 19 && validade.length === 5 && cvv.length === 3;
    }

    // Função para a validação da chave pix
    function validarChavePix(chave: string): boolean {
        const regexCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;
        const regexCNPJ = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/;
        const regexEmail = /^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/;
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

    function validarAgenciaConta(agencia: string, conta: string): boolean {
        const regexAgencia = /^\d{4}$/; // Valida que a agência tem exatamente 4 dígitos
        const regexConta = /^\d{6,12}$/; // Valida que a conta tem de 6 a 12 dígitos

        return regexAgencia.test(agencia) && regexConta.test(conta);
    }

    //Função para calcular o valor do saque apos o imposto
    function calcularTaxaDeSaque(valor: number): number {
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
        const carteira: Carteira | null = await walletModelData.findCarteira(idUsuario);
        if(!carteira) {
            res.status(404).send('Carteira não encontrada!');
            return;
        }

        //-------------------------------------------------------------------------

        // Altera o saldo
        carteira.saldo = valor;

        // Executa a adição do saldo na carteira
        await walletModelData.addFunds(carteira);

        //Cria uma transacao para ser usada de historico de transacoes
        const transacao: TransacaoFinanceira = {
            idUsuario: idUsuario,
            tipoTransacao: 'deposito',
            valorTransacao: valor,
        }
        await walletModelData.insertTransacao(transacao);

        // Response e statusCode de sucesso
        res.status(200).send('Saldo adicionado com sucesso!');
    }

    // 'Função' para sacar fundos da carteira
    export const withdrawFunds: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const idUsuario = parseInt(req.params.id); //ID do usuario passado como parâmetro na URL

        const valor = parseFloat(req.get('valor') || '');

        const pix = req.get('pix');
        const agencia = req.get('agencia');
        const conta = req.get('conta');

        // Valida se todos os campos foram preenchidos
        if(!idUsuario || !valor){
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        if(pix){
            const chaveValida: boolean = validarChavePix(pix);
            if(!chaveValida) {
                res.status(400).send('Informação da Chave pix inválidas. Verifique os campos e tente novamente!');
                return;
            }
        } else if (agencia && conta){
            if(!validarAgenciaConta(agencia, conta)) {
                res.status(400).send('Informação de agencia e conta inválidas. Verifique os campos e tente novamente!');
                return;
            }
        } else{
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida se o valor do saque é maior que 0
        if (valor <= 0) {
           res.status(400).send('A quantia para saque deve ser maior que zero!');
           return;
        }

        // Valida se a carteira do usuario existe
        const carteira: Carteira | null = await walletModelData.findCarteira(idUsuario);
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
        await walletModelData.retirarFundos(carteira);

        // Cria uma transacao para ser usada de historico de transacoes
        const transacao: TransacaoFinanceira = {
            idUsuario: idUsuario,
            tipoTransacao: 'saque',
            valorTransacao: valor,
        }
        await walletModelData.insertTransacao(transacao);

        // Response e statusCode de sucesso
        res.status(200).send(`Saldo sacado com sucesso! Saque: ${valor}, Depósito: ${valorDescontado}.`);
    }

    // 'Função' para mostrar todas as informações financeiras do usuario
    export const getAllWalletInformation: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const idUsuario = parseInt(req.params.id); //ID do usuario passado como parâmetro na URL

        const carteira = await walletModelData.findCarteira(idUsuario);
        if(!carteira) {
            res.status(404).send('Carteira não existe!');
            return;
        }

        const transacoes: TransacaoFinanceira[] | null = await walletModelData.getAllTransactions(idUsuario);

        // 'apostas' recebe todo o historico de apostas do usuario porém o usuario pode nao ter
        // historico de apostas por isso o [] assim o response sempre recebe alguma informação
        // para ser mostrada no frontend...
        const apostas = await walletModelData.getAllBets(idUsuario);

        for (const aposta of apostas) {
            const evento = await eventModelData.findEvento(aposta.idEvento);
            if(!evento) return
            // Calcula o valor gasto nessa aposta
            // baseado em valor da cota do evento * quantidade de cotas compradas pelo usuario
            aposta.valorGasto = (evento.valor_cota) * aposta.qtd_cotas;
        }

        const response = {
            saldo: carteira.saldo,
            transactions: transacoes,
            bets: apostas
        }

        // Response e statusCode de sucesso
        res.status(200).json(response);
    }
}