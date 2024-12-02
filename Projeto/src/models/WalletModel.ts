import { dataBaseutils } from "../utils/connectionDatabaseUtils";
import { Aposta } from "./BetModel";


// Tipo Carteira
export type Carteira = {
    idUsuario: number;
    saldo: number;
}

// Tipo transação financeira
export type TransacaoFinanceira = {
    idTransacao?: number;
    idUsuario?: number;
    tipoTransacao: string;
    valorTransacao: number;
    dataTransacao?: string;
}


export namespace walletModelData {

    //Função para encontrar a carteira do usuario
    export async function findCarteira(idUsuario: number): Promise<Carteira | null> {
        const connection = await dataBaseutils.ConnectionDB();
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
        const connection = await dataBaseutils.ConnectionDB();
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
        const connection = await dataBaseutils.ConnectionDB();
        await connection.execute("UPDATE usuarios SET saldo = saldo - :saldo WHERE id_usuario = :idUsuario",
            {
                idUsuario: carteira.idUsuario,
                saldo: carteira.saldo,
            }
        );
        await connection.commit();
        await connection.close();
    }

    //Função para inserir transações realizadas
    export async function insertTransacao(transacao: TransacaoFinanceira): Promise<void> {
        const connection = await dataBaseutils.ConnectionDB();
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

    //Função para retornar todas as Transações do usuario
    export async function getAllTransactions(idUsuario: number): Promise<TransacaoFinanceira[] | null> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute("SELECT * FROM TRANSACOES_FINANCEIRAS WHERE id_usuario = :idUsuario", [idUsuario]);

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) {
            const rows = result.rows as any[][];
            const transacoes = rows.map(row => ({
                idTransacao: row[0] as number,
                idUsuario: row[1] as number,
                tipoTransacao: row[2] as string,
                valorTransacao: row[3] as number,
                dataTransacao: row[4] as string,
            }));
            await connection.close();
            return transacoes; // Retorna um array de objetos de transações
        }
        await connection.close();
        return null;  // Retorna null se não encontrar nenhum evento
    }

    //Função para retornar todas as apostas do usuario
    export async function getAllBets(idUsuario: number): Promise<Aposta[] | []> {
        const connection = await dataBaseutils.ConnectionDB();
        const result = await connection.execute("SELECT * FROM APOSTAS WHERE id_usuario = :idUsuario", [idUsuario]);

        // Verifica se há algum resultado
        if (result.rows && result.rows.length > 0) {
            const rows = result.rows as any[][];
            const apostas = rows.map(row => ({
                idAposta: row[0] as number,
                idEvento: row[1] as number,
                idUsuario: row[2] as number,
                qtd_cotas: row[3] as number,
                aposta: row[4] as string,
                dataAposta: row[5] as string,
            }));
            await connection.close();
            return apostas; // Retorna um array de objetos de transações
        }
        await connection.close();
        return [];  // Retorna array vazio se não encontrar nenhuma transação
    }
}