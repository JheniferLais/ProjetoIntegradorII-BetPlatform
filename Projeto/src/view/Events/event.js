const apiBaseUrl = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", async () => {

    // Adiciona um efeito de fade-in na página ao carregar...
    document.body.classList.add("fade-in");

    // Redireciona para a página de Cadastro ao clicar em "Sair"...
    document.getElementById('signUpButton').addEventListener('click', openSignUpPage);

    // Redireciona para a página da Carteira ao clicar na seção de saldo...
    document.getElementById('walletLink').addEventListener('click', openWalletPage);

     // Configura o envio do formulário de criação de apostas...
    document.getElementById('formAposta').addEventListener('submit', handleBetFormSubmission);

    // Esconder os feedbacks de sucesso e/ou erro quando o usuário interagir com os campos do formulário..
    const formFields = document.querySelectorAll('#formAposta input');
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            document.querySelector('.feedbackApostado').style.display = 'none';
            document.querySelector('.feedbackNaoApostado').style.display = 'none';
        });
    });
});

// Redireciona o usuario para o signUp.html...
function openSignUpPage(){
    sessionStorage.clear();
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `../Accounts/signUp.html`;
    }, 500);
}


// Redireciona o usuario para o wallet.html...
function openWalletPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `../Wallet/wallet.html`;
    }, 500);
}

function validarLogin(){
    // Captura as informações guardadas na sessionStorage...
    const token = sessionStorage.getItem('sessionToken');
    const idUsuario = sessionStorage.getItem('idUsuario');

    // Caso o usuario nao tenha logado...
    if (!token || !idUsuario) {
        window.location.href = `../errorPages/401.html`;
    }

    // Carrega todos os dados do evento...

}
window.onload = validarLogin;


async function handleBetFormSubmission(event) {
    event.preventDefault();

    // Captura os valores de input do formulario...
    const qtdCotas = document.getElementById('inputNumCotas').value;
    //const aposta = ????
    //const idEvento = ????

    // Captura as informações guardas da sessionStorage...
    const token = sessionStorage.getItem('sessionToken');
    const idUsuario = sessionStorage.getItem('idUsuario');
    const emailUsuario = sessionStorage.getItem('emailUsuario');

    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/betOnEvent/${idEvento}/${idUsuario}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'email': emailUsuario,
            'qtd_cotas': qtdCotas,
            'aposta': aposta,
            'authorization': token,
        },
    });

    // Result recebe a response do backend...
    const result = await response.text();

    // Valida se ocorreu algum erro e exibe o feedback de erro...
    if (!response.ok) {
        document.querySelector('.feedbackNaoApostado').textContent = result;
        document.querySelector('.feedbackNaoApostado').style.display = 'block';
        return;
    }

    // Caso a aposta seja bem-sucedida exibe o feedback de sucesso...
    document.querySelector('.feedbackApostado').textContent = result;
    document.querySelector('.feedbackApostado').style.display = 'block';
}
