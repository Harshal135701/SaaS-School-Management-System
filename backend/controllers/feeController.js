const { Fee, Student } = require("../models");

const createFee = async (req, res) => {
  try {
    const {
      studentId,
      title,
      amount,
      dueDate,
      status,
      paymentDate,
      paymentMethod,
      remarks,
    } = req.body;

    if (!studentId || !title || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "studentId, title, amount and dueDate are required",
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
        message: "Student not found in your franchise",
      });
    }

    const fee = await Fee.create({
      franchiseId: req.user.franchiseId,
      studentId,
      title,
      amount,
      dueDate,
      status: status || "PENDING",
      paymentDate,
      paymentMethod,
      remarks,
    });

    return res.status(201).json({
      success: true,
      message: "Fee created successfully",
      data: fee,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const getFees = async (req, res) => {
  try {
    const { Fee, Student, ParentStudent } = require("../models");

    const where = {
      franchiseId: req.user.franchiseId,
    };

    // Parent can only see fees of their linked student
    if (req.user.role === "PARENT") {
      const relationship = await ParentStudent.findOne({
        where: {
          parentId: req.user.id,
          studentId: req.params.studentId,
        },
      });

      if (!relationship) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this student's fees",
        });
      }

      where.studentId = req.params.studentId;
    }

    const fees = await Fee.findAll({
      where,
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["dueDate", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: fees.length,
      data: fees,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: fee,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateFee = async (req, res) => {
  try {
    const {
      studentId,
      title,
      amount,
      dueDate,
      status,
      paymentDate,
      paymentMethod,
      remarks,
    } = req.body;

    const fee = await Fee.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee not found",
      });
    }

    if (studentId) {
      const student = await Student.findOne({
        where: {
          id: studentId,
          franchiseId: req.user.franchiseId,
        },
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found in your franchise",
        });
      }
    }

    await fee.update({
      ...(studentId !== undefined && { studentId }),
      ...(title !== undefined && { title }),
      ...(amount !== undefined && { amount }),
      ...(dueDate !== undefined && { dueDate }),
      ...(status !== undefined && { status }),
      ...(paymentDate !== undefined && { paymentDate }),
      ...(paymentMethod !== undefined && { paymentMethod }),
      ...(remarks !== undefined && { remarks }),
    });

    return res.status(200).json({
      success: true,
      message: "Fee updated successfully",
      data: fee,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findOne({
      where: {
        id: req.params.id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee not found",
      });
    }

    await fee.destroy();

    return res.status(200).json({
      success: true,
      message: "Fee deleted successfully",
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
  createFee,
  getFees,
  getFeeById,
  updateFee,
  deleteFee,
};