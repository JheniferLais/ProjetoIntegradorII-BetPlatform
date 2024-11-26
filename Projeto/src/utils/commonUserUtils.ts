import { NextFunction, Request, Response } from 'express';
import { Conta } from '../models/UserModel';
import { dataBaseutils } from './connectionDatabaseUtils';

export namespace commonUserUtils {

    // Função para encontrar o moderador baseado no id
    export async function findCommonUser(idCommonUser: number): Promise<Conta[][]> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute("SELECT * FROM usuarios WHERE id_usuario = :idModerador and moderador = 0", [idCommonUser]);
        await connection.close();
        return result.rows as Conta[][];
    }

    // Função para verificar se o usuario é comum
    export const checkCommonUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const idUsuario = parseInt(req.params.id); // ID do usuario passado como parâmetro na URL

        // Valida se todos os campos foram preenchidos
        if(!idUsuario) {
            res.status(400).send('Campos obrigatórios estão faltando!');
            return;
        }

        // Valida se o usuario é moderador
        const commonUser: Conta[][] = await findCommonUser(idUsuario);
        if (!commonUser || commonUser.length === 0) {
            res.status(403).send('Acesso negado. Você não tem permissão para acessar esta rota.');
            return;
        }

        next();
    }
}