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
        window.location.href = `../Home/home.html`;
    }, 500);
}

// Redireciona o usuario para o signUp
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
}
function closeClaim(){
    const popup = document.querySelector('.claim-popup');
    const blur = document.querySelector('.blur');
    if(popup && blur){
        popup.style.display = 'none';
        blur.style.display = 'none';
    }
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

function updateForm() {
    const dynamicForm = document.getElementById("dynamicForm");
    const selectedOption = document.querySelector('input[name="withdrawOption"]:checked').value;

    let formContent = "";
    if (selectedOption === "account") {
        formContent = `
            <div class="form-group mb-3">
                <label for="agency" class="text-white">Agência:</label>
                <input type="text" id="agency" name="agency" class="form-control" placeholder="Digite o número da agência" required>
            </div>
            <div class="form-group mb-3">
                <label for="accountNumber" class="text-white">Número da Conta Corrente:</label>
                <input type="text" id="accountNumber" name="accountNumber" class="form-control" placeholder="Digite o número da conta" required>
            </div>`;
    } else if (selectedOption === "pix") {
        formContent = `
            <div class="form-group mb-3">
                <label for="pixKey" class="text-white">Chave PIX:</label>
                <input type="text" id="pixKey" name="pixKey" class="form-control" placeholder="Digite sua chave PIX" required>
            </div>`;
    }

    dynamicForm.innerHTML = formContent;
}



window.onload = dadosDaWallet();