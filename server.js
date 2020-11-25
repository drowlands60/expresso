const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorHandler = require('errorhandler');

const app = express();
express PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

app.use(bodyParser.json());
app.use(cors());

app.use('/api', apiRouter);

app.use(errorhandler());
app.use(morgan('dev'));

module.exports = app;
