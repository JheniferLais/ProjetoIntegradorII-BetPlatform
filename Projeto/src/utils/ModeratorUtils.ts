import { NextFunction, Request, Response } from 'express';
import { Conta } from '../models/UserModel';
import { dataBaseutils } from './DataBaseutils';

export namespace moderadorUtils {

    // Função para encontrar o moderador baseado no id
    export async function findModerador(idModerador: number): Promise<Conta[][]> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute("SELECT * FROM usuarios WHERE id_usuario = :idModerador and moderador = 1", [idModerador]);
        await connection.close();
        return result.rows as Conta[][];
    }

    // Função para verificar se o usuario é moderador
    export const checkModerador = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const idUsuario = parseInt(req.params.id); // ID do usuario passado como parâmetro na URL

        // Valida se todos os campos foram preenchidos
        if(!idUsuario) {
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida se o usuario é moderador
        const moderador: Conta[][] = await findModerador(idUsuario);
        if (!moderador || moderador.length === 0) {
            res.status(403).send('Acesso negado. Você não tem permissão para acessar esta rota.');
            return;
        }

        next();
    }
}