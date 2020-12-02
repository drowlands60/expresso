const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

db.serialize( () => {
    db.run('DROP TABLE IF EXISTS Employee', err => {
        if(err){
            throw(err);
        }
    });

    db.run(`CREATE TABLE Employee (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            position TEXT NOT NULL,
            wage INTEGER NOT NULL,
            is_current_employee INTEGER DEFAULT 1)`,
            error => console.log(error)
        );
    }
);

db.serialize( () => {
    db.run('DROP TABLE IF EXISTS Timesheet', err => {
        if(err){
            throw(err);
        }
    });

    db.run(`CREATE TABLE Timesheet (
            id INTEGER NOT NULL,
            hours INTEGER NOT NULL,
            rate INTEGER NOT NULL,
            date INTEGER NOT NULL,
            employee_id INTEGER NOT NULL,
            PRIMARY KEY ('id'),
            FOREIGN KEY ('employee_id') REFERENCES Employee('id'))`,
            error => console.log(error)
        );
    }
);

db.serialize( () => {
    db.run(`DROP TABLE IF EXISTS Menu`, err => {
        if(err) {
            throw(err);
        }
    });

    db.run(`CREATE TABLE Menu (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL)`,
        error => console.log(error) 
    );
});

db.serialize( () => {
    db.run(`DROP TABLE IF EXISTS MenuItem`, err => {
        if(err) {
            throw(err);
        }
    });

    db.run(`CREATE TABLE MenuItem (
        id INTEGER NOT NULL, 
        name TEXT NOT NULL,
        description TEXT,
        inventory INTEGER NOT NULL,
        price INTEGER NOT NULL,
        menu_id INTEGER NOT NULL,
        PRIMARY KEY ('id'), 
        FOREIGN KEY ('menu_id') REFERENCES Menu('id'))`,
        error => console.log(error)
    );
});