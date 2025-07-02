const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Book = require('../models/Book');
const QRCodeModel = require('../routes/qrRoutes');

// Create a new book when QR code is scanned
router.post('/create/:qrId', async (req, res) => {
    try {
        console.log('Received request to create book for QR ID:', req.params.qrId);
        
        // Verify QR code exists
        const qrCode = await QRCodeModel.findOne({ qrId: req.params.qrId });
        if (!qrCode) {
            console.log('QR code not found');
            return res.status(404).json({ error: 'QR code not found' });
        }

        // Check if QR code has been scanned
        if (qrCode.scanCount === 0) {
            console.log('QR code has not been scanned');
            return res.status(400).json({ error: 'QR code must be scanned before creating a book' });
        }

        // Create new book
        const book = new Book({
            title: req.body.title || `Notebook ${new Date().toLocaleDateString()}`,
            qrId: req.params.qrId,
            createdBy: req.body.userId || 'anonymous',
            coverImage: req.body.coverImage || '/api/placeholder/400/200',
            pages: [],
            isPublic: true,
        });

        await book.save();
        console.log('Book created:', book);

        // Emit WebSocket event to notify frontend
        const io = req.app.get('io');
        io.emit('bookCreated', {
            message: `New book created for QR code ${req.params.qrId}`,
            bookId: book._id,
            qrId: req.params.qrId,
            timestamp: new Date(),
        });

        res.status(201).json({
            message: 'Book created successfully',
            book: {
                id: book._id,
                title: book.title,
                qrId: book.qrId,
                createdBy: book.createdBy,
                coverImage: book.coverImage,
                totalPages: book.pages.length,
                isPublic: book.isPublic,
                createdAt: book.createdAt,
                lastUpdated: book.lastUpdated,
            },
        });
    } catch (err) {
        console.error('Error creating book:', err);
        res.status(500).json({ error: `Failed to create book: ${err.message}` });
    }
});

// Get book details by ID
router.get('/:bookId', async (req, res) => {
    try {
        console.log('Fetching book with ID:', req.params.bookId);
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            console.log('Book not found');
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({
            id: book._id,
            title: book.title,
            qrId: book.qrId,
            createdBy: book.createdBy,
            coverImage: book.coverImage,
            pages: book.pages,
            totalPages: book.pages.length,
            isPublic: book.isPublic,
            createdAt: book.createdAt,
            lastUpdated: book.lastUpdated,
        });
    } catch (err) {
        console.error('Error fetching book:', err);
        res.status(500).json({ error: `Failed to fetch book: ${err.message}` });
    }
});

// Get all books for a user
router.get('/user/:userId', async (req, res) => {
    try {
        console.log('Fetching books for user:', req.params.userId);
        const books = await Book.find({ createdBy: req.params.userId }).sort({ createdAt: -1 });
        const bookList = books.map(book => ({
            id: book._id,
            title: book.title,
            qrId: book.qrId,
            createdBy: book.createdBy,
            coverImage: book.coverImage,
            totalPages: book.pages.length,
            isPublic: book.isPublic,
            createdAt: book.createdAt,
            lastUpdated: book.lastUpdated,
        }));
        res.json(bookList);
    } catch (err) {
        console.error('Error fetching user books:', err);
        res.status(500).json({ error: `Failed to fetch books: ${err.message}` });
    }
});

module.exports = router;