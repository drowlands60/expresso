const express = require('express');
const employeeRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetRouter = require('./timesheets');

employeeRouter.param('employeeId', (req, res, next, id) => {
    db.get('SELECT * FROM Employee WHERE id = $id', 
    {$id: id},
    (err, row) => {
        if(err){
            next(err);
        } else if(row) {
            req.employee = row;
            next();
        } else {
            res.status(404).send();
        }
    });
});

employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

employeeRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (err, rows) => {
        if(err){
            next(err);
        }else {
            res.status(200).send({employees: rows});
        }
    });
});

employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).send({employee: req.employee});
      
});

employeeRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const employed = req.body.employee.is_current_employee === 0 ? 0 : 1;

    if(!name || !position || !wage){
        return res.status(400).send();
    };

    const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $employed)';
    const values = {$name: name, $position: position, $wage: wage, $employed: employed};

    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, row) => {
                res.status(201).send({employee: row});
            });
        }
    });
});



employeeRouter.put('/:employeeId', (req, res, next) => {
    //const id = req.params.employeeId;
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    let employed = req.body.employee.is_current_employee;
    
    
    
    if (employed === 0) {
        employed = 0;
    } else {
        employed = 1;
    };
    
    if(!name || !position || !wage){
        return res.status(400).send();
    }

    const sql = `UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $employed WHERE id = $id`;
    const values = {$id: req.params.employeeId, $name: name, $position: position, $wage: wage, $employed: employed};
    db.run(sql, values, err => {
        if(err){
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, row) => {
                res.status(200).send({employee: row});
            });
        }
    }); 

});

employeeRouter.delete('/:employeeId', (req, res, next) => {
    const id = req.params.employeeId;
    const sql = `UPDATE Employee SET is_current_employee = 0 WHERE id = $id`;
    values = {$id: id};

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${id}`, (err, row) => {
                res.status(200).send({employee: row});
        
            });
        }
    });
    
});

module.exports = employeeRouter;

