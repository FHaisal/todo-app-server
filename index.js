const express = require('express');
const database = require('./config/database');

const port = 5000;

const app = express();

database();

app.use(express.json({ extended: false }));

app.use('/users', require('./routes/users'));
app.use('/todos', require('./routes/todos'));

app.listen(port, () => {
  console.log(`Todo Server listening at http://localhost:${port}`);
});