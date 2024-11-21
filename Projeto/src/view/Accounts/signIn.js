const apiBaseUrl = 'http://localhost:3000';

// Redireciona o usuario para o signUp
function openSignUpPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `${apiBaseUrl}/signUp`;
    }, 500);
}

// Redireciona o usuario para o home
function openHomePage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `${apiBaseUrl}/home`;
    }, 500);
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("fade-in");

    // Redireciona para a página de Cadastro ao clicar em "Cadastrar"
    document.querySelector('.slide.signup').addEventListener('click', openSignUpPage);

    // Esconder mensagens de feedback de sucesso e erro quando o usuário interagir com qualquer campo do formulário
    const formFields = document.querySelectorAll('#loginForm');
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            document.querySelector('.feedbackLogado').style.display = 'none';
            document.querySelector('.feedbackNaoLogado').style.display = 'none';
        });
    });

    // Configura o envio do formulário
    document.getElementById('loginForm').addEventListener('submit', handleFormSubmission);
});

// Pega as informções do formulario e envia a requisição para o backend
async function handleFormSubmission(event) {
    event.preventDefault();

    // Captura os valores de input do formulario
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginPassword').value;

    // Envia a requisição ao backend
    const response = await fetch(`${apiBaseUrl}/signIn`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'email': email,
            'senha': senha,
        },
    });

    // Result recebe o texto de response do backend
    const result = await response.json();

    // Valida se ocorreu algum erro e exibe a mensagem de erro
    if (!response.ok) {
        const feedbackNaoLogado = document.querySelector('.feedbackNaoLogado');
        feedbackNaoLogado.textContent = result || '❌ Ocorreu um erro! Tente novamente.';
        feedbackNaoLogado.style.display = 'block';
        return;
    }

    // Armazena o token, nome e id do usuario na sessionStorage
    sessionStorage.setItem('nomeUsuario', result.nomeUsuario);
    sessionStorage.setItem('idUsuario', result.idUsuario);
    sessionStorage.setItem('sessionToken', result.token);

    // Caso o login seja bem-sucedido exibe a mensagem de sucesso
    const feedbackLogado = document.querySelector('.feedbackLogado');
    feedbackLogado.textContent = result.message || '✅ Logado com sucesso!';
    feedbackLogado.style.display = 'block';

    // Redireciona para a pagina de home
    setTimeout(openHomePage, 1200);
}