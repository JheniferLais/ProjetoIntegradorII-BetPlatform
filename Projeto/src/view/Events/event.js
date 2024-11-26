const apiBaseUrl = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded",  () => {

    // Redireciona para a página de Cadastro ao clicar em "Sair"...
    document.getElementById('backButton').addEventListener('click', openHomePage);

    // Redireciona para a página da Carteira ao clicar na seção de saldo...
    document.getElementById('walletLink').addEventListener('click', openWalletPage);

     // Configura o envio do formulário de criação de apostas...
    document.getElementById('formAposta').addEventListener('submit', handleBetFormSubmission);

    // Esconder os feedbacks de sucesso e/ou erro quando o usuário interagir com os campos do formulário..
    const formFields = document.querySelectorAll('#formAposta input');
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            document.querySelector('.feedbackApostado').style.display = 'none';
            document.querySelector('.feedbackNaoApostado').style.display = 'none';
        });
    });
});


// Redireciona o usuario para a home.html...
function openHomePage(){
    setTimeout(() => {
        window.location.href = `../Home/home.html`;
    }, 500);
}
// Redireciona o usuario para o wallet.html...
function openWalletPage(){
    setTimeout(() => {
        window.location.href = `../Wallet/wallet.html`;
    }, 500);
}

// Função para validar se o usuario esta autenticado e pode estar nessa pagina...
function validarLogin(){
    // Captura as informações guardadas na sessionStorage...
    const token = sessionStorage.getItem('sessionToken');

    // Caso o usuario nao tenha logado...
    if (!token) {
        window.location.href = `../errorPages/401.html`;
    }

    // Carrega todos os dados do evento...
}

// Função para inserir dinamicamente os eventos na grade...
function carregarDadosDoEvento(objetoEvento) {
    const eventoContainerLeft = document.querySelector('.container-left');
    const infoEventoLeft = document.createElement('div');
    infoEventoLeft.classList.add('container-left');

    // Define o conteúdo dinâmico do evento...
    infoEventoLeft.innerHTML = `
        <div class="evento-titulo">
            <p id="categoria">${objetoEvento.categoria}</p>
            <p id="titulo">${objetoEvento.titulo}</p>
        </div>
        <div class="descricao">
            <p id="descricao">
                ${objetoEvento.descricao}</p>
        </div>
        <div class="detalhes">
            <div class="data">
                <i class="fa-regular fa-calendar"></i>
                <p>Data do evento: <strong>${objetoEvento.data_evento}</strong></p>
            </div>
            <div class="encerramento">
                <i class="fa-regular fa-clock"></i>
                <p>Encerramento das apostas: <strong>${objetoEvento.data_hora_fim}</strong></p>
            </div>
        </div>
    `;
    eventoContainerLeft.appendChild(infoEventoLeft);

    const eventoContainerRight = document.querySelector('.container-right');
    const infoEventoRight = document.createElement('div');
    infoEventoRight.classList.add('container-right');

    infoEventoRight.innerHTML = `
        <div class="valor-cota">
            <p>Valor da Cota: <strong id="valor-cota-valor">R$ ${objetoEvento.valor_cota}</strong></p>
        </div>
        <p class="feedbackApostado"></p>
        <p class="feedbackNaoApostado"></p>
        <div class="container-cota-aposta">
            <form id="formAposta">
                <div class="selecionar-num-cota">
                    <label for="inputNumCotas">Número de apostas:</label>
                    <input id="inputNumCotas" name="numcotas" class="form-control" type="number" min="1" step="1" placeholder="Digite o número de cotas" required>
                    <p id="valorTotal" style="margin-top: 10px;">Total: R$ 0,00</p>
                </div>

                <div class="aposta">
                    <button id="btn nao" value="nao" type="submit" class="btn nao">Não</button>
                    <button id="btn sim" value="sim" type="submit" class="btn sim">Sim</button>
                </div>
            </form>
        </div>
    `;
    eventoContainerRight.appendChild(infoEventoRight);

    // Seleciona o input e o parágrafo
    const numCotas = document.getElementById('inputNumCotas');
    const valorTotal = document.getElementById('valorTotal');

    // Adiciona um evento ao input
    numCotas.addEventListener('input', () => {
        // Calcula o total
        const total = numCotas.value * objetoEvento.valor_cota;

        // Atualiza o texto do parágrafo
        valorTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
    });
}
async function buscarEvento() {

    // Valida se o usuario esta logado...
    validarLogin();

    // Caso o usuario esteja logado... carrega todos os dados do evento..

    // Captura as informações guardas da URL...
    const params = new URLSearchParams(window.location.search);
    const idEvento = params.get('idEvento');

    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/getAllInformationEvent/${idEvento}`, {
        method: 'GET',
    });

    //Se a pagina do evento não existir...
    if(!response.ok) {
        window.location.href = `../errorPages/404.html`;
        return;
    }

    //Chama a funçao para carregar os dados...
    const result = await response.json();
    carregarDadosDoEvento(result);
}
window.onload = buscarEvento;

async function handleBetFormSubmission(event) {
    event.preventDefault();

    // Captura o parâmetros idEvento da URL atual
    const params = new URLSearchParams(window.location.search);
    const idEvento = params.get('idEvento');

    // Captura os valores de input do formulario...
    const qtdCotas = document.getElementById('inputNumCotas').value;


    // Captura as informações guardas da sessionStorage...
    const token = sessionStorage.getItem('sessionToken');
    const idUsuario = sessionStorage.getItem('idUsuario');
    const emailUsuario = sessionStorage.getItem('emailUsuario');

    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/betOnEvent/${idEvento}/${idUsuario}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'email': emailUsuario,
            'qtd_cotas': qtdCotas,
            'aposta': aposta,
            'authorization': token,
        },
    });

    // Result recebe a response do backend...
    const result = await response.text();

    // Valida se ocorreu algum erro e exibe o feedback de erro...
    if (!response.ok) {
        document.querySelector('.feedbackNaoApostado').textContent = result;
        document.querySelector('.feedbackNaoApostado').style.display = 'block';
        return;
    }

    // Caso a aposta seja bem-sucedida exibe o feedback de sucesso...
    document.querySelector('.feedbackApostado').textContent = result;
    document.querySelector('.feedbackApostado').style.display = 'block';
}