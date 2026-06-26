const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { authenticate } = require('../middleware/auth');
require('dotenv').config();

router.use(authenticate);
router.get('/', noteController.getAllNotes);
router.get('/tags', noteController.getAllTags);
router.post('/', noteController.createNote);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);
router.get('/export', noteController.exportNotes);
router.post('/import', noteController.importNotes);

module.exports = router;
