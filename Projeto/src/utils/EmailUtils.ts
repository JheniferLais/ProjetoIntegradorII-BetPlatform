import nodemailer = require("nodemailer");

require('dotenv').config();

export namespace emailUtils {

    // Envia um email informando ao usuario que o evento foi reprovado
    export const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USERNAME, // Use variáveis de ambiente
            pass: process.env.EMAIL_PASSWORD, // Use variáveis de ambiente
        },
    });

    // Função para gerar as opções do e-mail
    export function mailOptions(emailUser: string, nomeUser: string, titulo: string, nomeMod: string) {
        return {
            from: process.env.EMAIL_USERNAME,
            to: emailUser,
            subject: `Notificação de Evento Reprovado – "${titulo}"`,
            text: `
            Olá ${nomeUser},
            
            Agradecemos por enviar o evento "${titulo}" para a nossa plataforma! 
            Realizamos uma análise cuidadosa do conteúdo e, no momento, não conseguimos aprovar o evento para publicação.
            
            Motivo da Reprovação: Após revisão, observamos que o evento apresenta um ou mais dos seguintes problemas:
            - Texto confuso ou com informações incompletas
            - Conteúdo considerado inapropriado
            - Não cumprimento da nossa política de privacidade
            - E/ou dos termos de uso da plataforma
                    
            Agradecemos novamente pela sua contribuição e esperamos colaborar para o sucesso do seu próximo evento!
            
            Atenciosamente,
            ${nomeMod}
            Equipe Wager
            sistemawager@gmail.com`,
        };
    }
}