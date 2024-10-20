import { Router } from 'express';
import { carteiraHandler } from '../controllers/carteiraController';
import { tokenUtils } from "../utils/tokenUtils";

const route: Router = Router();

route.post('/addFunds/:id', tokenUtils.checkToken, carteiraHandler.addFunds);
route.post('/withdrawFunds/:id', tokenUtils.checkToken, carteiraHandler.withdrawFunds);

export default route;