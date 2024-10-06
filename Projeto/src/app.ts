import express from 'express';
import contasRoutes from './routes/contasRoutes';
import eventosRoutes from "./routes/eventosRoutes";

const app = express();
app.use(express.json());

app.use(contasRoutes);
app.use(eventosRoutes);

export default app;