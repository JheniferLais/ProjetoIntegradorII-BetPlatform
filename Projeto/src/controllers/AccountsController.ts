import { Request, RequestHandler, Response } from 'express';
import { userModelData } from "../models/UserModel";
import { Conta } from "../models/UserModel";
import { timeUtils } from '../utils/TimeUtils';



export namespace contasHandler {

    // Função para validar o formato do email
    function validarEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Função para validar se o usuario fez aniversario
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

        // Valida se todos os campos foram preenchidos
        if (!nome || !email || !senha || !nascimento) {
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida  o formato do email
        const validEmail = validarEmail(email);
        if (!validEmail) {
            res.status(400).send('Formato de email inválido!');
            return;
        }

        // Valida se o email já foi cadastrado
        const infoEmail = await userModelData.findEmail(email);
        if (infoEmail && infoEmail.length > 0) {
            res.status(409).send('O e-mail informado já está cadastrado! Tente usar outro e-mail.');
            return;
        }

        // Valida o formato da data
        const data = timeUtils.validarDataReal(nascimento);
        if(!data){
            res.status(400).send('Formato de data inválido!');
            return;
        }

        // Valida a maioridade do usuario
        const idade: number = verificaIdade(nascimento);
        if (idade < 18) {
            res.status(403).send('Cadastro restrito para maiores de 18 anos!');
            return;
        }

        //-------------------------------------------------------------------------

        // Cria uma 'novaConta' do tipo 'Conta' com as informações recebidas
        const novaConta: Conta = {
            nome: nome,
            email: email,
            senha: senha,
            nascimento: nascimento,
        };

        // Insere no Banco de dados
        await userModelData.insertUser(novaConta);

        // Response e statusCode de sucesso
        res.status(201).send('usuario inserido com sucesso!')
    };

    // 'Função' para login
    export const signInHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const email = req.get('email');
        const senha = req.get('senha');

        // Valida se todos os campos foram preenchidos
        if (!email || !senha) {
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida se o usuario esta cadastrado
        const user: Conta[][] = await userModelData.findUser(email, senha);
        if (!user || user.length === 0) {
            res.status(401).send('Login ou senha inválidos!');
            return;
        }

        //-------------------------------------------------------------------------

        // Response
        const response = {
            response: 'login efetuado com sucesso!',
            idUsuario: user[0][0],
            nomeUsuario: user[0][1],
            token: user[0][5]
        };

        // Response e statusCode de sucesso
        res.status(200).json(response);
    };
}