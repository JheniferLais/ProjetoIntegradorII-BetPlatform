const apiBaseUrl = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", async () => {

    // Redireciona para a página de Cadastro ao clicar em "Sair"...
    document.getElementById('signUpButton').addEventListener('click', openSignUpPage);

    // Redireciona para a página de Home ao clicar em "Voltar"...
    document.getElementById('voltar').addEventListener('click', goBack);

});

// Redireciona o usuario para o signUp.html...
function openSignUpPage(){
    sessionStorage.clear();
    setTimeout(() => {
        window.location.href = `../Accounts/signUp.html`;
    }, 500);
}

// Volta para a Home
function goBack() {
    //verifica se há um token armazenado
    const token = sessionStorage.getItem('sessionToken');
    
    if (token) {
        //redireciona mantendo a sessão do usuário
        setTimeout(() => {
            window.history.back(); // Volta para a página anterior
        }, 500);
    } else {
        //caso não haja token, limpa tudo e redireciona para login
        sessionStorage.clear();
        setTimeout(() => {
            window.location.href = '../Accounts/signUp.html';
        }, 500);
    }
}