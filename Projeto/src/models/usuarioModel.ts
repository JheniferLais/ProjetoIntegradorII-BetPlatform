// Tipo UserAccount
export type Conta = {
    idUsuario: number;
    nome: string;
    email: string;
    senha: string;
    nascimento: string;
};
// Banco de dados temporário
export let BDcontas: Conta[] = [];