const apiBaseUrl = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", async () => {

    // Adiciona um efeito de fade-in na página ao carregar...
    document.body.classList.add("fade-in");

    // Redireciona para a página de Cadastro ao clicar em "Sair"...
    document.getElementById('signUpButton').addEventListener('click', openSignUpPage);

    // Redireciona para a página da Carteira ao clicar na seção de saldo...
    document.getElementById('walletLink').addEventListener('click', openWalletPage);

    // Exibe o popup de cadastro de evento ao clicar no botão "Criar Evento"...
    document.getElementById('createEventButton').addEventListener('click', openPopUpCadastrarEvento);

    // Fecha o popup de cadastro de evento ao clicar no blur...
    document.getElementById('popupBlur').addEventListener('click', closePopUpCadastrarEvento);

    // Fecha o popup de cadastro de evento ao clicar no botão de fechar...
    document.getElementById('popupClose').addEventListener('click', closePopUpCadastrarEvento);

    // Configura o envio do formulário da searchBar...
    document.getElementById('searchForm').addEventListener('submit', handleSearchFormSubmission);

    // Configura o envio do formulário de criação de eventos...
    document.getElementById('registerEventForm').addEventListener('submit', handleRegisterEventFormSubmission);

    // Aplica formatação de data e hora em campos específicos quando o usuário digitar...
    const dateInputs = document.querySelectorAll('#inputDataEvento');
    dateInputs.forEach(input => {
        input.addEventListener('input', (e) => formatDate(input));
    });
    const dateTimeInputs = document.querySelectorAll('#inputDataHoraInicio, #inputDataHoraFim');
    dateTimeInputs.forEach(input => {
        input.addEventListener('input', () => formatDateTime(input));
    });

    // Esconder os feedbacks de sucesso e/ou erro quando o usuário interagir com os campos do formulário..
    const formFields = document.querySelectorAll('#registerEventForm input');
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            document.querySelector('.feedbackCriado').style.display = 'none';
            document.querySelector('.feedbackNaoCriado').style.display = 'none';
        });
    });

    await validarLoginParaBotoesHome();
    await carregarGradeEventos();

});

// Redireciona o usuario para o signUp.html...
function openSignUpPage(){
    sessionStorage.clear();
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `../Accounts/signUp.html`;
    }, 500);
}

// Redireciona o usuario para o wallet.html...
function openWalletPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `../Wallet/wallet.html`;
    }, 500);
}

// Abre o popup de cadastro de evento...
function openPopUpCadastrarEvento(){
    const popup = document.querySelector('.popup-cadastro-evento');
    const blur = document.querySelector('.blur');
    if(popup && blur){
        popup.style.display = 'flex';
        blur.style.display = 'block';
    }
}

// Fecha o popup de cadastro de evento...
function closePopUpCadastrarEvento(){
    const popup = document.querySelector('.popup-cadastro-evento');
    const blur = document.querySelector('.blur');
    if(popup && blur){
        popup.style.display = 'none';
        blur.style.display = 'none';
    }
    document.getElementById('registerEventForm').reset();
}

// Aplica a formatação de data no formulario de cadastro de evento....
function formatDateTime(input) {

    // Remove caracteres não numéricos...
    let value = input.value.replace(/\D/g, '');

    // Limita a quantidade de caracteres...
    value = value.slice(0, 14);

    // Aplica a formatação para a data e hora...
    if (value.length > 4) value = value.slice(0, 4) + '-' + value.slice(4); // AAAA-MM
    if (value.length > 7) value = value.slice(0, 7) + '-' + value.slice(7); // AAAA-MM-DD
    if (value.length > 10) value = value.slice(0, 10) + 'T' + value.slice(10); // AAAA-MM-DDTHH
    if (value.length > 13) value = value.slice(0, 13) + ':' + value.slice(13); // AAAA-MM-DDTHH:mm
    if (value.length > 16) value = value.slice(0, 16) + ':' + value.slice(16); // AAAA-MM-DDTHH:mm:ss

    // Atualiza o valor do input
    input.value = value;
}

