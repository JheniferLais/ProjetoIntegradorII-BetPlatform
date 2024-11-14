function openSignupPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = "signUp";
    }, 500);
}

function openPopUpCadastraraEvento(){
    const popup = document.querySelector('.popup-cadastro-evento');
    const blur = document.querySelector('.blur');
    if(popup && blur){
        popup.style.display = 'flex';
        blur.style.display = 'block';
    }
}

function closePopUpCadastraraEvento(){
    const popup = document.querySelector('.popup-cadastro-evento');
    const blur = document.querySelector('.blur');
    if(popup && blur){
        popup.style.display = 'none';
        blur.style.display = 'none';
    }
}

function gotoEvent(){
    window.location.href = 'event';
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