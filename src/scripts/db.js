const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { ipcRenderer } = require('electron');

let db

ipcRenderer.invoke('get-db').then((value) => {
    db = new sqlite3.Database(value, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the SQLite database at:', value);
        }
    });
});