function formatDate(input) {
    // Remove caracteres não numéricos
    let value = input.value.replace(/\D/g, '');

    // Limita a entrada a no máximo 8 dígitos
    value = value.slice(0, 8);

    // Aplica a formatação para AAAA-MM-DD
    if (value.length > 4) value = value.slice(0, 4) + '-' + value.slice(4); // AAAA-MM
    if (value.length > 7) value = value.slice(0, 7) + '-' + value.slice(7); // AAAA-MM-DD

    // Atualiza o valor do input
    input.value = value;
}

// Função para mostrar/bloquear os botoes do home a depender de login...
async function validarLoginParaBotoesHome() {

    // Captura as informações guardadas na sessionStorage...
    const token = sessionStorage.getItem('sessionToken');
    const idUsuario = sessionStorage.getItem('idUsuario');

    // Caso o usuario nao tenha logado...A home já esta com os botoes ajustados corretamente...
    if (!token || !idUsuario) {
        return;
    }

    // Caso tenha logado... A home mostra os botoes escondidos...
    document.querySelector('.balance').style.display = 'flex';
    document.querySelector('.sidebar-list').style.display = 'flex';
    document.querySelector('.logout-btn').textContent = 'Sair';

    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/getAllWalletInformation/${idUsuario}`, {
        method: 'GET',
        headers: {
            'authorization': token,
        },
    });

    // Valida se ocorreu algum erro e retorna...
    if (!response.ok) {
        return;
    }

    // Saldo recebe a response do backend...
    const saldo = await response.json();

    // Mostra o valor do saldo do usuario no wallet home...
    const balanceElement = document.getElementById('balance-value');
    balanceElement.textContent = saldo.saldo + ' BRL';
}


// Função para inserir dinamicamente os eventos na grade...
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

// Função para limpar a grade e validar a response
async function limpaGradeValidaResponse(response){
    document.querySelector('.main-content').innerHTML = '';
    if (!response.ok) {
        const gradeEvento = document.createElement('div');
        gradeEvento.innerHTML = `
            <div class="feedbackNaoEncontrado">
                <p>Nenhum evento encontrado!</p>
            </div>
        `;
        document.querySelector('.main-content').appendChild(gradeEvento);
        return;
    }

    const eventos = await response.json();
    inserirEventosNaGrade(document.querySelector('.main-content'), eventos);
}

// Função para buscar todos os eventos 'aprovados' para serem inseridos na grade default...
async function carregarGradeEventos() {

    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/getEvent`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'statusEvento': 'aprovado',
        },
    });

    await limpaGradeValidaResponse(response);
}


// Função para buscar os eventos da search bar e mostra-los...
async function handleSearchFormSubmission(event) {
    event.preventDefault();

    // Captura o valor de input do formulario...
    const palavraChave = document.getElementById('search').value;
    if(!palavraChave){
        return;
    }

    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/searchEvent/${palavraChave}`, {
        method: 'GET',
    });

    await limpaGradeValidaResponse(response);
}

// Função para registrar o evento no banco de dados...
async function handleRegisterEventFormSubmission(event){
    event.preventDefault();

    // Captura os valores de input do formulario...
    const titulo = document.getElementById('inputTitulo').value;
    const descricao = document.getElementById('inputDescricao').value;
    const categoria = document.getElementById('inputCategoria').value;
    const valorCota = document.getElementById('inputValorCota').value;
    const dataHoraInicio = document.getElementById('inputDataHoraInicio').value;
    const dataHoraFim = document.getElementById('inputDataHoraFim').value;
    const dataEvento = document.getElementById('inputDataEvento').value;

    // Captura as informações guardas da sessionStorage...
    const token = sessionStorage.getItem('sessionToken');
    const idUsuario = sessionStorage.getItem('idUsuario');

    // Consome da API...
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

    // Result recebe a response do backend...
    const result = await response.text();

    // Valida se ocorreu algum erro e exibe o feedback de erro...
    if(!response.ok){
        document.querySelector('.feedbackNaoCriado').textContent = result;
        document.querySelector('.feedbackNaoCriado').style.display = 'block';
        return;
    }

    // Caso o cadastro do evento seja bem-sucedido exibe o feedback de sucesso...
    document.querySelector('.feedbackCriado').textContent = result;
    document.querySelector('.feedbackCriado').style.display = 'block';

    // Fecha o popUp e Limpa o formulario...
    setTimeout(closePopUpCadastrarEvento, 1200);
}