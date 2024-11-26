const apiBaseUrl = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", () => {

    // Adiciona um efeito de fade-in na página ao carregar...
    document.body.classList.add("fade-in");

    // Redireciona para a página de login ao clicar em "Entrar"...
    document.querySelector('.slide.login').addEventListener('click', openSignInPage);

    // Configura o envio do formulário de Cadastro...
    document.getElementById('registerForm').addEventListener('submit', handleFormSubmission);

    // Esconder os feedbacks de sucesso e/ou erro quando o usuário interagir com os campos do formulário..
    document.querySelectorAll('#registerForm input').forEach(field => {
        field.addEventListener('focus', () => {
            document.querySelector('.feedbackCadastrado').style.display = 'none';
            document.querySelector('.feedbackNaoCadastrado').style.display = 'none';
        });
    });
});

// Redireciona o usuario para o signIn.html...
function openSignInPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `signIn.html`;
    }, 500);
}

// Captura os valores do formulario de CADASTRO, consome da API e da um feedback...
async function handleFormSubmission(event) {
    event.preventDefault();

    // Captura os valores de input do formulario...
    const nome = document.getElementById('registerName').value;
    const senha = document.getElementById('registerPassword').value;
    const email = document.getElementById('registerEmail').value;
    const nascimento = document.getElementById('registerBirthdate').value;

    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/signUp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'nome': nome,
            'senha': senha,
            'email': email,
            'nascimento': nascimento
        },
    });

    // Result recebe a response do backend...
    const result = await response.text();

    // Valida se ocorreu algum erro e exibe o feedback de erro...
    if (!response.ok) {
        document.querySelector('.feedbackNaoCadastrado').textContent = result;
        document.querySelector('.feedbackNaoCadastrado').style.display = 'block';
        return;
    }

    // Caso o cadastro seja bem-sucedido exibe o feedback de sucesso...
    document.querySelector('.feedbackCadastrado').textContent = result;
    document.querySelector('.feedbackCadastrado').style.display = 'block';

    // Redireciona para a pagina de login...
    setTimeout(openSignInPage, 1200);
}