import { Router } from 'express';
import { contasHandler } from '../controllers/ContasController';

const route: Router = Router();

// Rotas para autenticação
route.post('/signUp', contasHandler.signUpHandler);
route.post('/login', contasHandler.loginHandler);

export default route;
