// models/Note.js
let notes = [];
let nextId = 1;

const getAll = () => [...notes];

const getById = (id) => notes.find(note => note.id === id);

const create = (title, content) => {
  const newNote = { id: nextId++, title, content };
  notes.push(newNote);
  return newNote;
};

const update = (id, title, content) => {
  const index = notes.findIndex(note => note.id === id);
  if (index === -1) return null;
  notes[index] = { ...notes[index], title, content };
  return notes[index];
};

const remove = (id) => {
  const index = notes.findIndex(note => note.id === id);
  if (index === -1) return false;
  notes.splice(index, 1);
  return true;
};

module.exports = { getAll, getById, create, update, remove };