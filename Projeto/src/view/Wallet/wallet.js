const apiBaseUrl = 'http://localhost:3000';


document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("fade-in"); // Adiciona um efeito de fade-in na página ao carregar

    // Redireciona para a página de Cadastro ao clicar em "Sair"
    document.getElementById('signUpButton').addEventListener('click', openSignUpPage);

    // Redireciona para a página da Carteira ao clicar na seção de saldo
    document.getElementById('homeLink').addEventListener('click', openHomePage);


    // Esconder mensagens de feedback de sucesso e erro quando o usuário interagir com qualquer campo do formulário
    const formFields = document.querySelectorAll('#registerEventForm input');
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            document.querySelector('.feedbackCriado').style.display = 'none';
            document.querySelector('.feedbackNaoCriado').style.display = 'none';
        });
    });
});


// Redireciona o usuario para o home
function openHomePage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `${apiBaseUrl}/home`;
    }, 500);
}

// Redireciona o usuario para o signUp
function openSignUpPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `${apiBaseUrl}/signUp`;
    }, 500);
}

// Função para carregar os dados da wallet(saldo, historio de creditos, historico de apostas )
async function dadosDaWallet() {
    const idUsuario = sessionStorage.getItem('idUsuario');
    const token = sessionStorage.getItem('sessionToken');

    const response = await fetch(`${apiBaseUrl}/getAllWalletInformation/${idUsuario}`, {
        method: 'GET',
        headers: {
            'authorization': token,
        },
    });

    if (!response.ok) {
        alert(response.status);
    }
    const data = await response.json();

    const balanceElement = document.querySelector('.balance-amount');
    const creditListElement = document.querySelector('.credit-list');

    // Update balance
    balanceElement.textContent = data.saldo + ' BRL';

    // Update transaction history
    creditListElement.innerHTML = ''; // Clear existing entries
    data.transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.className = transaction.valorTransacao > 0 ? 'credit' : 'debit';
        li.innerHTML = `${transaction.valorTransacao > 0 ? '+' : ''} R$${transaction.valorTransacao.toFixed(2)} <span>${transaction.tipoTransacao}</span>`;
        creditListElement.appendChild(li);
    });
}

window.onload = dadosDaWallet();