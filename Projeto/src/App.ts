import express from 'express';
import cors from 'cors';
import path from 'path';
import contasRoutes from './routes/AccountsRoute';
import eventosRoutes from "./routes/EventsRoute";
import carteiraRoutes from "./routes/WalletRoute";
import apostaRoute from "./routes/BetRoute";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'view')));
app.use(express.static(path.join(__dirname, 'view', 'Accounts')));

// Rota home
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'Home', 'home.html'));
});

// Rota signUp
app.get('/signUp', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'Accounts', 'signUp.html'));
});

// Rota signIn
app.get('/signIn', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'Accounts', 'signIn.html'));
});

app.get('/wallet', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'Wallet', 'wallet.html'));
})

app.use(contasRoutes);
app.use(eventosRoutes);
app.use(carteiraRoutes);
app.use(apostaRoute);

export default app;