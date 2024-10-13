import { Router } from 'express';
import { eventosHandler } from "../controllers/eventosController";

const route: Router = Router();

route.post('/addNewEvent', eventosHandler.addNewEvent);
route.get('/getEvent', eventosHandler.getEvent);
route.put('/deleteEvent/:id', eventosHandler.deleteEvent);
route.put('/evaluateNewEvent/:id', eventosHandler.evaluateNewEvent);


export default route;