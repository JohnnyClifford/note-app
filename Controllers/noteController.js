// controllers/noteController.js
const Note = require('../models/Note');

const getAllNotes = (req, res) => {
  res.json(Note.getAll());
};

const getNoteById = (req, res) => {
  const note = Note.getById(parseInt(req.params.id));
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.json(note);
};

const createNote = (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  const newNote = Note.create(title, content);
  res.status(201).json(newNote);
};

const updateNote = (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  const updated = Note.update(parseInt(req.params.id), title, content);
  if (!updated) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.json(updated);
};

const deleteNote = (req, res) => {
  const deleted = Note.remove(parseInt(req.params.id));
  if (!deleted) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.status(204).send();
};

module.exports = { getAllNotes, getNoteById, createNote, updateNote, deleteNote };