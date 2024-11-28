const apiBaseUrl = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded",  async () => {

    // Redireciona para a página de Cadastro ao clicar em "Sair" ou "Entrar/Cadastrar"...
    document.getElementById('signUpButton').addEventListener('click', openSignUpPage);

    // Redireciona para a página da Carteira ao clicar na seção de saldo...
    document.getElementById('homeLink').addEventListener('click', openHomePage);

    // Configura o envio do formulário de addFunds...
    document.getElementById('formAddFunds').addEventListener('submit', handleAddFundsFormSubmission);

    // Configura o envio do formulário de addFunds...
    document.getElementById('formWithdrawFunds').addEventListener('submit', handleWithDrawFundsFormSubmission);

    // Aplica formatação de data e hora em campos específicos quando o usuário digitar...
    document.querySelectorAll('#validade').forEach(input => {
        input.addEventListener('input', () => formatMonthYear(input));
    });

    // Esconder os feedbacks de sucesso e/ou erro quando o usuário interagir com os campos do formulário...
    document.querySelectorAll('#formAddFunds input').forEach(field => {
        field.addEventListener('focus', () => {
            document.querySelector('.feedbackAdicionado').style.display = 'none';
            document.querySelector('.feedbackNaoAdicionado').style.display = 'none';
        });
    });

    // Limita o tamanho do cvv para 3...
    document.querySelectorAll('#cvv').forEach(input => {
        input.addEventListener('input', () => formatCVV(input));
    });

    await carregarDadosDaWallet();
});


// Redireciona o usuario para a home.html...
function openHomePage(){
    setTimeout(() => {
        window.location.href = `../Home/home.html`;
    }, 500);
}
// Redireciona o usuario para o signUp.html...
function openSignUpPage(){
    sessionStorage.clear();
    setTimeout(() => {
        window.location.href = `../Accounts/signUp.html`;
    }, 500);
}


// Funções de fechar o popUp de Saque e Deposito...
function openDeposit(){
    document.querySelector('.deposit-popup').style.display = 'flex';
    document.querySelector('.blur').style.display = 'block';
}
function openClaim(){
    document.querySelector('.claim-popup').style.display = 'flex';
    document.querySelector('.blur').style.display = 'block';
    updateForm();
}


// Funções de abrir o popUp de Saque e Deposito...
function closeDeposit(){
    document.querySelector('.deposit-popup').style.display = 'none';
    document.querySelector('.blur').style.display = 'none';

    location.reload();
    document.getElementById('formAddFunds').reset();
}
function closeClaim(){
    document.querySelector('.claim-popup').style.display = 'none';
    document.querySelector('.blur').style.display = 'none';

    location.reload();
    document.getElementById('formWithdrawFunds').reset();
}


// Função para carregar os dados da wallet(saldo, historio de créditos, histórico de apostas)...
async function carregarDadosDaWallet() {

    // Captura as informações guardas da sessionStorage...
    const idUsuario = sessionStorage.getItem('idUsuario');
    const token = sessionStorage.getItem('sessionToken');

    // Caso o usuario nao tenha logado...Ele é redirecionado para a pagina de nao autenticado...
    if (!token || !idUsuario) {
        window.location.href = `../errorPages/401.html`;
    }

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
    const valorFormatado = formatarValor(result.saldo);
    balanceElement.textContent = valorFormatado + ' BRL';

    // Limpa a grade de historico de transações para a proxima grade de informações...
    creditListElement.innerHTML = '';
    betListElement.innerHTML = '';

    // Adiciona dinamicamente o historico de transações...
    result.transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.className = transaction.tipoTransacao === 'deposito' ? 'credit' : 'debit';

        const valorFormatado = formatarValor(transaction.valorTransacao)
        li.innerHTML = `R$${valorFormatado} <span>${transaction.tipoTransacao}</span>`;

        creditListElement.appendChild(li);
    });

    // Adiciona dinamicamente o historico de apostas...
    result.bets.forEach(bet => {
        const li = document.createElement('li');
        li.className = bet.valorGasto > 0 ? 'credit' : 'debit';

        const valorFormatado = formatarValor(bet.valorGasto);
        li.innerHTML = `R$${valorFormatado} <span>${bet.aposta}</span>`;

        betListElement.appendChild(li);
    });
}


