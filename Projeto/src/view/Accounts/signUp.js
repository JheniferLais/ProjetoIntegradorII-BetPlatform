const apiBaseUrl = 'http://localhost:3000';

function openSigninPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = "signIn";
    }, 500);
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("fade-in");
});

function handleSignup(event) {
    event.preventDefault(); // Previne o comportamento padrão do formulário

    // Exibe o feedback de sucesso
    const feedbackCadastrado = document.querySelector('.feedbackCadastrado');
    feedbackCadastrado.style.display = 'block';

    // Aguarda 2 segundos e redireciona para home.html
    setTimeout(() => {
        window.location.href = "home";
    }, 2000);
}

// Pega as informções do formulario e envia a requisição para o backend
document.getElementById('registerForm').onsubmit = async function(event){
    event.preventDefault();

    const nome = document.getElementById('registerName').value;
    const senha = document.getElementById('registerPassword').value;
    const email = document.getElementById('registerEmail').value;
    const nascimento = document.getElementById('registerBirthdate').value;

    if (!nome || !senha || !email || !nascimento) {
        alert('Preencha todos os campos')
        return;
    }

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

    if (!response.ok) {
        const statusCode = response.status;
        const errorMessage = await response.text();
        alert(`Erro ${statusCode}: ${errorMessage}`);
        return;
    }

    const resultMessage = await response.text();
    alert(resultMessage);

    openSigninPage();
}
