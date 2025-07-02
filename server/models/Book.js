const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    qrId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    coverImage: { type: String, default: '/api/placeholder/400/200' },
    pages: [{
        pageNumber: { type: Number, required: true },
        imageUrl: { type: String },
        tags: [{ type: String }],
        notes: { type: String },
        lastUpdated: { type: Date, default: Date.now },
    }],
    isPublic: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Book', bookSchema);