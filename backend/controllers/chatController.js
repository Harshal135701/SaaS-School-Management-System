const {
  Conversation,
  ConversationParticipant,
  Parent,
  Teacher,
  Student,
  ParentStudent,
  TeacherAssignment,
} = require("../models");

const createConversation = async (req, res) => {
  try {
    const { parentId, teacherId, studentId } = req.body;

    if (!parentId || !teacherId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "parentId, teacherId and studentId are required",
      });
    }

    // Parent can only start chat as themselves
    if (req.user.role === "PARENT" && req.user.id !== parentId) {
      return res.status(403).json({
        success: false,
        message: "You can only start a conversation as yourself",
      });
    }

    // Teacher can only start chat as themselves
    if (req.user.role === "TEACHER" && req.user.id !== teacherId) {
      return res.status(403).json({
        success: false,
        message: "You can only start a conversation as yourself",
      });
    }

    const parent = await Parent.findOne({
      where: {
        id: parentId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    const teacher = await Teacher.findOne({
      where: {
        id: teacherId,
        franchiseId: req.user.franchiseId,
        status: "ACTIVE",
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
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

    // Teacher must teach this student's class and section
    const teacherAssignment = await TeacherAssignment.findOne({
      where: {
        teacherId,
        classId: student.classId,
        sectionId: student.sectionId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!teacherAssignment) {
      return res.status(403).json({
        success: false,
        message: "Teacher is not assigned to this student's class and section",
      });
    }

    // Parent must be linked to this student
    const relationship = await ParentStudent.findOne({
      where: {
        parentId,
        studentId,
      },
    });

    if (!relationship) {
      return res.status(403).json({
        success: false,
        message: "Parent is not linked to this student",
      });
    }

    // Check existing conversation
    const existingConversation = await Conversation.findOne({
      where: {
        franchiseId: req.user.franchiseId,
        parentId,
        teacherId,
        studentId,
      },
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        message: "Conversation already exists",
        data: existingConversation,
      });
    }

    const conversation = await Conversation.create({
      franchiseId: req.user.franchiseId,
      parentId,
      teacherId,
      studentId,
    });

    await ConversationParticipant.bulkCreate([
      {
        conversationId: conversation.id,
        participantType: "PARENT",
        participantId: parentId,
      },
      {
        conversationId: conversation.id,
        participantType: "TEACHER",
        participantId: teacherId,
      },
    ]);

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      data: conversation,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const { Op } = require("sequelize");

    let where = {
      franchiseId: req.user.franchiseId,
    };

    if (req.user.role === "PARENT") {
      where.parentId = req.user.id;
    }

    if (req.user.role === "TEACHER") {
      where.teacherId = req.user.id;
    }

    const conversations = await Conversation.findAll({
      where,
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "name"],
        },
        {
          model: ConversationParticipant,
          as: "participants",
          attributes: [
            "id",
            "participantType",
            "participantId",
          ],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { Message, Conversation } = require("../models");

    const conversation = await Conversation.findOne({
      where: {
        id: req.params.conversationId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant =
      (req.user.role === "PARENT" &&
        conversation.parentId === req.user.id) ||
      (req.user.role === "TEACHER" &&
        conversation.teacherId === req.user.id);

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    const messages = await Message.findAll({
      where: {
        conversationId: conversation.id,
      },
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      data: messages,
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
  createConversation,
  getConversations,
  getMessages,
};