const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('gym.db');

app.use(bodyParser.json());
app.use(express.static('public'));


db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    date_joined TEXT NOT NULL,
    last_login TEXT,
    last_workout TEXT
  )`);
});


app.post('/add-member', (req, res) => {
  const { name, age, dateJoined, lastLogin, lastWorkout } = req.body;
  console.log('Adding member:', req.body);
  db.run(
    `INSERT INTO members (name, age, date_joined, last_login, last_workout) VALUES (?, ?, ?, ?, ?)`,
    [name, age, dateJoined, lastLogin, lastWorkout],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});


app.get('/get-member', (req, res) => {
  const { id, name } = req.query;
  let query = 'SELECT * FROM members WHERE ';
  const params = [];

  if (id) {
    query += 'id = ?';
    params.push(id);
  } else if (name) {
    query += 'name = ?';
    params.push(name);
  } else {
    return res.status(400).json({ error: 'No query found in the database' });
  }

  db.get(query, params, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

app.delete('/delete-member', (req, res) => {
  const id = req.body.id || req.query.id;
  console.log('Deleting member ID:', id);
  if (!id) {
    return res.status(400).json({ success: false, message: 'No ID provided' });
  }
  db.run(`DELETE FROM members WHERE id = ?`, [id], function(err) {
    if (err) {
      console.error('DB Delete Error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
    if (this.changes > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Member not found' });
    }
  });
});
  

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});