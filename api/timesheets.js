const express = require('express');
const timesheetRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetRouter.param('timesheetId', (req, res, next, id) => {
    db.get('SELECT * FROM Timesheet WHERE id = $id', 
    {$id: id},
    (err, row) => {
        if (err) {
            next(err);
        } else if (!row) {
            res.status(404).send();
        } else {
            req.timesheet = row;
            next();
        }
    });
});

timesheetRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Timesheet WHERE employee_id = $id', 
    {$id: req.employee.id},
    (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).send({timesheets: rows});
        }
    });
});

timesheetRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.employee.id;


    if(!hours || !rate || !date) {
        return res.status(400).send();
    }

    const sql = `INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)`;
    const values = {$hours: hours, $rate: rate, $date: date, $employeeId: employeeId};

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, row) => {
                res.status(201).send({timesheet: row});
            });
        }
        
    });
});

timesheetRouter.put('/:timesheetId', (req, res, next) => {
    const id = req.timesheet.id;
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.timesheet.employee_id;


    if(!hours || !rate || !date) {
        return res.status(400).send();
    }


    db.serialize( () => {
        db.all(`SELECT * FROM Employee WHERE id = $employeeId`,
            {$employeeId: employeeId},
            (err, row) => {
                if(err){
                    next(err);
                } else if (!row) {
                    return res.status(404).send();
                }
            }
        );

        db.all(`SELECT * FROM Timesheet WHERE id = $timesheetId`,
        {$timesheetId: id},
        (err, row) => {
            if(err){
                next(err);
            } else if (!row) {
                return res.status(404).send();
            }
        }
        );

        db.run(`UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $timesheetId`, 
        {$hours: hours, $rate: rate, $date: date, $employeeId: employeeId, $timesheetId: id},
        function(err)  {
            if(err){
                next(err);
            }
        });

        db.get(`SELECT * FROM Timesheet WHERE id = $timesheetId`,
        {$timesheetId: id},
        (err, row) => {
            if(err){
                next(err);
            }
            if (row) {
                res.status(200).send({timesheet: row});
            }
        });
    });
});

timesheetRouter.delete('/:timesheetid', (req, res, next) => {

    const id = req.params.timesheetid;
    const employeeId = req.employee.id;
      
    db.serialize( () => {
        
       db.get(`SELECT * FROM Timesheet WHERE id = $timesheetId`,
            {$timesheetId: id},
            (err, row) => {
                if(err){
                    next(err);
                } else if (!row) {
                    return res.status(404).send();
                }
            });
       
        db.get(`SELECT * FROM Employee WHERE id = $employeeId`,
                {$employeeId: employeeId},
                (err, row) => {
                    if(err){
                        next(err);
                    } else if (!row) {
                        return res.status(404).send();
                    }
                }
            );

            

        db.run(`DELETE FROM Timesheet WHERE id = $id`,
            {$id: id},
            function(err) {
                if (err) {
                    next(err);
                } else {
                    res.status(204).send();
                }
            })

    });
});

module.exports = timesheetRouter;