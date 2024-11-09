import oracledb from "oracledb";

require('dotenv').config();

export namespace dataBaseutils {

    //Função para conectar no banco de dados
    export async function ConnectionDB() {
        try {
            const connection = await oracledb.getConnection({
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                connectString: process.env.DATABASE_STRING,
            });
            console.log('Sucesso na conexão com o Banco de Dados!');
            return connection;
        } catch (error) {
            console.error('Erro ao conectar no banco de dados:', error);
            throw error;
        }
    }
}