// Funçao para formatar o valor de 123456.78 para 123.456,78...
function formatarValor(valor) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(valor);
}
// Aplica o formato MM-YY para validade do cartao...
function formatMonthYear(input) {
    // Remove caracteres não numéricos
    let value = input.value.replace(/\D/g, '');

    // Limita a entrada a no máximo 4 caracteres (MMAA)
    value = value.slice(0, 4);

    // Aplica a formatação para MM/AA
    if (value.length > 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
    }

    // Atualiza o valor do input
    input.value = value;
}
// Aplica a formatacao de no maximo 3 numeros no cvv...
function formatCVV(input) {
    // Remove caracteres não numéricos
    let value = input.value.replace(/\D/g, '');

    // Limita a entrada a no máximo 3 dígitos
    value = value.slice(0, 3);

    // Atualiza o valor do input
    input.value = value;
}


// Atualiza o formulario de saque a depender do método de pagamento...
function updateForm() {
    const dynamicForm = document.getElementById("dynamicForm");
    const selectedOption = document.querySelector('input[name="withdrawOption"]:checked').value;

    let formContent = "";
    if (selectedOption === "account") {
        formContent = `
            <div class="form-group mb-3">
                <label for="agency" class="text-white">Agência</label>
                <input id="agency" type="text" name="agency" class="form-control" placeholder="EX: 1234" required>
            </div>
            <div class="form-group mb-3">
                <label for="accountNumber" class="text-white">Número da Conta Corrente</label>
                <input id="accountNumber" type="text" name="accountNumber" class="form-control" placeholder="EX: 1234567890" required>
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


async function handleAddFundsFormSubmission(event){
    event.preventDefault();

    const numeroCartao = document.getElementById('cardNumber').value;
    const cvv = document.getElementById('cvv').value;
    const valorDeposito = document.getElementById('depositAmount').value;
    const validade = document.getElementById('validade').value;

    // Captura as informações guardas da sessionStorage...
    const token = sessionStorage.getItem('sessionToken');
    const idUsuario = sessionStorage.getItem('idUsuario');

    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/addFunds/${idUsuario}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'valor': valorDeposito,
            'numeroCartao': numeroCartao,
            'validade': validade,
            'cvv': cvv,
            'authorization': token,
        },
    });

    // Result recebe a response do backend...
    const result = await response.text();

    // Valida se ocorreu algum erro e exibe o feedback de erro...
    if(!response.ok){
        document.querySelector('.feedbackNaoAdicionado').textContent = result;
        document.querySelector('.feedbackNaoAdicionado').style.display = 'block';
        return;
    }

    // Caso a adição de fundos seja bem-sucedido exibe o feedback de sucesso...
    document.querySelector('.feedbackAdicionado').textContent = result;
    document.querySelector('.feedbackAdicionado').style.display = 'block';

    // Fecha o popUp e Limpa o formulario...
    setTimeout(closeDeposit, 1200);
}

async function handleWithDrawFundsFormSubmission(event){
    event.preventDefault();

    const token = sessionStorage.getItem('sessionToken');
    const idUsuario = sessionStorage.getItem('idUsuario');

    const valorDeSaque = document.getElementById('withdrawAmount').value;
    const agencia = document.getElementById('agency')?.value;
    const conta = document.getElementById('accountNumber')?.value;
    const chavePix = document.getElementById('pixKey')?.value;

    const headers = {
        'Content-Type': 'application/json',
        'valor': valorDeSaque,
        'authorization': token,
    };

    //Se nao receber a informacao de agencia e conta faz por pix...
    if(chavePix){
        headers.pix = chavePix;
    } else if(agencia && conta){
        headers.agencia = agencia;
        headers.conta = conta;
    }
    else return;
    alert('ta aqui')
    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/withdrawFunds/${idUsuario}`, {
        method: 'POST',
        headers: headers,
    });

    // Result recebe a response do backend...
    const result = await response.text();
    alert(result);
    // Valida se ocorreu algum erro e exibe o feedback de erro...
    if(!response.ok){
        document.querySelector('.feedbackNaoSacado').textContent = result;
        document.querySelector('.feedbackNaoSacado').style.display = 'block';
        return;
    }

    // Caso a adição de fundos seja bem-sucedido exibe o feedback de sucesso...
    document.querySelector('.feedbackSacado').textContent = result;
    document.querySelector('.feedbackSacado').style.display = 'block';

    // Fecha o popUp e Limpa o formulario...
    setTimeout(closeClaim, 1200);
}