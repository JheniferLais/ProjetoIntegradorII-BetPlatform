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
    const formFields = document.querySelectorAll('#loginForm input');
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

    // Valida se todos os campos foram preenchidos
    if (!email || !senha) {
        const feedbackNaoCadastrado = document.querySelector('.feedbackNaoLogado');
        feedbackNaoCadastrado.textContent = 'Preencha todos os campos';
        feedbackNaoCadastrado.style.display = 'block';
        return;
    }

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
    const result = await response.text();

    // Valida se ocorreu algum erro e exibe a mensagem de erro
    if (!response.ok) {
        const feedbackNaoCadastrado = document.querySelector('.feedbackNaoLogado');
        feedbackNaoCadastrado.textContent = result.message || result || '❌ Ocorreu um erro! Tente novamente.';
        feedbackNaoCadastrado.style.display = 'block';
        return;
    }

    // Caso o login seja bem-sucedido exibe a mensagem de sucesso
    const feedbackCadastrado = document.querySelector('.feedbackLogado');
    feedbackCadastrado.textContent = result.message || '✅ Logado com sucesso!';
    feedbackCadastrado.style.display = 'block';

    // Redireciona para a pagina de home
    setTimeout(openHomePage, 1200);
}