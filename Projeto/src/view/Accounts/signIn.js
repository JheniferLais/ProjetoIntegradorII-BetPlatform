const apiBaseUrl = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", () => {

    // Adiciona um efeito de fade-in na página ao carregar...
    document.body.classList.add("fade-in");

    // Redireciona para a página de Cadastro ao clicar em "Cadastrar"...
    document.querySelector('.slide.signup').addEventListener('click', openSignUpPage);

    // Configura o envio do formulário de Login...
    document.getElementById('loginForm').addEventListener('submit', handleFormSubmission);

    // Esconder os feedbacks de sucesso e/ou erro quando o usuário interagir com os campos do formulário..
    const formFields = document.querySelectorAll('#loginForm input');
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            document.querySelector('.feedbackLogado').style.display = 'none';
            document.querySelector('.feedbackNaoLogado').style.display = 'none';
        });
    });
});

// Redireciona o usuario para o signUp.html...
function openSignUpPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `signUp.html`;
    }, 500);
}

// Redireciona o usuario para a home.html...
function openHomePage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `../Home/home.html`;
    }, 500);
}

// Captura os valores do formulario de LOGIN, consome da API e da um feedback...
async function handleFormSubmission(event) {
    event.preventDefault();

    // Captura os valores de input do formulario...
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginPassword').value;

    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/signIn`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'email': email,
            'senha': senha,
        },
    });

    // Result recebe a response do backend...
    const result = await response.json();

    // Valida se ocorreu algum erro e exibe o feedback de erro...
    if (!response.ok) {
        document.querySelector('.feedbackNaoLogado').textContent = result;
        document.querySelector('.feedbackNaoLogado').style.display = 'block';
        return;
    }

    // Armazena o token, nome e id do usuario na sessionStorage...
    sessionStorage.setItem('nomeUsuario', result.nomeUsuario);
    sessionStorage.setItem('idUsuario', result.idUsuario);
    sessionStorage.setItem('sessionToken', result.token);

    // Caso o login seja bem-sucedido exibe o feedback de sucesso...
    document.querySelector('.feedbackLogado').textContent = result.response;
    document.querySelector('.feedbackLogado').style.display = 'block';

    // Redireciona para a pagina de home...
    setTimeout(openHomePage, 1200);
}