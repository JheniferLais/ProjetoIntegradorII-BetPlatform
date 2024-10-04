import { Router } from 'express';
import { eventosHandler } from "../controllers/eventosController";

const route: Router = Router();

route.put('/addNewEvent', eventosHandler.addNewEvent);

export default route;