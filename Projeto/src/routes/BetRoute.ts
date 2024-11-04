import { Router } from 'express';
import { apostasHandler } from '../controllers/BetsController';
import { tokenUtils } from "../utils/TokenUtils";
import { moderadorUtils } from "../utils/ModeratorUtils";

const route: Router = Router();

route.post('/betOnEvent/:idEvento/:id', tokenUtils.checkToken, apostasHandler.betOnEvent);
route.get('/finishEvent/:idEvento/:id', tokenUtils.checkToken, moderadorUtils.checkModerador, apostasHandler.finishEvent); // Apenas moderadores

export default route;