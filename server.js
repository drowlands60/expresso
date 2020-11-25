const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorHandler = require('errorhandler');
const apiRouter = require('./api/api')

const app = express();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

app.use(bodyParser.json());
app.use(cors());

app.use('/api', apiRouter);

app.use(errorHandler());
app.use(morgan('dev'));

module.exports = app;
