import { Router } from 'express';
import { eventosHandler } from "../controllers/EventsController";
import { tokenUtils } from "../utils/TokenUtils";
import { moderadorUtils } from "../utils/ModeratorUtils";
import { commonUserUtils } from "../utils/commonUserUtils";

const route: Router = Router();

route.post('/addNewEvent/:id', tokenUtils.checkToken, commonUserUtils.checkCommonUser, eventosHandler.addNewEvent);
route.get('/getEvent', eventosHandler.getEvent);
route.delete('/deleteEvent/:idEvento/:id', tokenUtils.checkToken, commonUserUtils.checkCommonUser, eventosHandler.deleteEvent);
route.post('/evaluateNewEvent/:idEvento/:id', tokenUtils.checkToken, moderadorUtils.checkModerador, eventosHandler.evaluateNewEvent); // Apenas moderadores
route.get('/searchEvent/:palavraChave', eventosHandler.searchEvent);

route.get('/getAllInformationEvent/:idEvento/:id', tokenUtils.checkToken, commonUserUtils.checkCommonUser, eventosHandler.getAllInformationEvent);
route.get('/getMostBetEvents', eventosHandler.getMostBetEvents);
route.get('/getCategory/:category', eventosHandler.getCategory);
route.get('/getUpcomingEvents', eventosHandler.getUpcomingEvents);
route.get('/getAllEventsUser/:id', tokenUtils.checkToken, commonUserUtils.checkCommonUser, eventosHandler.getAllEventsUser);

export default route;