import { Router } from 'express';
import { apostasHandler } from '../controllers/ApostasController';
import { tokenUtils } from "../utils/TokenUtils";

const route: Router = Router();

route.post('/betOnEvent/:idEvento/:id', tokenUtils.checkToken, apostasHandler.betOnEvent);


export default route;