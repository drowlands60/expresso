const e = require('express');
const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetRouter = express.Router();

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
    const id = req.body.timesheet.id;
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.body.timesheet.employee_id;

    if(!id|| !hours || !rate || !date || !employeeId) {
        return res.status(400).send();
    }

    const sql = `INSERT INTO Timesheet (id, hours, rate, date, employee_id) VALUES ($id, $hours, $rate, $date, $employeeId)`;
    const values = {$id: id, $hours: hours, $rate: rate, $date: date, $employeeId: employeeId};

    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, row) => {
                res.status(200).send({timesheet: row});
            })
        }
        
    })
});

timesheetRouter.put('/:timesheetId', (req, res, next) => {
    const id = req.body.timesheet.id;
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.body.timesheet.employee_id;

    if(!id|| !hours || !rate || !date || !employeeId) {
        return res.status(400).send();
    }


    db.serialize( () => {
        db.all(`SELECT * FROM Employee WHERE id =$employeeId`,
            {$employeeId: employeeId},
            (err, row) => {
                if(err){
                    next(err);
                } else if (!row) {
                    return res.status(404).send();
                }
            }
        );

        db.all(`SELECT * FROM Timesheet WHERE id =$timesheetId`,
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
        (err) => {
            if(err){
                next(err);
            }
        });

        db.all(`SELECT * FROM Timesheet WHERE id =$timesheetId`,
        {$timesheetId: id},
        (err, row) => {
            if(err){
                next(err);
            }
            if (row) {
                res.status(200).send(row);
            }
        });
    });
});

module.exports = timesheetRouter;