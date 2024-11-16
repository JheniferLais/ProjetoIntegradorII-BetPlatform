const apiBaseUrl = 'http://localhost:3000';

function openSignUpPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `${apiBaseUrl}/signUp`;
    }, 500);
}

function openWalletPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `${apiBaseUrl}/wallet`;
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
    if (value.length > 4) value = value.slice(0, 4) + '/' + value.slice(4);
    if (value.length > 7) value = value.slice(0, 7) + '/' + value.slice(7);
    if (value.length > 10) value = value.slice(0, 10) + ' ' + value.slice(10); // Adiciona espaço entre data e hora
    if (value.length > 13) value = value.slice(0, 13) + ':' + value.slice(13);
    if (value.length > 16) value = value.slice(0, 16) + ':' + value.slice(16);

    input.value = value;
}


document.addEventListener("DOMContentLoaded", () => {
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

    // Aplica formatação de data e hora em campos específicos quando o usuário digitar
    const dateTimeInputs = document.querySelectorAll('#inputDataHoraInicio, #inputDataHoraFim');
    dateTimeInputs.forEach(input => {
        input.addEventListener('input', () => formatDateTime(input));
    });
});
