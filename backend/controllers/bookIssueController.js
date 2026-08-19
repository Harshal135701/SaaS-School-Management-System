const { BookIssue, Book, Student } = require("../models");

const issueBook = async (req, res) => {
  try {
    const { bookId, studentId, issueDate, dueDate, remarks } = req.body;

    if (!bookId || !studentId || !issueDate || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "bookId, studentId, issueDate and dueDate are required",
      });
    }

    const book = await Book.findOne({
      where: {
        id: bookId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.availableQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Book is not available",
      });
    }

    const student = await Student.findOne({
      where: {
        id: studentId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const issue = await BookIssue.create({
      franchiseId: req.user.franchiseId,
      bookId,
      studentId,
      issueDate,
      dueDate,
      status: "ISSUED",
      remarks,
    });

    await book.update({
      availableQuantity: book.availableQuantity - 1,
      status: book.availableQuantity - 1 > 0 ? "AVAILABLE" : "UNAVAILABLE",
    });

    return res.status(201).json({
      success: true,
      message: "Book issued successfully",
      data: issue,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const returnBook = async (req, res) => {
  try {
    const issue = await BookIssue.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
        status: "ISSUED",
      },
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Active book issue not found",
      });
    }

    const book = await Book.findOne({
      where: {
        id: issue.bookId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const returnDate = new Date().toISOString().split("T")[0];

    await issue.update({
      returnDate,
      status: "RETURNED",
    });

    await book.update({
      availableQuantity: book.availableQuantity + 1,
      status: "AVAILABLE",
    });

    return res.status(200).json({
      success: true,
      message: "Book returned successfully",
      data: issue,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getBookIssues = async (req, res) => {
  try {
    const issues = await BookIssue.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: Book,
          as: "book",
          attributes: ["id", "title", "author"],
        },
        {
          model: Student,
          as: "student",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
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
  issueBook,
  returnBook,
  getBookIssues,
};