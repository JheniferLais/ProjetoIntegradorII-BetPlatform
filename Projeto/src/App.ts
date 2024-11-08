import express from 'express';
import contasRoutes from './routes/AccountsRoute';
import eventosRoutes from "./routes/EventsRoute";
import carteiraRoutes from "./routes/WalletRoute";
import apostaRoute from "./routes/BetRoute";

const app = express();
app.use(express.json());

app.use(contasRoutes);
app.use(eventosRoutes);
app.use(carteiraRoutes);
app.use(apostaRoute);

export default app;