import { Request, RequestHandler, Response } from 'express';
import { Conta } from '../models/UsuarioModel';
import { timeUtils } from '../utils/TimeUtils';
import { dataBaseUtils } from '../utils/DataBaseUtils'

export namespace contasHandler {

    // Função para validar o formato do email
    function validarEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Função para verificar se o usuario fez aniversario
    function verificaIdade(nascimento: string): number {
        const nascimentoData = new Date(nascimento);
        const hojeData = new Date();
        let idade: number = hojeData.getFullYear() - nascimentoData.getFullYear();

        // Verifica se o usuário já fez aniversário este ano
        if (hojeData.getMonth() < nascimentoData.getMonth() ||
            (hojeData.getMonth() === nascimentoData.getMonth() && hojeData.getDate() < nascimentoData.getDate())) {
            idade--;
        }

        return idade;
    }

    // 'Função' para signUp
    export const signUpHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const nome = req.get('nome');
        const email = req.get('email');
        const senha = req.get('senha');
        const nascimento = req.get('nascimento');

        // Verifica se todos os campos foram preenchidos
        if (!nome || !email || !senha || !nascimento) {
            res.statusCode = 400;
            res.send(`Preencha todos os campos!`);
            return;
        }

        // Valida  o formato do email
        const validEmail = validarEmail(email);
        if (!validEmail) {
            res.statusCode = 400;
            res.send(`Formato de email invalido!`);
            return;
        }

        // Verifica se o email já foi cadastrado
        const infoEmail = await dataBaseUtils.findEmail(email);
        if (infoEmail && infoEmail.length > 0) {
            res.statusCode = 400;
            res.send(`Usuário já cadastrado!`);
            return;
        }

        // Valida o formato da data
        const data = timeUtils.validarDataReal(nascimento);
        if(!data){
            //res.statusCode = ?
            res.send(`Formato de data invalida!`);
            return;
        }

        // Verifica a maioridade do usuario
        const idade: number = verificaIdade(nascimento);
        if (idade < 18) {
            //res.statusCode = ?;
            res.send(`O usuario deve ser maior de idade!`);
            return;
        }

        // Cria uma 'novaConta' do tipo 'Conta' com as informações recebidas
        const novaConta: Conta = {
            nome: nome,
            email: email,
            senha: senha,
            nascimento: nascimento,
        };

        // Insere no Banco de dados
        await dataBaseUtils.insertUser(novaConta);

        res.statusCode = 200;
        res.send('usuario inserido!')
    };

    // 'Função' para login
    export const loginHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const email = req.get('email');
        const senha = req.get('senha');

        // Verifica se todos os campos foram preenchidos
        if (!email || !senha) {
            res.statusCode = 400;
            res.send(`Preencha todos os campos!`);
            return;
        }

        // Verifica se o usuario esta cadastrado
        const user: Conta[][] = await dataBaseUtils.findUser(email, senha);
        if (!user || user.length === 0) {
            res.statusCode = 401;
            res.send(`Login ou senha inválidos!`);
            return;
        }

        const response = {
            status: `login efetuado com sucesso!`,
            message: `Seja bem vindo(a)! ${user[0][1]}`,
            token: user[0][5]
        };
        res.statusCode = 200;
        res.send(response);
    };
}