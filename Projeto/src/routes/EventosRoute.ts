import { Router } from 'express';
import { eventosHandler } from "../controllers/EventosController";
import { tokenUtils } from "../utils/TokenUtils";

const route: Router = Router();

route.post('/addNewEvent/:id', tokenUtils.checkToken, eventosHandler.addNewEvent);
route.get('/getEvent', eventosHandler.getEvent);
route.delete('/deleteEvent/:idEvento/:id', tokenUtils.checkToken, eventosHandler.deleteEvent);
route.post('/evaluateNewEvent/:idEvento/:id', tokenUtils.checkToken, eventosHandler.evaluateNewEvent); //somente moderadores
route.get('/searchEvent', eventosHandler.searchEvent);

export default route;