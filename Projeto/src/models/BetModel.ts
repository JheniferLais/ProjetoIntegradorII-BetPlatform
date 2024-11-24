import { dataBaseutils } from "../utils/DataBaseutils";


// Tipo apostas
export type Aposta = {
    idAposta?: number;
    idEvento: number;
    idUsuario: number;
    qtd_cotas: number;
    aposta: string; //sim ou nao
    dataAposta?: string;
    valorGasto?: number; // Nova propriedade
}


export namespace betModelData {

    //Função para realizar a aposta
    export async function betOnEvent(aposta: Aposta){
        const connection = await dataBaseutils.ConnectionDB();
        await connection.execute(`BEGIN
                                    realizar_aposta(:idEvento, :idUsuario, :qtd_cotas, :aposta);
                                  END;`,
        {
            idEvento: aposta.idEvento,
            idUsuario: aposta.idUsuario,
            qtd_cotas: aposta.qtd_cotas,
            aposta: aposta.aposta
        });
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
        await connection.execute(`BEGIN
                                    finalizar_evento(:idEvento, :veredito);
                                  END;`, [idEvento, veredito]);
        await connection.commit();
        await connection.close();
    }
}