export type Usuario = {
    id: number;
    nome: string;
    email: string;
    senha: string;
    nascimento: string;
};

export let contas: Usuario[] = [];  // Banco de dados temporário

// Exemplo de conta para testar
export const teste: Usuario = {
    id: 1,
    nome: 'jhenifer',
    email: 'jhenifer@jhenifer.com',
    senha: 'jhenifer321',
    nascimento: '2004-02-21',
};

contas.push(teste);  // Adicionando um usuário inicial