const express = require('express');
const employeeRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetRouter = require('./timesheets');

employeeRouter.param('employeeId', (req, res, next, id) => {
    db.get('SELECT * FROM Employee WHERE Employee.id = $id', 
    {$id: id},
    (err, row) => {
        if(err){
            next(err);
        } else if(row) {
            req.employee = row;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

employeeRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE Employee.is_current_employee = 1', (err, rows) => {
        if(err){
            next(err);
        }else {
            res.status(200).json({employees: rows});
        }
    });
});

employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee});
      
});

employeeRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const employed = req.body.employee.is_current_employee === 0 ? 0 : 1;

    if(!name || !position || !wage){
        return res.sendStatus(400);
    };

    const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $employed)';
    const values = {$name: name, $position: position, $wage: wage, $employed: employed};

    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, (err, row) => {
                res.status(201).json({employee: row});
            });
        }
    });
});



employeeRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    let employed = req.body.employee.is_current_employee === 0 ? 0 : 1;
    
    if(!name || !position || !wage){
        return res.sendStatus(400);
    }

    const sql = `UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $employed WHERE Employee.id = $id`;
    const values = {$name: name, $position: position, $wage: wage, $employed: employed, $id: req.params.employeeId};
    db.run(sql, values, (err) => {
        if(err){
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, row) => {
                res.status(200).json({employee: row});
            });
        }
    }); 
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
    const sql = `UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $id`;
    values = {$id: req.params.employeeId};

    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, row) => {
                res.status(200).json({employee: row});
        
            });
        }
    });
    
});

module.exports = employeeRouter;

