import { Router } from 'express';
import { contasHandler } from '../controllers/contasController';

const route: Router = Router();

// Rotas para autenticação
route.put('/signUp', contasHandler.signUpHandler);
route.post('/login', contasHandler.loginHandler);

export default route;
