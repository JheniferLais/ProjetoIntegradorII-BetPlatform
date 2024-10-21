import express from 'express';
import contasRoutes from './routes/ContasRoute';
import eventosRoutes from "./routes/EventosRoute";
import carteiraRoutes from "./routes/CarteiraRoute";
import apostaRoute from "./routes/ApostaRoute";

const app = express();
app.use(express.json());

app.use(contasRoutes);
app.use(eventosRoutes);
app.use(carteiraRoutes);
app.use(apostaRoute)

export default app;