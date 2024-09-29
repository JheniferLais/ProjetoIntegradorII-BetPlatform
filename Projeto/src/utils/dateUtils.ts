export function verificaIdade(nascimento: string): number {
    const nascimentoData = new Date(nascimento);
    const hojeData = new Date();
    let idade = hojeData.getFullYear() - nascimentoData.getFullYear();

    // Verifica se o usuário já fez aniversário este ano
    if (hojeData.getMonth() < nascimentoData.getMonth() ||
        (hojeData.getMonth() === nascimentoData.getMonth() && hojeData.getDate() < nascimentoData.getDate())) {
        idade--;
    }

    return idade;
}
