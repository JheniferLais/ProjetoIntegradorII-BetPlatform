import express from 'express';
import { Router, Request, Response } from 'express';
//
const app = express();
const route = Router();
const port = 3000;
//
app.use(express.json());
//
route.get('/', (req: Request, res: Response) => {
    res.send('Projeto Integrador 2: Casa de Apostas WAGER');
})
//
app.use(route);
app.listen(port, () => console.log(`Servidor rodando na porta: ${port}`));