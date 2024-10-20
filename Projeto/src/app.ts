import express from 'express';
import contasRoutes from './routes/contasRoutes';
import eventosRoutes from "./routes/eventosRoutes";
import carteiraRoutes from "./routes/carteiraRoutes";

const app = express();
app.use(express.json());

app.use(contasRoutes);
app.use(eventosRoutes);
app.use(carteiraRoutes);

export default app;