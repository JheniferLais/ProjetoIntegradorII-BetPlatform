import { dataBaseutils } from "../utils/DataBaseutils";


// Tipo UserAccount
export type Conta = {
    id?: number;
    nome: string;
    email: string;
    senha?: string;
    nascimento?: string;
    token?: string;
    moderador?: number;
};


export namespace userModelData {

    //Função para encontrar o usuario no banco de dados
    export async function findUser(email: string, password: string): Promise<Conta[][]> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute("SELECT * FROM usuarios WHERE email = :email AND senha = :password", [email, password]);
        await connection.close();
        return result.rows as Conta[][];
    }

    //Função para validar o email no banco de dados
    export async function findEmail(email: string) {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute("SELECT * FROM usuarios WHERE email = :email", [email]);
        await connection.close();
        return result.rows;
    }

    //Função para inserir Usuarios no banco de dados e automaticamente criar sua carteira
    export async function insertUser(conta: Conta): Promise<void> {
        const connection = await dataBaseutils.ConnectionDB();
        await connection.execute(`INSERT INTO usuarios (id_usuario, nome, email, senha, data_nascimento, token)
                                  VALUES (SEQ_USUARIOS.NEXTVAL, :nomeCompleto, :email, :senha, :nascimento,
                                          dbms_random.string('x', 32))`,
            {
                nomeCompleto: conta.nome,
                email: conta.email,
                senha: conta.senha,
                nascimento: conta.nascimento,
            }
        );
        await connection.commit();
        await connection.close();
    }

    //Função para encontrar o email do usuario
    export async function findIdUserEmail(idUsuario: number): Promise<Conta | null> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute("SELECT * FROM usuarios WHERE id_usuario = :idUsuario", [idUsuario]);

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) {
            const row = result.rows[0] as any[];

            const conta: Conta = {
                nome: row[1] as string,
                email: row[2] as string,
            };
            await connection.close();
            return conta;
        }
        await connection.close();
        return null;
    }
}