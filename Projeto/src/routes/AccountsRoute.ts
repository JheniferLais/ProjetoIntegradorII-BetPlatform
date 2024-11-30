import { Router } from 'express';
import { contasHandler } from '../controllers/AccountsController';
import { Request, Response } from 'express';

const route: Router = Router();

route.get('/', (req: Request, res: Response)=>{
    res.statusCode = 403;
    res.send('Acesso não permitido.');
});

// Rotas para autenticação
route.post('/signUp', contasHandler.signUpHandler);
route.post('/signIn', contasHandler.signInHandler);

export default route;
