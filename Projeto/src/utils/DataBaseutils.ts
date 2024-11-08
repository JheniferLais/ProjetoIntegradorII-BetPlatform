import oracledb from "oracledb";

export namespace dataBaseutils {

    //Função para conectar no banco de dados
    export async function ConnectionDB() {
        return oracledb.getConnection({user: "SYSTEM", password: "123456", connectString: "localhost:1521/xe"});
    }
}