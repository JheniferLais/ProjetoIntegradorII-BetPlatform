import { Router } from 'express';
import { contasHandler } from '../controllers/AccountsController';

const route: Router = Router();

// Rotas para autenticação
route.post('/signUp', contasHandler.signUpHandler);
route.post('/signIn', contasHandler.signInHandler);

export default route;
