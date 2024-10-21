import express from 'express';
import contasRoutes from './routes/ContasRoute';
import eventosRoutes from "./routes/EventosRoute";
import carteiraRoutes from "./routes/CarteiraRoute";

const app = express();
app.use(express.json());

app.use(contasRoutes);
app.use(eventosRoutes);
app.use(carteiraRoutes);

export default app;