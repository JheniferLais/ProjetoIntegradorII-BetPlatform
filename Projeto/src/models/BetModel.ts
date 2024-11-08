import { dataBaseutils } from "../utils/DataBaseutils";
import { Evento } from "./EventModel";


// Tipo apostas
export type Aposta = {
    idAposta?: number;
    idEvento: number;
    idUsuario: number;
    qtd_cotas: number;
    aposta: string; //sim ou nao
    dataAposta?: string;
}


export namespace betModelData {

    //Função para inserir a aposta no banco de dados
    export async function betOnEvent(aposta: Aposta): Promise<void> {
        const connection = await dataBaseutils.ConnectionDB();
        await connection.execute(`INSERT INTO apostas (id_aposta, id_evento, id_usuario, qtd_cotas, aposta)
                                  VALUES (SEQ_APOSTAS.NEXTVAL, :idEvento, :idUsuario, :qtd_cotas, :aposta)`,
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
        const connection = await dataBaseutils.ConnectionDB();
        await connection.execute("UPDATE eventos SET qtd_apostas = qtd_apostas + :QTD_APOSTAS WHERE id_evento = :ID_EVENTO",
            {
                QTD_APOSTAS: evento.qtd_apostas,
                ID_EVENTO: evento.id_evento,
            }
        );
        await connection.commit();
        await connection.close();
    }

    //Função para validar se o email é o mesmo do id
    export async function validaUserAposta(email: string, id: number): Promise<true | null> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute("SELECT * FROM usuarios WHERE email = :email AND id_usuario = :id", [email, id]);
        await connection.close();

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) return true;
        return null;  // Retorna null se não encontrar nenhum evento
    }

    //Função para finalizar evento
    export async function finishEvento(idEvento: number, veredito: string): Promise<void> {
        const connection = await dataBaseutils.ConnectionDB();
        await connection.execute("UPDATE eventos SET resultado = :veredito, status_evento = 'finalizado' WHERE id_evento = :idEvento", [veredito, idEvento]);
        await connection.commit();
        await connection.close();
    }

    //Função para retornar os eventos com base no id
    export async function getApostasFiltered(idEvento: number, veredito: string): Promise<Aposta[][] | null> {
        const connection = await dataBaseutils.ConnectionDB();
        const result: any = await connection.execute("SELECT * FROM APOSTAS WHERE id_evento = :id_evento AND aposta = :veredito", [idEvento, veredito]);
        await connection.close();
        return result.rows as Aposta[][];
    }

    //Função para retornar as apostas com base no id do evento
    export async function getApostas(idEvento: number): Promise<Aposta[][] | null> {
        const connection = await dataBaseutils.ConnectionDB();
        const result: any = await connection.execute("SELECT * FROM APOSTAS WHERE id_evento = :id_evento", [idEvento]);
        await connection.close();
        return result.rows as Aposta[][];
    }

    //Função para retornar todos as apostas com o veredito fornecido(SIM/NAO)
    export async function somaApostasVeredito(idEvento: number, veredito: string): Promise<number[][] | null> {
        const connection = await dataBaseutils.ConnectionDB();
        const soma: any = await connection.execute("SELECT SUM(qtd_cotas) FROM APOSTAS WHERE id_evento = :idEvento AND aposta = :veredito", [idEvento, veredito]);
        await connection.close();

        if (soma.rows && soma.rows.length > 0) return soma.rows as number[][];
        return null;  // Retorna null se não encontrar nenhum evento
    }
}