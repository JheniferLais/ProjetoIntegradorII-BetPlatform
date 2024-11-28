const apiBaseUrl = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", async () => {

    // Redireciona para a página de Cadastro ao clicar em "Sair"...
    document.getElementById('signUpButton').addEventListener('click', openSignUpPage);

    // Redireciona para a página da Carteira ao clicar na seção de saldo...
    document.getElementById('walletLink').addEventListener('click', openWalletPage);

    // Redireciona para a página da Meus Eventos ao clicar na seção de saldo...
    document.getElementById('myEventsButon').addEventListener('click', openMyEventsPage);

    // Exibe o popup de cadastro de evento ao clicar no botão "Criar Evento"...
    document.getElementById('createEventButton').addEventListener('click', openPopUpCadastrarEvento);

    // Fecha o popup de cadastro de evento ao clicar no blur...
    document.getElementById('popupBlur').addEventListener('click', closePopUpCadastrarEvento);

    // Fecha o popup de cadastro de evento ao clicar no botão de fechar...
    document.getElementById('popupClose').addEventListener('click', closePopUpCadastrarEvento);

    // Configura o envio do formulário da searchBar...
    document.getElementById('searchForm').addEventListener('submit', handleSearchFormSubmission);

    // Configura o click do botao de 'mais apostados'
    document.getElementById('mostBetButton').addEventListener('click', carregarGradeEventosMaisApostados);
    document.getElementById('aVencerButton').addEventListener('click', carregarGradeEventosAVencer);

    // Configura o envio do formulário de criação de eventos...
    document.getElementById('registerEventForm').addEventListener('submit', handleRegisterEventFormSubmission);

    // Adicione um evento de clique a cada item da categoria
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function() {

            const selectedValue = this.getAttribute('data-value');
            carregarGradeEventosCategoria(selectedValue);
        });
    });


    // Aplica formatação de data e hora em campos específicos quando o usuário digitar...
    document.querySelectorAll('#inputDataEvento').forEach(input => {
        input.addEventListener('input', () => formataDataSimplesInput(input));
    });
    document.querySelectorAll('#inputDataHoraInicio, #inputDataHoraFim').forEach(input => {
        input.addEventListener('input', () => formataDataHoraInput(input));
    });

    // Esconder os feedbacks de sucesso e/ou erro quando o usuário interagir com os campos do formulário..
    document.querySelectorAll('#registerEventForm input').forEach(field => {
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
    setTimeout(() => {
        window.location.href = `../Accounts/signUp.html`;
    }, 500);
}
// Redireciona o usuario para o wallet.html...
function openWalletPage(){
    setTimeout(() => {
        window.location.href = `../Wallet/wallet.html`;
    }, 500);
}
// Redireciona o usuario para o wallet.html...
function openMyEventsPage(){
    setTimeout(() => {
        window.location.href = `../events/myEvents.html`;
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
    document.querySelector('.feedbackCriado').style.display = 'none';
    document.querySelector('.feedbackNaoCriado').style.display = 'none';

    const popup = document.querySelector('.popup-cadastro-evento');
    const blur = document.querySelector('.blur');
    if(popup && blur){
        popup.style.display = 'none';
        blur.style.display = 'none';
    }
    document.getElementById('registerEventForm').reset();
}


// Aplica a formatação de datas com hora no formulario de cadastro de evento....
function formataDataHoraInput(input) {

    // Remove caracteres não numéricos...
    let value = input.value.replace(/\D/g, '');

    // Limita a quantidade de caracteres...
    value = value.slice(0, 12);

    // Aplica a formatação para a data e hora...
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5);
    if (value.length > 10) value = value.slice(0, 10) + ' ' + value.slice(10);
    if (value.length > 13) value = value.slice(0, 13) + ':' + value.slice(13);

    // Atualiza o valor do input
    input.value = value;
}
// Aplica a formatação de datas simples no formulario de cadastro de evento....
function formataDataSimplesInput(input) {
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
// Faz a formatação de data simples em formato '2024-02-21' para '21/02/2024'...
function formataDataSimples(dataSimples) {
    const dataS = new Date(dataSimples);

    // Extrai os componentes de data
    const dia = String(dataS.getDate()).padStart(2, '0');
    const mes = String(dataS.getMonth() + 1).padStart(2, '0'); // Meses começam de 0
    const ano = dataS.getFullYear();

    // Monta no formato desejado
    return `${dia}/${mes}/${ano}`;
}
// Faz a alteração de data hora de 21/02/2024 12:30 para 2024-02-21T12:30:00
function transformaDataHora(value) {
    // Divide o valor em partes com base nos separadores
    const parts = value.split(/[\/ :]/); // Divide por "/", espaço ou ":"

    const [dia, mes, ano, hora, minuto] = parts;

    // Retorna o valor no formato ISO com segundos = 00
    return `${ano}-${mes}-${dia}T${hora}:${minuto}:00`;
}

// Faz a formatação de valor de 123456.78 para 123.456,78
function formatarValor(valor) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(valor);
}


// Função para mostrar/bloquear os botoes do home a depender de login...
async function validarLoginParaBotoesHome() {

    // Captura as informações guardadas na sessionStorage...
    const token = sessionStorage.getItem('sessionToken');
    const idUsuario = sessionStorage.getItem('idUsuario');
    const nomeUsuario = sessionStorage.getItem('nomeUsuario');

    // Caso o usuario nao tenha logado...A home já está com os botoes ajustados corretamente...
    if (!token || !idUsuario || !nomeUsuario) {
        return;
    }

    // Caso tenha logado... A home mostra os botoes escondidos...
    document.querySelector('.balance').style.display = 'flex';
    document.querySelector('.sidebar-list').style.display = 'flex';
    document.querySelector('.logout-btn').textContent = 'Sair';
    document.getElementById('useName').textContent = nomeUsuario;

    // Consome da API para obter informações da carteira do usuário...
    const response = await fetch(`${apiBaseUrl}/getAllWalletInformation/${idUsuario}`, {
        method: 'GET',
        headers: {
            'authorization': token,
        },
    });

    // Valida se ocorreu algum erro e retorna...
    if (!response.ok) {
        alert('Ocorreu um erro ao carregar seus dados!');
        return;
    }

    // Saldo recebe a response do backend...
    const saldo = await response.json();

    // Mostra o valor do saldo do usuario no wallet home...
    const balanceElement = document.getElementById('balance-value');
    const valorFormatado = formatarValor(saldo.saldo);
    balanceElement.textContent = valorFormatado + ' BRL';
}


// Função para inserir dinamicamente os eventos na grade...
function inserirEventosNaGrade(eventosContainer, eventos) {
    eventos.forEach(evento => {

        const gradeEvento = document.createElement('div');
        gradeEvento.classList.add('grid-item');

        gradeEvento.style.backgroundImage = `url('./category-imgs/${evento.categoria}.jpg')`;
        gradeEvento.style.backgroundSize = 'cover';
        gradeEvento.style.backgroundPosition = 'center';

        // Define o conteúdo dinâmico do evento...
        gradeEvento.innerHTML = `
            <div class="titulo-categoria">
                <div style="font-weight: 700; font-size: 30px;">${evento.titulo.length > 15 ? evento.titulo.substring(0, 15) + "..." : evento.titulo}</div>
                <div style="font-weight: 300; font-size: 30px; margin-top: -10px;">${evento.categoria}</div>
            </div>
            <div class="apostas-data">
                <div style="font-weight: 500; font-size: 15px;">${evento.qtd_apostas} Apostas 👥</div>
                <div style="font-weight: 500; font-size: 15px;">${formataDataSimples(evento.data_evento)} 📅</div>
            </div>
            <div class="descricao">
                <div style="font-weight: 300; font-size: 20px;">${evento.descricao.length > 35 ? evento.descricao.substring(0, 35) + "..." : evento.descricao}</div>
            </div>
        `;

        const token = sessionStorage.getItem('sessionToken');
        if(token){
            // Adiciona um evento de clique para redirecionar para a pagina do evento
            gradeEvento.addEventListener('click', () => {
                window.location.href = `../Events/event.html?idEvento=${evento.id_evento}`;
            });
        }

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
// Função para buscar os 6 eventos mais apostados...
async function carregarGradeEventosMaisApostados(){

    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/getMostBetEvents`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    await limpaGradeValidaResponse(response);
}
// Função para buscar os eventos por categoria...
async function carregarGradeEventosCategoria(categoria){
    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/getCategory/${categoria}`, {
        method: 'GET',
    });

    await limpaGradeValidaResponse(response);
}
// Função para buscar os 6 eventos proximos a vencer
async function carregarGradeEventosAVencer(){
    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/getUpcomingEvents`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
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

    // Formata o valor para o formato correto
    const dataFim = transformaDataHora(dataHoraFim);
    const dataInicio = transformaDataHora(dataHoraInicio);

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
            'inicioApostas': dataInicio,
            'fimApostas': dataFim,
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