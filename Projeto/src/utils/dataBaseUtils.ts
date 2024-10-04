// Insere no Banco e retorna um id
export function salvarNoBanco(tipo: any, array: any) : number{
    array.push(tipo);
    return array.length;
}