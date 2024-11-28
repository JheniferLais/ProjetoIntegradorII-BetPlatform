import { dataBaseutils } from "../utils/connectionDatabaseUtils";


// Tipo UserAccount
export type Conta = {
    id?: number;
    nome: string;
    email: string;
    senha?: string;
    nascimento?: string;
    token?: string;
    moderador?: number;
    saldo?: number;
};


export namespace userModelData {

    //Função para encontrar o usuario no banco de dados
    export async function findUser(email: string, password: string): Promise<Conta | null> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute(`SELECT * FROM usuarios WHERE email = :email AND senha = :password`, [email, password]);

        if(result.rows && result.rows.length > 0) {
            const row = result.rows[0] as any;

            const conta: Conta = {
                id: row[0] as number,
                nome: row[1] as string,
                email: row[2] as string,
                senha: row[3] as string,
                nascimento: row[4] as string,
                token: row[5] as string,
                moderador: row[6] as number,
                saldo: row[7] as number
            };
            await connection.close();
            return conta;
        }
        await connection.close();
        return null;
    }

    //Função para validar o email no banco de dados
    export async function findEmail(email: string) {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute("SELECT * FROM usuarios WHERE email = :email", [email]);
        await connection.close();
        return result.rows;
    }

    //Função para inserir Usuarios no banco de dados
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