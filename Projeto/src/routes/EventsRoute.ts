import { Router } from 'express';
import { eventosHandler } from "../controllers/EventsController";
import { tokenUtils } from "../utils/TokenUtils";
import { moderadorUtils } from "../utils/ModeratorUtils";
import {commonUserUtils} from "../utils/commonUserUtils";

const route: Router = Router();

route.post('/addNewEvent/:id', tokenUtils.checkToken, commonUserUtils.checkCommonUser, eventosHandler.addNewEvent);
route.get('/getEvent', eventosHandler.getEvent);
route.delete('/deleteEvent/:idEvento/:id', tokenUtils.checkToken, commonUserUtils.checkCommonUser, eventosHandler.deleteEvent);
route.post('/evaluateNewEvent/:idEvento/:id', tokenUtils.checkToken, moderadorUtils.checkModerador, eventosHandler.evaluateNewEvent); // Apenas moderadores
route.get('/searchEvent/:palavraChave', eventosHandler.searchEvent);
route.get('/getAllEvents', eventosHandler.getAllEvents);

export default route;