const apiBaseUrl = 'http://localhost:3000';

// Redireciona o usuario para o signIn
function openSignInPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `${apiBaseUrl}/signIn`;
    }, 500);
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("fade-in");

    // Redireciona para a página de login ao clicar em "Entrar"
    document.querySelector('.slide.login').addEventListener('click', openSignInPage);

    // Esconder mensagens de feedback de sucesso e erro quando o usuário interagir com qualquer campo do formulário
    const formFields = document.querySelectorAll('#registerForm input');
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            document.querySelector('.feedbackCadastrado').style.display = 'none';
            document.querySelector('.feedbackNaoCadastrado').style.display = 'none';
        });
    });

    // Configura o envio do formulário
    document.getElementById('registerForm').addEventListener('submit', handleFormSubmission);
});

// Pega as informções do formulario e envia a requisição para o backend
async function handleFormSubmission(event) {
    event.preventDefault();

    // Captura os valores de input do formulario
    const nome = document.getElementById('registerName').value;
    const senha = document.getElementById('registerPassword').value;
    const email = document.getElementById('registerEmail').value;
    const nascimento = document.getElementById('registerBirthdate').value;

    // Envia a requisição ao backend
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

    // Result recebe o texto de response do backend
    const result = await response.text();

    // Valida se ocorreu algum erro e exibe a mensagem de erro
    if (!response.ok) {
        const feedbackNaoCadastrado = document.querySelector('.feedbackNaoCadastrado');
        feedbackNaoCadastrado.textContent = result || '❌ Ocorreu um erro! Tente novamente.';
        feedbackNaoCadastrado.style.display = 'block';
        return;
    }

    // Caso o cadastro seja bem-sucedido exibe a mensagem de sucesso
    const feedbackCadastrado = document.querySelector('.feedbackCadastrado');
    feedbackCadastrado.textContent = result || '✅ Cadastrado com sucesso!';
    feedbackCadastrado.style.display = 'block';

    // Redireciona para a pagina de login
    setTimeout(openSignInPage, 1200);
}