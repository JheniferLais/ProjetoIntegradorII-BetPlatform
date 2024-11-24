const apiBaseUrl = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", () => {

    // Adiciona um efeito de fade-in na página ao carregar...
    document.body.classList.add("fade-in");

    // Redireciona para a página de Cadastro ao clicar em "Sair" ou "Entrar/Cadastrar"...
    document.getElementById('signUpButton').addEventListener('click', openSignUpPage);

    // Redireciona para a página da Carteira ao clicar na seção de saldo...
    document.getElementById('homeLink').addEventListener('click', openHomePage);

    // Configura o envio do formulário de addFunds...
    //document.getElementById('formAddFunds').addEventListener('submit', handleAddFundsFormSubmission);

    // Esconder os feedbacks de sucesso e/ou erro quando o usuário interagir com os campos do formulário..
    const formFields = document.querySelectorAll('#registerEventForm input');
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            document.querySelector('.feedbackCriado').style.display = 'none';
            document.querySelector('.feedbackNaoCriado').style.display = 'none';
        });
    });
});


// Redireciona o usuario para a home.html...
function openHomePage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `../Home/home.html`;
    }, 500);
}

// Redireciona o usuario para o signUp.html...
function openSignUpPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `../Accounts/signUp.html`;
    }, 500);
}


function openDeposit(){
    const popup = document.querySelector('.deposit-popup');
    const blur = document.querySelector('.blur');
    if(popup && blur){
        popup.style.display = 'flex';
        blur.style.display = 'block';
    }
}
function openClaim(){
    const popup = document.querySelector('.claim-popup');
    const blur = document.querySelector('.blur');
    if(popup && blur){
        popup.style.display = 'flex';
        blur.style.display = 'block';
    }
    updateForm();
}

function closeDeposit(){
    const popup = document.querySelector('.deposit-popup');
    const blur = document.querySelector('.blur');
    if(popup && blur){
        popup.style.display = 'none';
        blur.style.display = 'none';
    }
    document.getElementById('formAddFunds').reset();
}
function closeClaim(){
    const popup = document.querySelector('.claim-popup');
    const blur = document.querySelector('.blur');
    if(popup && blur){
        popup.style.display = 'none';
        blur.style.display = 'none';
    }
    document.getElementById('formWithdrawFunds').reset();
    document.getElementById('formAddFunds').reset();
}

// Função para carregar os dados da wallet(saldo, historio de créditos, histórico de apostas)
async function carregarDadosDaWallet() {

    // Captura as informações guardas da sessionStorage...
    const idUsuario = sessionStorage.getItem('idUsuario');
    const token = sessionStorage.getItem('sessionToken');

    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/getAllWalletInformation/${idUsuario}`, {
        method: 'GET',
        headers: {
            'authorization': token,
        },
    });

    // result recebe a response do backend...
    const result = await response.json();

    // Mostra o valor do saldo do usuario na wallet...
    const balanceElement = document.querySelector('.balance-amount');
    const creditListElement = document.querySelector('.credit-list');
    const betListElement = document.querySelector('.bet-list');
    balanceElement.textContent = result.saldo + ' BRL';

    // Limpa a grade de historico de transações para a proxima grade de informações...
    creditListElement.innerHTML = '';
    betListElement.innerHTML = '';

    // Adiciona dinamicamente o historico de transações...
    result.transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.className = transaction.valorTransacao > 0 ? 'credit' : 'debit';
        li.innerHTML = `${transaction.valorTransacao > 0 ? '+' : ''} R$${transaction.valorTransacao.toFixed(2)} <span>${transaction.tipoTransacao}</span>`;
        creditListElement.appendChild(li);
    });

    // Adiciona dinamicamente o historico de apostas...
    result.bets.forEach(bet => {
        const li = document.createElement('li');
        li.className = bet.valorGasto > 0 ? 'credit' : 'debit';
        li.innerHTML = `${bet.valorGasto > 0 ? '+' : ''} R$${bet.valorGasto.toFixed(2)} <span>${bet.aposta}</span>`;
        betListElement.appendChild(li);
    });
}
window.onload = carregarDadosDaWallet();

function updateForm() {
    const dynamicForm = document.getElementById("dynamicForm");
    const selectedOption = document.querySelector('input[name="withdrawOption"]:checked').value;

    let formContent = "";
    if (selectedOption === "account") {
        formContent = `
            <div class="form-group mb-3">
                <label for="agency" class="text-white">Agência</label>
                <input id="agency" type="text" name="agency" class="form-control" placeholder="Digite o número da agência" required>
            </div>
            <div class="form-group mb-3">
                <label for="accountNumber" class="text-white">Número da Conta Corrente</label>
                <input id="accountNumber" type="text" name="accountNumber" class="form-control" placeholder="Digite o número da conta" required>
            </div>`;
    } else if (selectedOption === "pix") {
        formContent = `
            <div class="form-group mb-3">
                <label for="pixKey" class="text-white">Chave PIX</label>
                <input id="pixKey" type="text" name="pixKey" class="form-control" placeholder="Digite sua chave PIX" required>
            </div>`;
    }

    dynamicForm.innerHTML = formContent;
}
