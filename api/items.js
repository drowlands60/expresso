const express = require('express');
const itemRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

itemRouter.param('menuItemId', (req, res, next, id) => {
    db.get('SELECT * FROM MenuItem WHERE id = $id', 
        {$id: id},
        (err, row) => {
            if(err) {
                next(err);
            } else if (!row) {
                res.status(404).send();
            } else {
                next();
            }
        });
});

itemRouter.get('/', (req, res, next) => {
        db.all('SELECT * FROM MenuItem WHERE menu_id = $menuId',
        {$menuId: req.body.menu.id},
        (err, rows) => {
            if(err) {
                next(err);
            } else { 
                res.status(200).send({menuItems: rows})
            }
        });
    
});

itemRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory  = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.body.menuItem.menu_id;

    if (!name || !description || !inventory || !price || !menuId) {
        res.status(400).send();
    }
    
    const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)`;
    const values = {$name: name, $description: description, $inventory: inventory, $price: price, $menuId: menuId};

    db.run(sql, values, function(err){
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE menu_id = ${this.lastID}`,
            (err, row) => {
                res.status(201).send({menuItem: row});
            });
        }
    });
});

itemRouter.put('/:menuItemId', (req, res, next) => {
    const id = req.body.menuItem.id;
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory  = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.body.menuItem.menu_id;

    if (!name || !description || !inventory || !price || !menuId) {
        res.status(400).send();
    }

    const sql = `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $id`;
    const values = {$name: name, $description: description, $inventory: inventory, $price: price, $menuId: menuId, $id: id};
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, row) => {
                res.status(200).send({menuItem: row});
            })
        }
    });
});

itemRouter.delete('/:menuItemId', (req, res, next) => {
    db.run(`DELETE * FROM MenuItem WHERE id = $id`, 
    {$id: req.body.menuItem.id}),
    (err) => {
        if (err) {
            next(err);
        } else {
            res.status(204).send();
        }
    }
});


module.exports = itemRouter;