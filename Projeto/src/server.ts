import app from './app';

const port = 3000;

app.listen(port, ():void => {
    console.log(`Servidor rodando na porta: ${port}`);
});