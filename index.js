const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const db = require('./config/db');
const UserRoutes = require('./routes/UserRoutes');
const TransactionRoutes = require('./routes/TransactionsRoutes');

app.use(bodyParser.json());
app.use(cors());

mongoose.connect(`mongodb://${db.host}:${db.port}/${db.database}`, { useUnifiedTopology: true, useNewUrlParser: true }, (err, conn) => {
    err ? console.log({ message: 'Fail connecting to database', error: err }) : console.log('Database successfully connected');
});

app.use(UserRoutes);
app.use(TransactionRoutes);

app.listen(3000, () => {
    console.log("Server Run");
});