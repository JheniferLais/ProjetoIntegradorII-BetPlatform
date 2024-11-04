import { Conta } from '../models/UserModel';
import { Evento } from "../models/EventModel";
import oracledb from "oracledb";
import { Carteira } from "../models/WalletModel";
import { TransacaoFinanceira } from "../models/FinancialTransactionModel";
import { Aposta } from "../models/BetModel";

export namespace dataBaseUtils {

    //Função para conectar no banco de dados
    export async function ConnectionDB() {
        return oracledb.getConnection({user: "SYSTEM", password: "123456", connectString: "localhost:1521/xe"});
    }

    //------------------------------------------------------------------------------------------------------------------

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

    //Função para inserir Usuarios no banco de dados e automaticamente criar sua carteira
    export async function insertUser(conta: Conta): Promise<void> {
        const connection = await ConnectionDB();
        await connection.execute(`INSERT INTO usuarios (id_usuario, nome, email, senha, data_nascimento, token) VALUES 
            (SEQ_USUARIOS.NEXTVAL, :nomeCompleto, :email, :senha, :nascimento, dbms_random.string('x',32))`,
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

    //------------------------------------------------------------------------------------------------------------------

    //Função para inserir Eventos no banco de dados
    export async function insertEvento(evento: Evento): Promise<void> {
        const connection = await ConnectionDB();
        await connection.execute(
            "INSERT INTO eventos (id_evento, id_usuario, titulo, descricao, valor_cota, data_hora_inicio, data_hora_fim, data_evento, qtd_apostas, resultado, status_evento) VALUES (SEQ_EVENTOS.NEXTVAL, :ID_USUARIO, :TITULO, :DESCRICAO, :VALOR_COTA, :DATA_HORA_INICIO, :DATA_HORA_FIM, :DATA_EVENTO, :QTD_APOSTAS, :RESULTADO, :STATUS_EVENTO)",
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
            const row = result.rows[0] as any[];

            const evento: Evento = {
                ID_EVENTO: row[0] as number,
                ID_USUARIO: row[1] as number,
                TITULO: row[2] as string,
                DESCRICAO: row[3] as string,
                VALOR_COTA: row[4] as number,
                DATA_HORA_INICIO: row[5] as string,
                DATA_HORA_FIM: row[6] as string,
                DATA_EVENTO: row[7] as string,
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

    //Função para alterar o status do evento
    export async function updateEvento(evento: Evento): Promise<void> {
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

    //Função para alterar o status do evento
    export async function updateEventoReprovado(evento: Evento): Promise<void> {
        const connection = await ConnectionDB();
        await connection.execute("UPDATE eventos SET status_evento = :STATUS_EVENTO, resultado = :RESULTADO WHERE id_evento = :ID_EVENTO",
            {
                ID_EVENTO: evento.ID_EVENTO,
                RESULTADO: evento.RESULTADO,
                STATUS_EVENTO: evento.STATUS_EVENTO,
            }
        );
        await connection.commit();
        await connection.close();
    }

    //Função para encontrar eventos de acordo com o titulo
    export async function searchEvent(palavraChave: string): Promise<Evento | null> {
        const connection = await ConnectionDB();
        const result = await connection.execute("SELECT * FROM eventos WHERE LOWER(titulo) LIKE :palavraChave or LOWER(descricao) LIKE :palavraChave",
            [`%${palavraChave.toLowerCase()}%`, `%${palavraChave.toLowerCase()}%`]);

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) {
            const row = result.rows as any[];

            const evento: Evento = {
                ID_EVENTO: row[0] as number,
                ID_USUARIO: row[1] as number,
                TITULO: row[2] as string,
                DESCRICAO: row[3] as string,
                VALOR_COTA: row[4] as number,
                DATA_HORA_INICIO: row[5] as string,
                DATA_HORA_FIM: row[6] as string,
                DATA_EVENTO: row[7] as string,
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

    //------------------------------------------------------------------------------------------------------------------

    //Função para encontrar a carteira do usuario
    export async function findCarteira(idUsuario: number): Promise<Carteira | null> {
        const connection = await ConnectionDB();
        const result = await connection.execute("SELECT * FROM usuarios WHERE id_usuario = :idUsuario", [idUsuario]);

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) {
            const row = result.rows[0] as any[];

            const carteira: Carteira = {
                idUsuario: row[0] as number,
                saldo: row[7] as number,
            };
            await connection.close();
            return carteira;
        }
        await connection.close();
        return null;
    }

    //Função para adicionar fundos na carteira
    export async function addFunds(carteira: Carteira): Promise<void> {
        const connection = await ConnectionDB();
        await connection.execute("UPDATE usuarios SET saldo = saldo + :saldo WHERE id_usuario = :idUsuario",
            {
                idUsuario: carteira.idUsuario,
                saldo: carteira.saldo,
            }
        );
        await connection.commit();
        await connection.close();
    }

    //Função para sacar fundos na carteira
    export async function retirarFundos(carteira: Carteira): Promise<void> {
        const connection = await ConnectionDB();
        await connection.execute("UPDATE usuarios SET saldo = saldo - :saldo WHERE id_usuario = :idUsuario",
            {
                idUsuario: carteira.idUsuario,
                saldo: carteira.saldo,
            }
        );
        await connection.commit();
        await connection.close();
    }

    //Função para inserir transacoes realizadas
    export async function insertTransacao(transacao: TransacaoFinanceira): Promise<void> {
        const connection = await ConnectionDB();
        await connection.execute("INSERT INTO transacoes_financeiras (id_transacao, id_usuario, tipo_transacao, valor) VALUES (SEQ_TRANSACOES_FINANCEIRAS.NEXTVAL, :idUsuario, :tipoTransacao, :valorTransacao)",
            {
                idUsuario: transacao.idUsuario,
                tipoTransacao: transacao.tipoTransacao,
                valorTransacao: transacao.valorTransacao,
            }
        );
        await connection.commit();
        await connection.close();
    }

    //------------------------------------------------------------------------------------------------------------------

    //Função para inserir a aposta no banco de dados
    export async function betOnEvent(aposta: Aposta): Promise<void> {
        const connection = await ConnectionDB();
        await connection.execute(`INSERT INTO apostas (id_aposta, id_evento, id_usuario, qtd_cotas, aposta) VALUES 
            (SEQ_APOSTAS.NEXTVAL, :idEvento, :idUsuario, :qtd_cotas, :aposta)`,
            {
                idEvento: aposta.idEvento,
                idUsuario: aposta.idUsuario,
                qtd_cotas: aposta.qtd_cotas,
                aposta: aposta.aposta,
            }
        );
        await connection.commit();
        await connection.close();
    }

    //Função para dar um update na quantidade de apostas do evento
    export async function updateEventoAposta(evento: Evento): Promise<void> {
        const connection = await ConnectionDB();
        await connection.execute("UPDATE eventos SET qtd_apostas = qtd_apostas + :QTD_APOSTAS WHERE id_evento = :ID_EVENTO",
            {
                QTD_APOSTAS: evento.QTD_APOSTAS,
                ID_EVENTO: evento.ID_EVENTO,
            }
        );
        await connection.commit();
        await connection.close();
    }

    //
    export async function validaUserAposta(email: string, id: number): Promise<true | null> {
        const connection = await ConnectionDB();
        const result = await connection.execute("SELECT * FROM usuarios WHERE email = :email AND id_usuario = :id", [email, id]);
        await connection.close();

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) return true;
        return null;  // Retorna null se não encontrar nenhum evento
    }


    export async function finishEvento(idEvento: number, veredito: string): Promise<void> {
        const connection = await ConnectionDB();
        await connection.execute("UPDATE eventos SET resultado = :veredito, status_evento = 'finalizado' WHERE id_evento = :idEvento", [veredito, idEvento]);
        await connection.commit();
        await connection.close();
    }

    //
    export async function getApostasFiltered(idEvento: number, veredito: string): Promise<Aposta[][] | null> {
        const connection = await ConnectionDB();
        const result: any = await connection.execute("SELECT * FROM APOSTAS WHERE id_evento = :id_evento AND aposta = :veredito", [idEvento, veredito]);
        await connection.close();
        return result.rows as Aposta[][];
    }

    //
    export async function getApostas(idEvento: number): Promise<Aposta[][] | null> {
        const connection = await ConnectionDB();
        const result: any = await connection.execute("SELECT * FROM APOSTAS WHERE id_evento = :id_evento", [idEvento]);
        await connection.close();
        return result.rows as Aposta[][];
    }

    //Função para retornar todos as apostas com o veredito fornecido(SIM/NAO)
    export async function somaApostasVeredito( idEvento: number, veredito: string): Promise<number[][] | null> {
        const connection = await ConnectionDB();
        const soma: any = await connection.execute("SELECT SUM(qtd_cotas) FROM APOSTAS WHERE id_evento = :idEvento AND aposta = :veredito", [idEvento, veredito]);
        await connection.close();
        return soma.rows as number[][];
    }
}