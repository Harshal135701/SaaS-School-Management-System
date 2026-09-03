const { Book } = require("../models");

const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      quantity,
      description,
    } = req.body;

    if (!title || !author || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "title, author and quantity are required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const book = await Book.create({
      franchiseId: req.user.franchiseId,
      title,
      author,
      isbn,
      category,
      quantity,
      availableQuantity: quantity,
      status: "AVAILABLE",
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      order: [["title", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await Book.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const {
      title,
      author,
      isbn,
      category,
      quantity,
      status,
      description,
    } = req.body;

    if (quantity !== undefined && quantity < book.quantity - book.availableQuantity) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot be less than currently issued books",
      });
    }

    const issuedBooks = book.quantity - book.availableQuantity;
    const newQuantity = quantity !== undefined ? quantity : book.quantity;

    await book.update({
      ...(title !== undefined && { title }),
      ...(author !== undefined && { author }),
      ...(isbn !== undefined && { isbn }),
      ...(category !== undefined && { category }),
      quantity: newQuantity,
      availableQuantity: newQuantity - issuedBooks,
      ...(status !== undefined && { status }),
      ...(description !== undefined && { description }),
    });

    return res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: book,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    await book.destroy();

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
};