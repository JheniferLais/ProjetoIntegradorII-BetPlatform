import app from './App';

export const port = 3000;

app.listen(port, ():void => {
    console.log(`🚀 Servidor Backend Wager rodando em http://localhost:${port}`);
});