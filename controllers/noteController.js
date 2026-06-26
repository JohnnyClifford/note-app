const Note = require('../models/note');


// Get Notes 

const getAllNotes = async (req, res) => {
  try {
    const { search, tag } = req.query;
    let filter = { userId: req.userId };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tag) {
      filter.tags = { $in: [tag] };
    }
    
    const notes = await Note.find(filter)
      .sort({ pinned: -1, createdAt: -1 }); 
    
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    note.pinned = !note.pinned;
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Create Notes

const createNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    let tagArray = [];
    if (tags && typeof tags === 'string') {
      tagArray = tags.split(',').map(t => t.trim().toLowerCase());
    }
    
    const newNote = await Note.create({ 
      userId: req.userId,
      title, 
      content, 
      tags: tagArray 
    });
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update Notes

const updateNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    let tagArray = [];
    if (tags && typeof tags === 'string') {
      tagArray = tags.split(',').map(t => t.trim().toLowerCase());
    }

    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, tags: tagArray },
      { new: true }
    );
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Notes

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    await Note.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get All Tags

const getAllTags = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId });
    const tags = new Set();
    notes.forEach(note => {
      note.tags.forEach(tag => tags.add(tag));
    });
    res.json(Array.from(tags).sort());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Export Notes

const exportNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId });
    const data = {
      exportedAt: new Date().toISOString(),
      count: notes.length,
      notes: notes.map(n => ({
        title: n.title,
        content: n.content,
        tags: n.tags,
        createdAt: n.createdAt
      }))
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Import Notes

const importNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    if (!notes || !Array.isArray(notes)) {
      return res.status(400).json({ error: 'Invalid notes data' });
    }
    
    const imported = await Note.create(
      notes.map(n => ({
        userId: req.userId,
        title: n.title,
        content: n.content,
        tags: n.tags || []
      }))
    );
    
    res.status(201).json({ 
      message: `Imported ${imported.length} notes`,
      count: imported.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllNotes, createNote, updateNote, deleteNote, getAllTags, exportNotes, importNotes };
