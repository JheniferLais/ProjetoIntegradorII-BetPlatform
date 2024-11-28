import { dataBaseutils } from "../utils/connectionDatabaseUtils";


// Tipo evento
export type Evento = {
    id_evento?: number;
    id_usuario?: number;
    titulo: string;
    descricao: string;
    valor_cota: number;
    data_hora_inicio: string;
    data_hora_fim: string;
    data_evento: string;
    qtd_apostas: number;
    resultado: string;
    status_evento: string;
    categoria?: string;
}


export namespace eventModelData {

    //Função para inserir Eventos no banco de dados
    export async function insertEvento(evento: Evento): Promise<void> {
        const connection = await dataBaseutils.ConnectionDB();
        await connection.execute(`INSERT INTO eventos (id_evento, id_usuario, titulo, descricao, valor_cota, data_hora_inicio, data_hora_fim, data_evento, qtd_apostas, resultado, status_evento, categoria) 
                                    VALUES (SEQ_EVENTOS.NEXTVAL, :ID_USUARIO, :TITULO, :DESCRICAO, :VALOR_COTA, :DATA_HORA_INICIO, :DATA_HORA_FIM, :DATA_EVENTO, :QTD_APOSTAS, :RESULTADO, :STATUS_EVENTO, :CATEGORIA)`,
            {
                ID_USUARIO: evento.id_usuario,
                TITULO: evento.titulo,
                DESCRICAO: evento.descricao,
                VALOR_COTA: evento.valor_cota,
                DATA_HORA_INICIO: evento.data_hora_inicio,
                DATA_HORA_FIM: evento.data_hora_fim,
                DATA_EVENTO: evento.data_evento,
                QTD_APOSTAS: evento.qtd_apostas,
                RESULTADO: evento.resultado,
                STATUS_EVENTO: evento.status_evento,
                CATEGORIA: evento.categoria,
            }
        );
        await connection.commit();
        await connection.close();
    }

