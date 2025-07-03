const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const Book = require("../models/Book")

// Create a new book when QR code is scanned
router.post("/create/:qrId", async (req, res) => {
  try {
    console.log("Received request to create book for QR ID:", req.params.qrId)
    console.log("Request body:", req.body)

    // Create new book with user details, book details, and QR details
    const book = new Book({
      title: req.body.title || `Notebook ${new Date().toLocaleDateString()}`,
      qrId: req.params.qrId,
      createdBy: req.body.userId || "anonymous",
      userName: req.body.userName || "Unknown User",
      userEmail: req.body.userEmail || "",
      coverImage: req.body.coverImage || "/api/placeholder/400/200",
      pages: req.body.pages || [],
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : false,
    })

    await book.save()
    console.log("Book created successfully:", book)

    // Emit WebSocket event to notify frontend
    const io = req.app.get("io")
    if (io) {
      io.emit("bookCreated", {
        message: `New book "${book.title}" created for QR code ${req.params.qrId}`,
        bookId: book._id,
        qrId: req.params.qrId,
        timestamp: new Date(),
      })
    }

    res.status(201).json({
      message: "Book created successfully",
      book: {
        id: book._id,
        title: book.title,
        qrId: book.qrId,
        createdBy: book.createdBy,
        userName: book.userName,
        userEmail: book.userEmail,
        coverImage: book.coverImage,
        pages: book.pages,
        totalPages: book.pages.length,
        isPublic: book.isPublic,
        createdAt: book.createdAt,
        lastUpdated: book.lastUpdated,
      },
    })
  } catch (err) {
    console.error("Error creating book:", err)
    res.status(500).json({ error: `Failed to create book: ${err.message}` })
  }
})

// Get book details by ID
router.get("/:bookId", async (req, res) => {
  try {
    console.log("Fetching book with ID:", req.params.bookId)
    const book = await Book.findById(req.params.bookId)
    if (!book) {
      console.log("Book not found")
      return res.status(404).json({ error: "Book not found" })
    }

    res.json({
      id: book._id,
      title: book.title,
      qrId: book.qrId,
      createdBy: book.createdBy,
      userName: book.userName,
      userEmail: book.userEmail,
      coverImage: book.coverImage,
      pages: book.pages,
      totalPages: book.pages.length,
      isPublic: book.isPublic,
      createdAt: book.createdAt,
      lastUpdated: book.lastUpdated,
    })
  } catch (err) {
    console.error("Error fetching book:", err)
    res.status(500).json({ error: `Failed to fetch book: ${err.message}` })
  }
})

// Get all books from database
router.get("/all", async (req, res) => {
  try {
    console.log("Fetching all books from database")
    const books = await Book.find().sort({ createdAt: -1 })
    const bookList = books.map((book) => ({
      id: book._id,
      title: book.title,
      qrId: book.qrId,
      createdBy: book.createdBy,
      userName: book.userName,
      userEmail: book.userEmail,
      coverImage: book.coverImage,
      pages: book.pages,
      totalPages: book.pages.length,
      isPublic: book.isPublic,
      createdAt: book.createdAt,
      lastUpdated: book.lastUpdated,
    }))
    console.log(`Found ${bookList.length} books in database`)
    res.json(bookList)
  } catch (err) {
    console.error("Error fetching all books:", err)
    res.status(500).json({ error: `Failed to fetch books: ${err.message}` })
  }
})

// Get all books for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    console.log("Fetching books for user:", req.params.userId)
    const books = await Book.find({ createdBy: req.params.userId }).sort({ createdAt: -1 })
    const bookList = books.map((book) => ({
      id: book._id,
      title: book.title,
      qrId: book.qrId,
      createdBy: book.createdBy,
      userName: book.userName,
      userEmail: book.userEmail,
      coverImage: book.coverImage,
      totalPages: book.pages.length,
      isPublic: book.isPublic,
      createdAt: book.createdAt,
      lastUpdated: book.lastUpdated,
    }))
    res.json(bookList)
  } catch (err) {
    console.error("Error fetching user books:", err)
    res.status(500).json({ error: `Failed to fetch books: ${err.message}` })
  }
})

// Update book details
router.put("/:bookId", async (req, res) => {
  try {
    console.log("Updating book with ID:", req.params.bookId)
    const book = await Book.findByIdAndUpdate(
      req.params.bookId,
      {
        ...req.body,
        lastUpdated: new Date(),
      },
      { new: true },
    )

    if (!book) {
      return res.status(404).json({ error: "Book not found" })
    }

    res.json({
      id: book._id,
      title: book.title,
      qrId: book.qrId,
      createdBy: book.createdBy,
      userName: book.userName,
      userEmail: book.userEmail,
      coverImage: book.coverImage,
      pages: book.pages,
      totalPages: book.pages.length,
      isPublic: book.isPublic,
      createdAt: book.createdAt,
      lastUpdated: book.lastUpdated,
    })
  } catch (err) {
    console.error("Error updating book:", err)
    res.status(500).json({ error: `Failed to update book: ${err.message}` })
  }
})

// Delete book
router.delete("/:bookId", async (req, res) => {
  try {
    console.log("Deleting book with ID:", req.params.bookId)
    const book = await Book.findByIdAndDelete(req.params.bookId)

    if (!book) {
      return res.status(404).json({ error: "Book not found" })
    }

    console.log("Book deleted successfully:", book.title)
    res.json({ message: "Book deleted successfully" })
  } catch (err) {
    console.error("Error deleting book:", err)
    res.status(500).json({ error: `Failed to delete book: ${err.message}` })
  }
})

module.exports = router
