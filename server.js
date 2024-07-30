// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid'); // Use this for unique IDs

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the notes page
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// Get all notes
app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Failed to read notes' });
      return;
    }
    res.json(JSON.parse(data));
  });
});

// Save a new note
app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  newNote.id = uuid.v4(); // Assign a unique ID to the note

  fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Failed to read notes' });
      return;
    }
    const notes = JSON.parse(data);
    notes.push(newNote);
    fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to save note' });
        return;
      }
      res.json(newNote);
    });
  });
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;

  fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Failed to read notes' });
      return;
    }
    let notes = JSON.parse(data);
    notes = notes.filter(note => note.id !== id);

    fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to delete note' });
        return;
      }
      res.json({ message: 'Note deleted' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
