// Tipo UserAccount
export type Conta = {
    id?: number;
    nome?: string;
    email: string;
    senha?: string;
    nascimento?: string;
    token?: string;
    moderador?: number;
};