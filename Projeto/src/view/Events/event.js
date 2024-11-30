const apiBaseUrl = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded",  () => {

    // Redireciona para a página de Home ao clicar em "Voltar"...
    document.getElementById('homeLink').addEventListener('click', openHomePage);

    // Redireciona para a página da Carteira ao clicar na seção de saldo...
    document.getElementById('walletLink').addEventListener('click', openWalletPage);

    // Esconder os feedbacks de sucesso e/ou erro quando o usuário interagir com os campos do formulário..
    document.querySelectorAll('#formAposta input').forEach(field => {
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


// Faz a formatação de data com horario em formato '2024-02-21T12:30:00' para '21/02/2024 12:30:00'...
function formataDataHora(dataHora) {
    const dataH = new Date(dataHora);

    // Insere os valores individuais de dia, mes, ano, hora, minuto e segundo em variaveis...
    const dia = String(dataH.getDate()).padStart(2, '0');
    const mes = String(dataH.getMonth() + 1).padStart(2, '0');
    const ano = dataH.getFullYear();

    const hora = String(dataH.getHours()).padStart(2, '0');
    const minuto = String(dataH.getMinutes()).padStart(2, '0');
    const segundo = String(dataH.getSeconds()).padStart(2, '0');

    // Monta a data no formato dd/mm/yy hh:mm:ss...
    return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
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


// Faz a formatação de valor de 123456.78 para 123.456,78
function formatarValor(valor) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(valor);
}


// Função para inserir dinamicamente os eventos na grade...
function carregarDadosDoEvento(objetoEvento) {

    // Define o conteúdo dinâmico da parte ESQUERDA do container...
    const eventoContainerLeft = document.querySelector('.container-left');
    const infoEventoLeft = document.createElement('div');
    infoEventoLeft.classList.add('container-left');
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
                <p>Data do evento: <strong>${formataDataSimples(objetoEvento.data_evento)}</strong></p>
            </div>
            <div class="encerramento">
                <i class="fa-regular fa-clock"></i>
                <p>Inicio das apostas: <strong>${formataDataHora(objetoEvento.data_hora_inicio)}</strong></p>
            </div>
            <div class="encerramento">
                <i class="fa-regular fa-clock"></i>
                <p>Encerramento das apostas: <strong>${formataDataHora(objetoEvento.data_hora_fim)}</strong></p>
            </div>
        </div>
    `;
    eventoContainerLeft.appendChild(infoEventoLeft);


    // Define o conteúdo dinâmico da parte DIREITA do container...
    const eventoContainerRight = document.querySelector('.container-right');
    const infoEventoRight = document.createElement('div');
    infoEventoRight.classList.add('container-right');
    infoEventoRight.innerHTML = `
        <div class="valor-cota">
            <p>Valor da Cota: <strong id="valor-cota-valor">R$ ${formatarValor(objetoEvento.valor_cota)}</strong></p>
        </div>
        <div class="container-cota-aposta">
            <form id="formAposta" method="POST">
                <div class="selecionar-num-cota">
                    <label for="inputNumCotas">Quantidade de Cotas:</label>
                    <input id="inputNumCotas" name="numcotas" class="form-control" 
                           type="number" min="1" step="1" placeholder="Digite o número de cotas" required>
                    <p id="valorTotal" style="margin-top: 10px;">Total: R$ 0,00</p>
                </div>

                <div class="aposta">
                    <input name="simounao" type="radio" id="btnNao" value="nao" class="btnRadio">
                    <label for="btnNao" class="btn-label nao">Não</label>
                    
                    <input name="simounao" type="radio" id="btnSim" value="sim" class="btnRadio">
                    <label for="btnSim" class="btn-label sim">Sim</label>
                </div>

                <div class="container-btn-apostar">
                    <input id="apostar" type="submit" class="btn-apostar" value="Apostar" onclick="handleBetFormSubmission(event)">
                </div>
                <p class="feedbackApostado"></p>
                <p class="feedbackNaoApostado"></p>
            </form>
        </div>
    `;
    eventoContainerRight.appendChild(infoEventoRight);


    // Adiciona um evento ao input da quantidade de cotas...
    document.getElementById('inputNumCotas').addEventListener('input', () => {
        // Calcula o valor total a ser pago...
        const total = document.getElementById('inputNumCotas').value * objetoEvento.valor_cota;

        // Atualiza o valor a ser pago...
        document.getElementById('valorTotal').textContent = `Total: R$ ${formatarValor(total)}`;
    });
}
async function buscarEvento() {

    // Captura as informações guardas da sessionStorage...
    const idUsuario = sessionStorage.getItem('idUsuario');
    const token = sessionStorage.getItem('sessionToken');

    // Caso o usuario nao tenha logado...Ele é redirecionado para a pagina de nao autenticado...
    if (!token || !idUsuario) {
        window.location.href = `../errorPages/401.html`;
    }

    // Insere o nome do usuario no header
    document.querySelector('.balance').style.display = 'flex';

    // Consome da API para obter informações da carteira do usuário...
    const response1 = await fetch(`${apiBaseUrl}/getAllWalletInformation/${idUsuario}`, {
        method: 'GET',
        headers: {
            'authorization': token,
        },
    });

    // Valida se ocorreu algum erro e retorna...
    if (!response1.ok) {
        alert('Ocorreu um erro ao carregar seus dados!');
        return;
    }

    // Saldo recebe a response do backend...
    const saldo = await response1.json();

    // Mostra o valor do saldo do usuario no wallet home...
    const balanceElement = document.getElementById('balance-value');
    const valorFormatado = formatarValor(saldo.saldo);
    balanceElement.textContent = valorFormatado + ' BRL';

    // Captura as informações guardas da URL...
    const params = new URLSearchParams(window.location.search);
    const idEvento = params.get('idEvento');

    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/getAllInformationEvent/${idEvento}/${idUsuario}`, {
        method: 'GET',
        headers: {
            'authorization': token,
        },
    });

    //Se a pagina do evento não existir...Ele é redirecionado para a pagina de nao encontrado...
    if(!response.ok) {
        window.location.href = `../errorPages/404.html`;
    }

    //Chama a funçao para carregar os dados...
    carregarDadosDoEvento(await response.json());
}
window.onload = buscarEvento;

async function handleBetFormSubmission(event) {
    event.preventDefault();

    // Captura o parâmetros idEvento da URL atual
    const params = new URLSearchParams(window.location.search);
    const idEvento = params.get('idEvento');

    // Captura as informações guardas da sessionStorage...
    const token = sessionStorage.getItem('sessionToken');
    const idUsuario = sessionStorage.getItem('idUsuario');
    const emailUsuario = sessionStorage.getItem('emailUsuario');

    // Captura os valores de input do formulario...
    const qtdCotas = document.getElementById('inputNumCotas').value;
    const aNao = document.getElementById('btnNao').checked;
    const aSim = document.getElementById('btnSim').checked;

    const headers = {
        'Content-Type': 'application/json',
        'email': emailUsuario,
        'qtd_cotas': qtdCotas,
        'authorization': token,
    };

    if(aNao){
        headers.aposta = 'nao';
    } else if (aSim) {
        headers.aposta = 'sim';
    } else if (!aNao && !aSim) {
        alert('Escolha uma opção')
        return;
    } else{
        alert('Apenas um valor de cada vez...')
        return;
    }

    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/betOnEvent/${idEvento}/${idUsuario}`, {
        method: 'POST',
        headers: headers,
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
    setTimeout(() => {
        location.reload();
    }, 1200);
}