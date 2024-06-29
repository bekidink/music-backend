const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    artistName: {
        type: String,
        required: true
    },
    artistImageURL: {
        type: String,
        required: true
    },
    albums: [{
        albumName: {
            type: String,
            required: true
        },
        albumImageURL: {
            type: String,
            required: true
        },
        songs: [{
            songName: {
                type: String,
                required: true
            },
            songImageURL: {
                type: String,
                required: true
            },
            songURL: {
                type: String,
                required: true
            },
            category: {
                type: String,
                required: true,
                enum: ['Classical', 'Popular', 'Rock','Hip hop','Jazz','Electronic','Folk','Blues'] // Define allowed categories here
            }
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);
