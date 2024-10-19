import { Conta } from '../models/usuarioModel';
import { Evento } from "../models/eventoModel";
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

    //Função para inserir Usuarios no banco de dados
    export async function insertUser(conta: Conta): Promise<void> {
        const connection = await ConnectionDB();
        await connection.execute("INSERT INTO usuarios (nome, email, senha, data_nascimento, token) VALUES (:nomeCompleto, :email, :senha, :nascimento, dbms_random.string('x',32))",
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

    //Função para inserir Eventos no banco de dados
    export async function insertEvento(evento: Evento) {
        const connection = await ConnectionDB();
        await connection.execute(
            "INSERT INTO eventos (id_usuario, titulo, descricao, valor_cota, data_hora_inicio, data_hora_fim, data_evento, qtd_apostas, resultado, status_evento) VALUES (:ID_USUARIO, :TITULO, :DESCRICAO, :VALOR_COTA, :DATA_HORA_INICIO, :DATA_HORA_FIM, :DATA_EVENTO, :QTD_APOSTAS, :RESULTADO, :STATUS_EVENTO)",
            {
                ID_USUARIO: evento.ID_USUARIO,
                TITULO: evento.TITULO,
                DESCRICAO: evento.DESCRICAO,
                VALOR_COTA: evento.VALOR_COTA,
                DATA_HORA_INICIO: evento.DATA_HORA_INICIO,
                DATA_HORA_FIM: evento.DATA_HORA_FIM,
                DATA_EVENTO: evento.DATA_EVENTO,
                QTD_APOSTAS: evento.QTD_APOSTAS,
                RESULTADO: evento.RESULTADO,
                STATUS_EVENTO: evento.STATUS_EVENTO,
            }
        );
        await connection.commit();
        await connection.close();
    }

    //Função para retornar todos os eventos baseado no status fornecido
    export async function getFilteredEvents(statusEvento: string): Promise<Evento[][]> {
        const connection = await ConnectionDB();
        const result = await connection.execute("SELECT * FROM eventos WHERE status_evento = :statusEvento", [statusEvento]);
        await connection.close();
        return result.rows as Evento[][];
    }

    //Função para encontrar o evento baseado no id
    export async function findEvento(idEvento: number): Promise<Evento | null> {
        const connection = await ConnectionDB();
        const result = await connection.execute(
            "SELECT * FROM eventos WHERE id_evento = :idEvento",
            [idEvento]
        );

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) {
            const row = result.rows[0] as any[]; // Aqui estamos forçando o TypeScript a entender que 'row' é um array de valores (array de qualquer tipo)

            // Mapeia a linha para um objeto Evento
            const evento: Evento = {
                ID_EVENTO: row[0] as number,  // Asserção de tipo para garantir que seja do tipo correto
                ID_USUARIO: row[1] as number,
                TITULO: row[2] as string,
                DESCRICAO: row[3] as string,
                VALOR_COTA: row[4] as number,
                DATA_HORA_INICIO: row[5] as Date,
                DATA_HORA_FIM: row[6] as Date,
                DATA_EVENTO: row[7] as Date,
                QTD_APOSTAS: row[8] as number,
                RESULTADO: row[9] as string,
                STATUS_EVENTO: row[10] as string
            };

            await connection.close();
            return evento;
        }
        await connection.close();
        return null;  // Retorna null se não encontrar nenhum evento
    }

    //Função para alterar o evento para excluido
    export async function updateEvento(evento: Evento) {
        const connection = await ConnectionDB();
        await connection.execute("UPDATE eventos SET status_evento = :STATUS_EVENTO WHERE id_evento = :ID_EVENTO",
            {
                ID_EVENTO: evento.ID_EVENTO,
                STATUS_EVENTO: evento.STATUS_EVENTO,
            }
        );
        await connection.commit();
        await connection.close();
    }
}