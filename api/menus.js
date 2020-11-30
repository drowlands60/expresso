const express = require('express');
const menuRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


menuRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu', (err, rows) => {
        if (err) {
            next(err);
        } else {
           res.status(200).send({menus: rows});
        }
    });
});

menuRouter.get('/:menuId', (req, res, next) => {
    db.get('SELECT * FROM Menu WHERE id = $id',
    {$id: req.params.menuId},
     (err, row) => {
        if (err) {
            next(err);
        } else if (!row) {
            res.status(404).send();
        } else {
            res.status(200).send({menu: row});
        }
    });
});

menuRouter.post('/', (req, res, next) => {
    const text = req.body.menu;
    if(!text) {
        return res.status(400).send();
    }

    db.run(`INSERT INTO Menu (text) VALUES ($text)`,
        {$text: text}, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, row) => {
                res.status(201).send({menu: row});
            });
        }
    });
});

module.exports = menuRouter;