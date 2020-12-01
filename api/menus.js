const express = require('express');
const menuRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuRouter.param('menuId', (req, res, next, id) => {
    db.get('SELECT * FROM Menu WHERE id = $id',
    {$id: id},
    (err, row) => {
        if (err) {
            next(err);
        } else if (!row) {
             res.status(404).send();
        } else {
            req.menu = row;
            next();
        }
    });
});

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
    res.status(200).send({menu: req.menu});
});

menuRouter.post('/', (req, res, next) => {
    const text = req.body.menu;
    if(!text) {
        return res.status(400).send();
    }

    db.run(`INSERT INTO Menu (text) VALUES ($text)`,
        {$text: text}, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, row) => {
                res.status(201).send({menu: row});
            });
        }
    });
});

menuRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    const id = req.body.menu.id;

    if (!title) {
        res.status(400).send();
    }

    const sql = `UPDATE Menu SET title = $title WHERE id = $id`;
    const values = {$title: title, $id: id};

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, row) => {
                res.status(200).send({menu: row});
            });
        }
    });

});

menuRouter.delete('/:menuid', (req, res, next) => {
    
    const id = req.body.menu.id;
    
    db.all(`SELECT * FROM MenuItem WHERE menu_id = $id`,
    {$id: id},
    (err, rows) => {
        if (err) {
            next(err);
        } else if (rows) {
            res.status(400).send();
        } else {
            db.run(`DELETE FROM Menu WHERE id = $id`,
            {$id: id},
            (err) => {
                if (err) {
                    next(err);
                } else {
                    res.status(204).send();
                }
            })
        }
    });
});

module.exports = menuRouter;