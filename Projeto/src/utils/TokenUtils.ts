import { NextFunction, Request, Response } from 'express';
import { Conta } from '../models/UserModel';
import { dataBaseutils } from './DataBaseutils';

export namespace tokenUtils {

    //Função para encontrar o token do usuario baseado no id
    export async function findToken(idUsuario: number, tokenAuth: string): Promise<Conta[][]> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute("SELECT token FROM usuarios WHERE id_usuario = :idUsuario and TOKEN = :tokenAuth", [idUsuario, tokenAuth]);
        await connection.close();
        return result.rows as Conta[][];
    }

    //Função para verificar se o usuario existe baseado no token
    export const checkToken = async (req: Request, res: Response, next: NextFunction): Promise<any>=> {
        const idUsuario = parseInt(req.params.id); // ID do usuario passado como parâmetro na URL
        const tokenAuth= req.get('authorization');

        // Valida se todos os campos foram preenchidos
        if(!idUsuario || !tokenAuth) {
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida o token do usuario
        const token: Conta[][] = await findToken(idUsuario, tokenAuth);
        if (!token || token.length === 0) {
            res.status(403).send('Acesso negado. Token inválido.');
            return;
        }

        next();
    }
}