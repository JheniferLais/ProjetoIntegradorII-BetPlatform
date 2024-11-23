const apiBaseUrl = 'http://localhost:3000';


document.addEventListener("DOMContentLoaded", async () => {
    document.body.classList.add("fade-in"); // Adiciona um efeito de fade-in na página ao carregar

    // Redireciona para a página de Cadastro ao clicar em "Sair"
    document.getElementById('signUpButton').addEventListener('click', openSignUpPage);

    // Redireciona para a página da Carteira ao clicar na seção de saldo
    document.getElementById('walletLink').addEventListener('click', openWalletPage);

    // Exibe o popup de cadastro de evento ao clicar no botão "Criar Evento"
    document.getElementById('createEventButton').addEventListener('click', openPopUpCadastrarEvento);

    // Fecha o popup de cadastro de evento ao clicar no blur
    document.getElementById('popupBlur').addEventListener('click', closePopUpCadastrarEvento);

    // Fecha o popup de cadastro de evento ao clicar no botão de fechar
    document.getElementById('popupClose').addEventListener('click', closePopUpCadastrarEvento);


    // Configura o envio do formulário da searchBar
    document.getElementById('searchForm').addEventListener('submit', handleSearchFormSubmission);

    // Configura o envio do formulário de criação de eventos
    document.getElementById('registerEventForm').addEventListener('submit', handleRegisterEventFormSubmission);


    // Aplica formatação de data e hora em campos específicos quando o usuário digitar
    const dateTimeInputs = document.querySelectorAll('#inputDataHoraInicio, #inputDataHoraFim');
    dateTimeInputs.forEach(input => {
        input.addEventListener('input', () => formatDateTime(input));
    });

    // Esconder mensagens de feedback de sucesso e erro quando o usuário interagir com qualquer campo do formulário
    const formFields = document.querySelectorAll('#registerEventForm input');
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            document.querySelector('.feedbackCriado').style.display = 'none';
            document.querySelector('.feedbackNaoCriado').style.display = 'none';
        });
    });


    await carregarGradeEventos();
    await saldoDaCarteira();
    validarLogin();
});


function openSignUpPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `../Accounts/signUp.html`;
    }, 500);
}

function openWalletPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `../Wallet/wallet.html`;
    }, 500);
}

function openPopUpCadastrarEvento(){
    const popup = document.querySelector('.popup-cadastro-evento');
    const blur = document.querySelector('.blur');
    if(popup && blur){
        popup.style.display = 'flex';
        blur.style.display = 'block';
    }
}

function closePopUpCadastrarEvento(){
    const popup = document.querySelector('.popup-cadastro-evento');
    const blur = document.querySelector('.blur');
    if(popup && blur){
        popup.style.display = 'none';
        blur.style.display = 'none';
    }
}

function formatDateTime(input) {
    let value = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Aplica a formatação desejada para a data e hora
    if (value.length > 4) value = value.slice(0, 4) + '-' + value.slice(4);
    if (value.length > 7) value = value.slice(0, 7) + '-' + value.slice(7);
    if (value.length > 10) value = value.slice(0, 10) + 'T' + value.slice(10);
    if (value.length > 13) value = value.slice(0, 13) + ':' + value.slice(13);
    if (value.length > 16) value = value.slice(0, 16) + ':' + value.slice(16);

    input.value = value;
}

function inserirEventosNaGrade(eventosContainer, eventos){
    eventos.forEach(evento => {
        const gradeEvento = document.createElement('div');
        gradeEvento.classList.add('grid-item');

        // Define o conteúdo dinâmico do evento
        gradeEvento.innerHTML = `
            <div class="titulo-categoria">
                <div style="font-weight: 700; font-size: 30px;">${evento.titulo}</div>
                <div style="font-weight: 300; font-size: 30px; margin-top: -10px;">${evento.categoria}</div>
            </div>
            <div class="apostas-data">
                <div style="font-weight: 500; font-size: 15px;">${evento.qtd_apostas} Apostas 👥</div>
                <div style="font-weight: 500; font-size: 15px;">${evento.data_evento} 📅</div>
            </div>
            <div class="descricao">
                <div style="font-weight: 300; font-size: 20px;">${evento.descricao}</div>
            </div>
        `;
        eventosContainer.appendChild(gradeEvento);
    });
}

