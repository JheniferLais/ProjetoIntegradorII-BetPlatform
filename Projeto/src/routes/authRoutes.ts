import { Router } from 'express';
import { signUp, login } from '../controllers/authController';

const route = Router();

// Rotas para autenticação
route.put('/signup', signUp);
route.put('/login', login);

export default route;
