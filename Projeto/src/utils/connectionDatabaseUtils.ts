import oracledb from "oracledb";

import dotenv from 'dotenv';

dotenv.config();

export namespace dataBaseutils {

    //Função para conectar no banco de dados
    export async function ConnectionDB() {
        try {
            return await oracledb.getConnection({
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                connectString: process.env.DATABASE_STRING,
            });
        } catch (error) {
            console.error('Erro ao conectar no banco de dados:', error);
            throw error;
        }
    }
}