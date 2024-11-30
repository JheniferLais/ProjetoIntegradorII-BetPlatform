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
        let email = req.get('email');
        const senha = req.get('senha');
        const nascimento = req.get('nascimento');

        // Valida se todos os campos foram preenchidos
        if (!nome || !email || !senha || !nascimento) {
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        email = email.toLowerCase();

        // Valida o formato do e-mail
        const validEmail = validarEmail(email);
        if (!validEmail) {
            res.status(400).send('Formato de email inválido!');
            return;
        }

        // Valida se o e-mail já foi cadastrado
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
        res.status(201).send('Usuário cadastrado com sucesso!')
    };

    // 'Função' para login
    export const signInHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        let email = req.get('email');
        const senha = req.get('senha');

        // Valida se todos os campos foram preenchidos
        if (!email || !senha) {
            res.status(400).json('Campos obrigatórios estão faltando!');
            return;
        }

        email = email.toLowerCase();

        // Valida se o usuario esta cadastrado
        const user: Conta | null = await userModelData.findUser(email, senha);
        if (!user) {
            res.status(401).json('Login ou senha inválidos!');
            return;
        }

        //-------------------------------------------------------------------------

        // Response
        const response = {
            response: 'Login efetuado com sucesso!',
            idUsuario: user.id,
            nomeUsuario: user.nome,
            email: user.email,
            token: user.token,
            moderador: user.moderador,
        };

        // Response e statusCode de sucesso
        res.status(200).json(response);
    };
}