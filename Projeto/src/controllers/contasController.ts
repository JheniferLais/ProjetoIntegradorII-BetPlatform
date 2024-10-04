import { Request, RequestHandler, Response } from 'express';
import { BDcontas, Conta } from '../models/usuarioModel';
import { salvarNoBanco } from "../utils/dataBaseUtils";
//
export namespace contasHandler {

    // Função para verificar se o usuario fez aniversario
    export function verificaIdade(nascimento: string): number {
        const nascimentoData = new Date(nascimento);
        const hojeData = new Date();
        let idade: number = hojeData.getFullYear() - nascimentoData.getFullYear();
        //
        // Verifica se o usuário já fez aniversário este ano
        if (hojeData.getMonth() < nascimentoData.getMonth() ||
            (hojeData.getMonth() === nascimentoData.getMonth() && hojeData.getDate() < nascimentoData.getDate())) {
            idade--;
        }
        //
        return idade;
    }

    // 'Função' para signUp
    export const signUpHandler: RequestHandler = (req: Request, res: Response): void => {
        const nome= req.get('nome');
        const email= req.get('email');
        const senha = req.get('senha');
        const nascimento = req.get('nascimento');

        // Verifica se todos os campos foram preenchidos
        if (nome && email && senha && nascimento) {
            if (!BDcontas.find(u => u.email === email)) {
                // Verifica a maioridade do usuario
                const idade: number = verificaIdade(nascimento);

                if (idade >= 18) {

                    // Cria uma 'novaConta' do tipo 'userAccount' com as informações recebidas
                    const novaConta: Conta = {
                        idUsuario: BDcontas.length,
                        nome: nome,
                        email: email,
                        senha: senha,
                        nascimento: nascimento,
                    };

                    // Insere no Banco e retorna um id
                    const id: number = salvarNoBanco(novaConta, BDcontas);

                    const response = {
                        id: `${id}`,
                        nome: `${nome}`,
                        email: `${email}`,
                        nascimento: `${nascimento}`,
                    };
                    res.statusCode = 200;
                    res.send(response);
                } else {
                    //res.statusCode = ?;
                    res.send(`O usuario deve ser maior de idade!`);
                }
            } else {
                //res.statusCode = ?;
                res.send(`Usuario já cadastrado!`);
            }
        } else {
            res.statusCode = 400;
            res.send(`Preencha todos os campos!`);
        }
    };

    // 'Função' para login
    export const loginHandler: RequestHandler = (req: Request, res: Response): void => {
        const email = req.get('email');
        const senha = req.get('senha');

        // Verifica se todos os campos foram preenchidos
        if (email && senha) {

            // Verifica se o usuario esta no array 'accounts' ou seja cadastrado
            const user = BDcontas.find(u => u.email === email && u.senha === senha);

            if (user) {
                const response = {
                    status: `login efetuado com sucesso!`,
                    message: `Bem-vindo! ${user.nome}`,
                };
                res.statusCode = 200;
                res.send(response);
            } else {
                //res.statusCode = ?;
                res.send(`Login ou senha inválidos!`);
            }
        } else {
            res.statusCode = 400;
            res.send(`Preencha todos os campos!`);
        }
    };
}