    //Função para retornar todos os eventos baseado no status fornecido
    export async function getFilteredEvents(statusEvento: string): Promise<Evento[] | null> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute("SELECT * FROM eventos WHERE status_evento = :statusEvento", [statusEvento]);

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) {
            const rows = result.rows as any[][];
            const eventos = rows.map(row => ({
                id_evento: row[0] as number,
                id_usuario: row[1] as number,
                titulo: row[2] as string,
                descricao: row[3] as string,
                valor_cota: row[4] as number,
                data_hora_inicio: row[5] as string,
                data_hora_fim: row[6] as string,
                data_evento: row[7] as string,
                qtd_apostas: row[8] as number,
                resultado: row[9] as string,
                status_evento: row[10] as string,
                categoria: row[11] as string
            }));
            await connection.close();
            return eventos; // Retorna um array de objetos de eventos
        }
        await connection.close();
        return null;  // Retorna null se não encontrar nenhum evento
    }

    //Função para retornar todos os eventos baseado no status fornecido e data
    export async function getFilteredEventsDate(statusEvento: string, hoje: string): Promise<Evento[] | null> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute(`SELECT * 
            FROM eventos 
            WHERE status_evento = :statusEvento
            AND TO_DATE(DATA_HORA_FIM, 'YYYY-MM-DD"T"HH24:MI:SS') <= TO_DATE(:hoje, 'YYYY-MM-DD"T"HH24:MI:SS')`, [statusEvento, hoje]);

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) {
            const rows = result.rows as any[][];
            const eventos = rows.map(row => ({
                id_evento: row[0] as number,
                id_usuario: row[1] as number,
                titulo: row[2] as string,
                descricao: row[3] as string,
                valor_cota: row[4] as number,
                data_hora_inicio: row[5] as string,
                data_hora_fim: row[6] as string,
                data_evento: row[7] as string,
                qtd_apostas: row[8] as number,
                resultado: row[9] as string,
                status_evento: row[10] as string,
                categoria: row[11] as string
            }));
            await connection.close();
            return eventos; // Retorna um array de objetos de eventos
        }
        await connection.close();
        return null;  // Retorna null se não encontrar nenhum evento
    }

    //Função para encontrar o evento baseado no id
    export async function findEvento(idEvento: number): Promise<Evento | null> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute(
            "SELECT * FROM eventos WHERE id_evento = :idEvento",
            [idEvento]
        );

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) {
            const row = result.rows[0] as any[];

            const evento: Evento = {
                id_evento: row[0] as number,
                id_usuario: row[1] as number,
                titulo: row[2] as string,
                descricao: row[3] as string,
                valor_cota: row[4] as number,
                data_hora_inicio: row[5] as string,
                data_hora_fim: row[6] as string,
                data_evento: row[7] as string,
                qtd_apostas: row[8] as number,
                resultado: row[9] as string,
                status_evento: row[10] as string,
                categoria: row[11] as string,
            };

            await connection.close();
            return evento;
        }
        await connection.close();
        return null;  // Retorna null se não encontrar nenhum evento
    }

    //Função para alterar o status do evento
    export async function updateEventoStatus(evento: Evento): Promise<void> {
        const connection = await dataBaseutils.ConnectionDB();
        await connection.execute("UPDATE eventos SET status_evento = :STATUS_EVENTO WHERE id_evento = :ID_EVENTO",
            {
                ID_EVENTO: evento.id_evento,
                STATUS_EVENTO: evento.status_evento,
            }
        );
        await connection.commit();
        await connection.close();
    }

    //Função para alterar o status do evento e o resultado
    export async function updateEventoStatusResultado(evento: Evento): Promise<void> {
        const connection = await dataBaseutils.ConnectionDB();
        await connection.execute("UPDATE eventos SET status_evento = :STATUS_EVENTO, resultado = :RESULTADO WHERE id_evento = :ID_EVENTO",
            {
                ID_EVENTO: evento.id_evento,
                RESULTADO: evento.resultado,
                STATUS_EVENTO: evento.status_evento,
            }
        );
        await connection.commit();
        await connection.close();
    }

    //Função para encontrar eventos de acordo com o titulo
    export async function searchEvent(palavraChave: string): Promise<Evento[] | null> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute(`
            SELECT * FROM eventos
            WHERE status_evento = 'aprovado'
            AND resultado = 'pendente'
            AND (LOWER(titulo) LIKE :palavraChave
            OR LOWER(descricao) LIKE :palavraChave)`,
            [`%${palavraChave.toLowerCase()}%`, `%${palavraChave.toLowerCase()}%`]);

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) {
            const rows = result.rows as any[][];
            const eventos = rows.map(row => ({
                id_evento: row[0] as number,
                id_usuario: row[1] as number,
                titulo: row[2] as string,
                descricao: row[3] as string,
                valor_cota: row[4] as number,
                data_hora_inicio: row[5] as string,
                data_hora_fim: row[6] as string,
                data_evento: row[7] as string,
                qtd_apostas: row[8] as number,
                resultado: row[9] as string,
                status_evento: row[10] as string,
                categoria: row[11] as string
            }));
            await connection.close();
            return eventos; // Retorna um array de objetos de eventos
        }
        await connection.close();
        return null;  // Retorna null se não encontrar nenhum evento
    }

    //Função para encontrar no maximo os 6 eventos mais apostados
    export async function getMostBetEvents(): Promise<Evento[] | null> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute(`
            SELECT * FROM eventos
            WHERE status_evento = 'aprovado'
            AND resultado = 'pendente'
            AND qtd_apostas > 0
            ORDER BY qtd_apostas DESC FETCH FIRST 6 ROWS ONLY`);

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) {
            const rows = result.rows as any[][];
            const eventos = rows.map(row => ({
                id_evento: row[0] as number,
                id_usuario: row[1] as number,
                titulo: row[2] as string,
                descricao: row[3] as string,
                valor_cota: row[4] as number,
                data_hora_inicio: row[5] as string,
                data_hora_fim: row[6] as string,
                data_evento: row[7] as string,
                qtd_apostas: row[8] as number,
                resultado: row[9] as string,
                status_evento: row[10] as string,
                categoria: row[11] as string
            }));
            await connection.close();
            return eventos; // Retorna um array de objetos de eventos
        }
        await connection.close();
        return null;  // Retorna null se não encontrar nenhum evento
    }

    //Função para encontrar no maximo os 6 eventos mais apostados
    export async function getCategory(categoria: string): Promise<Evento[] | null> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute(`
            SELECT * FROM eventos
            WHERE status_evento = 'aprovado'
            AND resultado = 'pendente'
            AND CATEGORIA = :categoria`,
            [categoria]);

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) {
            const rows = result.rows as any[][];
            const eventos = rows.map(row => ({
                id_evento: row[0] as number,
                id_usuario: row[1] as number,
                titulo: row[2] as string,
                descricao: row[3] as string,
                valor_cota: row[4] as number,
                data_hora_inicio: row[5] as string,
                data_hora_fim: row[6] as string,
                data_evento: row[7] as string,
                qtd_apostas: row[8] as number,
                resultado: row[9] as string,
                status_evento: row[10] as string,
                categoria: row[11] as string
            }));
            await connection.close();
            return eventos; // Retorna um array de objetos de eventos
        }
        await connection.close();
        return null;  // Retorna null se não encontrar nenhum evento
    }

    //Função para encontrar os eventos que vencerão na semana
    export async function getUpcomingEvents(hoje: string, semanaProx: string): Promise<Evento[] | null> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute(`
            SELECT * FROM eventos
            WHERE status_evento = 'aprovado'
            AND resultado = 'pendente'
            AND TO_DATE(DATA_HORA_FIM, 'YYYY-MM-DD"T"HH24:MI:SS')
            BETWEEN TO_DATE(:hoje, 'YYYY-MM-DD"T"HH24:MI:SS')
            AND TO_DATE(:semanaProx, 'YYYY-MM-DD"T"HH24:MI:SS')`,
            [hoje, semanaProx]
        );

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) {
            const rows = result.rows as any[][];
            const eventos = rows.map(row => ({
                id_evento: row[0] as number,
                id_usuario: row[1] as number,
                titulo: row[2] as string,
                descricao: row[3] as string,
                valor_cota: row[4] as number,
                data_hora_inicio: row[5] as string,
                data_hora_fim: row[6] as string,
                data_evento: row[7] as string,
                qtd_apostas: row[8] as number,
                resultado: row[9] as string,
                status_evento: row[10] as string,
                categoria: row[11] as string
            }));
            await connection.close();
            return eventos; // Retorna um array de objetos de eventos
        }
        await connection.close();
        return null;  // Retorna null se não encontrar nenhum evento
    }

    //Função para buscar todos os eventos do usuario
    export async function getAllEventsUser(idUsuario: number): Promise<Evento[] | null> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute(`
            SELECT * FROM eventos
            WHERE ID_USUARIO = :idUsuario`,
            [idUsuario]
        );

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) {
            const rows = result.rows as any[][];
            const eventos = rows.map(row => ({
                id_evento: row[0] as number,
                id_usuario: row[1] as number,
                titulo: row[2] as string,
                descricao: row[3] as string,
                valor_cota: row[4] as number,
                data_hora_inicio: row[5] as string,
                data_hora_fim: row[6] as string,
                data_evento: row[7] as string,
                qtd_apostas: row[8] as number,
                resultado: row[9] as string,
                status_evento: row[10] as string,
                categoria: row[11] as string
            }));
            await connection.close();
            return eventos; // Retorna um array de objetos de eventos
        }
        await connection.close();
        return null;  // Retorna null se não encontrar nenhum evento
    }
}