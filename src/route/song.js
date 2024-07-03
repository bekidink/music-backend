const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');

// Create a new song
router.post('/save', songController.createSong);
//search song by title or artist 
router.get('/search', songController.searchSongs);
// Get all songs
router.get('/', songController.getAllSongs);

//Get stat
router.get('/stat',songController.getOverallStatistics)
// Get a single song by ID
router.get('/:id', songController.getSongById);

// Update a song by ID
router.put('/:id', songController.updateSong);

// Delete a song by ID
router.delete('/:id', songController.deleteSong);

module.exports = router;
