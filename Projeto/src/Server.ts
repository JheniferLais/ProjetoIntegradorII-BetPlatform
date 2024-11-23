import app from './App';

export const port = 3000;

app.listen(port, ():void => {
    console.log(`🚀 Servidor Backend Wager rodando em http://localhost:${port}`);
    console.log('🚀 Servidor Frontend Wager rodando em http://localhost:63342/wager/Projeto/src/view/Home/home.html');
});