export namespace timeUtils {
    //Função para validar o formato da data YYYY-MM-DD
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

    // Função para validar a data e hora no formato YYYY-MM-DDTHH:mm:ss
    export function validarDataHora(dataHora: string): boolean {
        // Valida o formato básico da data e hora
        const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
        if (!regex.test(dataHora)) {
            return false;
        }

        // Divide a data e a hora
        const [data, hora] = dataHora.split('T');

        // Valida a parte da data reutilizando a função validarDataReal
        if (!validarDataReal(data)) {
            return false;
        }

        // Valida a parte da hora
        const [horas, minutos, segundos] = hora.split(':').map(Number);
        if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59 || segundos < 0 || segundos > 59) {
            return false;
        }

        return true; // A data e a hora são válidas
    }

    //Função para verificar se uma data ja passou
    export function dataPassou(data: string): boolean {
        const hoje = new Date();
        return new Date(data) < hoje;
    }
}