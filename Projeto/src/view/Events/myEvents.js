const apiBaseUrl = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", async () => {

    // Redireciona para a página de Cadastro ao clicar em "Sair"...
    document.getElementById('signUpButton').addEventListener('click', openSignUpPage);

    // Redireciona para a página de Home ao clicar em "Voltar"...
    document.getElementById('voltar').addEventListener('click', goBack);

});

// Redireciona o usuario para o signUp.html...
function openSignUpPage(){
    sessionStorage.clear();
    setTimeout(() => {
        window.location.href = `../Accounts/signUp.html`;
    }, 500);
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


// Função para apagar o evento
async function apagarEvento(idEvento) {

    const token = sessionStorage.getItem('sessionToken');
    const idUsuario = sessionStorage.getItem('idUsuario');
    if (!token || !idUsuario) {
        alert('nao autenticado!');
    }

    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/deleteEvent/${idEvento}/${idUsuario}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'authorization': token
        },

    });

    const result = await response.text();
    if (!response.ok) {
        alert(result);
        document.querySelector('.list-group').innerHTML = ''
        const lista = document.querySelector('.list-group');
        const li = document.createElement('div');
        li.innerHTML = `
           <div class="feedbackNaoEncontrado">
                <p>Ocorreu um erro ao excluir, tente novamente mais tarde!</p>
           </div>
        `;
        lista.appendChild(li);
        return;
    }

    document.querySelector('.list-group').innerHTML = ''
    const lista = document.querySelector('.list-group');
    const li = document.createElement('div');
    li.innerHTML = `
            <div class="feedbackNaoEncontrado">
                <p>O evento foi excluido com sucesso!</p>
            </div>
        `;
    lista.appendChild(li);
}


async function inserirEventosNasLinhas(eventos){
    eventos.forEach(evento => {
        const lista = document.querySelector('.list-group');
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.className = 'list-group-item d-flex justify-content-between align-items-center bg-dark text-white border-secondary';

        // Verifica se o evento pode ser excluido e dependendo adiciona o botao de deletar...
        const podeExcluir = (evento.status_evento === 'pendente' || evento.status_evento === 'aprovado') && evento.qtd_apostas === 0;

        li.innerHTML = `
            ${evento.titulo}
            <div class="d-flex align-items-center">
                <span class="badge ${evento.status_evento} rounded-pill me-3">${evento.status_evento}...</span>
                <span class="badge bg-info rounded-pill me-3">${formataDataSimples(evento.data_evento)}</span>
                ${podeExcluir ? `
                    <button class="btn btn-danger btn-sm delete-btn">
                        <i class="bi bi-trash"></i>
                    </button>
                ` : ''}
            </div>
        `;
        lista.appendChild(li);

        // Adiciona o evento de clique ao botão delete, se existir e apaga o evento
        if (podeExcluir) {
            li.querySelector('.delete-btn').addEventListener('click', () => {
                apagarEvento(evento.id_evento);
            });
        }
    });
}

async function carregarLinhaEventos(){
    // Captura as informações guardadas na sessionStorage...
    const token = sessionStorage.getItem('sessionToken');
    const idUsuario = sessionStorage.getItem('idUsuario');

    // Caso o usuario nao tenha logado...Ele é redirecionado para a pagina de nao autenticado...
    if (!token || !idUsuario) {
        window.location.href = `../errorPages/401.html`;
    }

    // Consome da API...
    const response = await fetch(`${apiBaseUrl}/getAllEventsUser/${idUsuario}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': token,
        },
    });

    //Caso não haja eventos...
    if (!response.ok) {
        const lista = document.querySelector('.list-group');
        const li = document.createElement('div');
        li.innerHTML = `
            <div class="feedbackNaoEncontrado">
                <p>Nenhum evento encontrado!</p>
            </div>
        `;
        lista.appendChild(li);
        return;
    }

    inserirEventosNasLinhas(await response.json());
}
window.onload = carregarLinhaEventos();


// Volta para a Home
function goBack() {
    //verifica se há um token armazenado
    const token = sessionStorage.getItem('sessionToken');
    
    if (token) {
        //redireciona mantendo a sessão do usuário
        setTimeout(() => {
            window.history.back(); // Volta para a página anterior
        }, 500);
    } else {
        //caso não haja token, limpa tudo e redireciona para login
        sessionStorage.clear();
        setTimeout(() => {
            window.location.href = '../Accounts/signUp.html';
        }, 500);
    }
}