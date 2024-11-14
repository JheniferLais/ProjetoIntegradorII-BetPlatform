const apiBaseUrl = 'http://localhost:3000';

function openSignupPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = "signUp";
    }, 500);
}

function opennHomePage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = "home";
    }, 500);
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("fade-in");
});

// Pega as informções do formulario e envia a requisição para o backend
document.getElementById('loginForm').onsubmit = async function(event){
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginPassword').value;

    if (!email || !senha) {
        alert('Preencha todos os campos')
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

    if (!response.ok) {
        const statusCode = response.status;
        const errorMessage = await response.text();
        alert(`Erro ${statusCode}: ${errorMessage}`);
        return;
    }

    const resultMessage = await response.text();
    alert(resultMessage);

    opennHomePage();
}