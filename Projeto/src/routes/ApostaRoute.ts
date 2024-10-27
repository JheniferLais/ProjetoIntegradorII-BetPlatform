import { Router } from 'express';
import { apostasHandler } from '../controllers/ApostasController';
import { tokenUtils } from "../utils/TokenUtils";

const route: Router = Router();

route.post('/betOnEvent/:idEvento/:id', tokenUtils.checkToken, apostasHandler.betOnEvent);
route.get('/finishEvent/:idEvento/:id', tokenUtils.checkToken, apostasHandler.finishEvent);

export default route;