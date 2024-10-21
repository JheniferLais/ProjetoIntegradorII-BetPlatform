export namespace timeUtils {
    // Função para validar o formato da data
    export function validarDataReal(data: string): boolean {
        //Valida o formato basico
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(data)) {
            return false;
        }
        //Valida o mes e ano
        const [ano, mes, dia] = data.split('-').map(Number);
        if (mes < 1 || mes > 12) {
            return false;
        }
        //Valida o dia baseado no mes
        const diasPorMes = [31, (ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return !(dia < 1 || dia > diasPorMes[mes - 1]); //return false ou true
    }
}