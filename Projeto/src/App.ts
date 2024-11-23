import express from 'express';
import cors from 'cors';
import contasRoutes from './routes/AccountsRoute';
import eventosRoutes from "./routes/EventsRoute";
import carteiraRoutes from "./routes/WalletRoute";
import apostaRoute from "./routes/BetRoute";

const app = express();
app.use(express.json());
app.use(cors());

app.use(contasRoutes);
app.use(eventosRoutes);
app.use(carteiraRoutes);
app.use(apostaRoute);

export default app;