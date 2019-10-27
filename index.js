const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const db = require('./config/db');
const UserRoutes = require('./routes/UserRoutes');
const TransactionRoutes = require('./routes/TransactionsRoutes');
const EvidenceRoutes = require('./routes/EvidenceRoutes');
const InvitationRoutes = require('./routes/InvitationCodeRoutes');

app.use(bodyParser.json());
app.use(cors());

mongoose.connect(`mongodb://${db.host}:${db.port}/${db.database}`, { useUnifiedTopology: true, useNewUrlParser: true }, (err, conn) => {
    err ? console.log({ message: 'Fail connecting to database', error: err }) : console.log('Database successfully connected');
});

app.use(UserRoutes);
app.use(TransactionRoutes);
app.use(EvidenceRoutes);
app.use(InvitationRoutes);

app.listen(3000, () => {
    console.log("Server Run");
});