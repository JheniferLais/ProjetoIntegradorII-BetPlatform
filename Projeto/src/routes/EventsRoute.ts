import { Router } from 'express';
import { eventosHandler } from "../controllers/EventsController";
import { tokenUtils } from "../utils/TokenUtils";
import { moderadorUtils } from "../utils/ModeratorUtils";

const route: Router = Router();

route.post('/addNewEvent/:id', tokenUtils.checkToken, eventosHandler.addNewEvent);
route.get('/getEvent', eventosHandler.getEvent);
route.delete('/deleteEvent/:idEvento/:id', tokenUtils.checkToken, eventosHandler.deleteEvent);
route.post('/evaluateNewEvent/:idEvento/:id', tokenUtils.checkToken, moderadorUtils.checkModerador, eventosHandler.evaluateNewEvent); // Apenas moderadores
route.get('/searchEvent', eventosHandler.searchEvent);

export default route;