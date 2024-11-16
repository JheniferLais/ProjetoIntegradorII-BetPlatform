// Redireciona o usuario para o home
function openHomePage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `${apiBaseUrl}/home`;
    }, 500);
}

// Redireciona o usuario para o signUp
function openSignUpPage(){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `${apiBaseUrl}/signUp`;
    }, 500);
}