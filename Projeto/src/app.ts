import express from 'express';
import AccountsHandlerRoutes from './routes/contasRoutes';
import eventsHandlerRoutes from "./routes/eventosRoutes";

const app = express();
app.use(express.json());

app.use(AccountsHandlerRoutes);
app.use(eventsHandlerRoutes);

export default app;