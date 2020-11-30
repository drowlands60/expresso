const express = require('express');
const menuRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


menuRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Menu;`, function(err, rows) {
        if (err) {
            next(err);
        } else {
          res.status(200).send({menus: rows});
        }
    });
});

module.exports = menuRouter;