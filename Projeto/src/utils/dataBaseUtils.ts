import { Conta } from '../models/usuarioModel';
import oracledb from "oracledb";

export namespace dataBaseUtils {

    //Função para conectar no banco de dados
    export async function ConnectionDB() {
        return oracledb.getConnection({user: "SYSTEM", password: "123456", connectString: "localhost:1521/xe"});
    }

    //Função para encontrar o usuario no banco de dados
    export async function findUser(email: string, password: string): Promise<Conta[][]> {
        const connection = await ConnectionDB();
        const result = await connection.execute("SELECT * FROM usuarios WHERE email = :email AND senha = :password", [email, password]);
        await connection.close();
        return result.rows as Conta[][];
    }

    //Função para encontrar o email no banco de dados
    export async function findEmail(email: string) {
        const connection = await ConnectionDB();
        const result = await connection.execute("SELECT * FROM usuarios WHERE email = :email", [email]);
        await connection.close();
        return result.rows;
    }

    //Função para inserir no banco de dados
    export async function insertUser(conta: Conta): Promise<void> {
        const connection = await ConnectionDB();
        await connection.execute("INSERT INTO usuarios (nome, email, senha, data_nascimento) VALUES (:nomeCompleto, :email, :senha, :nascimento)",
            {
                nomeCompleto: conta.nome,
                email: conta.email,
                senha: conta.senha,
                nascimento: conta.nascimento
            }
        );
        await connection.commit();
        await connection.close();
    }
}