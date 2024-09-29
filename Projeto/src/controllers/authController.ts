import { Request, Response } from 'express';
import { contas, Usuario } from '../models/userModel';
import { verificaIdade } from '../utils/dateUtils';

// Função para signup
export const signUp = (req: Request, res: Response) => {
    const id = contas.length;
    const nome = req.get('nome');
    const email = req.get('email');
    const senha = req.get('senha');
    const nascimento = req.get('nascimento');

    if (!(nome && email && senha && nascimento)) {
        res.send(`PREENCHA TODOS OS CAMPOS!!!`);
    } else {
        const idade: number = verificaIdade(nascimento);

        if (idade < 18) {
            res.send(`O USUÁRIO DEVE SER MAIOR DE IDADE!!!`);
        } else {
            const novaConta: Usuario = {
                id: id,
                nome: nome,
                email: email,
                senha: senha,
                nascimento: nascimento,
            };

            contas.push(novaConta);

            const response = {
                status: 'success',
                id: `${contas.length}`,
                nome: `${nome}`,
                email: `${email}`,
                senha: `${senha}`,
                nascimento: `${nascimento}`,
                idade: `${idade}`,
            };

            res.send(response);
        }
    }
};

// Função para login
export const login = (req: Request, res: Response) => {
    const email = req.get('email');
    const senha = req.get('senha');

    if (email && senha) {
        const user = contas.find(u => u.email === email && u.senha === senha);
        if (user) {
            const response = {
                status: 'success!!! login efetuado',
                msg: `Bem-vindo!!! ${user.nome}`,
            };
            res.send(response);
        } else {
            res.send(`Login ou senha inválidos!!!`);
        }
    } else {
        res.send(`PREENCHA TODOS OS CAMPOS!!!`);
    }
};