// Função para mostrar o saldo da carteira no homePage
async function saldoDaCarteira(){
    const idUsuario = sessionStorage.getItem('idUsuario');
    const token = sessionStorage.getItem('sessionToken');

    const response = await fetch(`${apiBaseUrl}/getAllWalletInformation/${idUsuario}`, {
        method: 'GET',
        headers: {
            'authorization': token,
        },
    });

    if (!response.ok) {
    }
    const data = await response.json();

    const balanceElement = document.getElementById('balance-value');

    // Update balance
    balanceElement.textContent = data.saldo + ' BRL';
}

function validarLogin() {
    const token = sessionStorage.getItem('sessionToken');
    const idUsuario = sessionStorage.getItem('idUsuario');

    //Caso o usuario nao tenha logado...A home já esta com os botoes ajustados corretamente
    if (!token || !idUsuario) {
        return;
    }

    const balanceDiv = document.querySelector('.balance');
    const sideBarList = document.querySelector('.sidebar-list');
    const logOutBtn = document.querySelector('.logout-btn');

    //Caso tenha logado... A home mostra os botoes escondidos
    balanceDiv.style.display = 'flex';
    sideBarList.style.display = 'flex';
    logOutBtn.textContent = 'Sair';
}

// Função para buscar e exibir todos os eventos ao carregar a pagina
async function carregarGradeEventos() {
    const response = await fetch(`${apiBaseUrl}/getAllEvents`);

    const eventosContainer = document.querySelector('.main-content');
    eventosContainer.innerHTML = '';

    if (!response.ok) {
        const gradeEvento = document.createElement('div');
        gradeEvento.innerHTML = `
            <div class="feedbackNaoEncontrado">
                <p>Sem eventos registrados!</p>
            </div>
        `;
        eventosContainer.appendChild(gradeEvento);
    }

    const eventos = await response.json();
    inserirEventosNaGrade(eventosContainer, eventos);
}

// Função para buscar os eventos da search bar e mostra-los
async function handleSearchFormSubmission(event) {
    event.preventDefault();

    const palavraChave = document.getElementById('search').value;
    if(!palavraChave){
        return;
    }

    const response = await fetch(`${apiBaseUrl}/searchEvent/${palavraChave}`, {
        method: 'GET',
    });

    // Limpa o conteiner de eventos para a proxima grade de informaçoes...
    const eventosContainer = document.querySelector('.main-content');
    eventosContainer.innerHTML = '';

    if (!response.ok) {
        const gradeEvento = document.createElement('div');
        gradeEvento.innerHTML = `
            <div class="feedbackNaoEncontrado">
                <p>Nenhum evento encontrado!</p>
            </div>
        `;
        eventosContainer.appendChild(gradeEvento);
    }

    const eventos = await response.json();
    inserirEventosNaGrade(eventosContainer, eventos);
}

// Função para registrar o evento no banco de dados...
async function handleRegisterEventFormSubmission(event){
    event.preventDefault();

    const titulo = document.getElementById('inputTitulo').value;
    const descricao = document.getElementById('inputDescricao').value;
    const categoria = document.getElementById('inputCategoria').value;
    const valorCota = document.getElementById('inputValorCota').value;
    const dataHoraInicio = document.getElementById('inputDataHoraInicio').value;
    const dataHoraFim = document.getElementById('inputDataHoraFim').value;
    const dataEvento = document.getElementById('inputDataEvento').value;

    const token = sessionStorage.getItem('sessionToken');
    const idUsuario = sessionStorage.getItem('idUsuario');

    if(!token || !idUsuario){
        alert('Sem permissão para a rota!!!');
        return;
    }

    const response = await fetch(`${apiBaseUrl}/addNewEvent/${idUsuario}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'titulo': titulo,
            'desc': descricao,
            'valorCota': valorCota,
            'inicioApostas': dataHoraInicio,
            'fimApostas': dataHoraFim,
            'dataEvento': dataEvento,
            'categoria': categoria,
            'authorization': token,
        },
    });

    const result = await response.text();

    if(!response.ok){
        const feedbackNaoCriado = document.querySelector('.feedbackNaoCriado');
        feedbackNaoCriado.textContent = result || '❌Ocorreu um erro! Tente novamente.';
        feedbackNaoCriado.style.display = 'block';
        return;
    }

    const feedbackCriado = document.querySelector('.feedbackCriado');
    feedbackCriado.textContent = result || '✅Evento criado com sucesso!';
    feedbackCriado.style.display = 'block';

    setTimeout(closePopUpCadastrarEvento, 1200);

    document.getElementById('registerEventForm').reset();
}