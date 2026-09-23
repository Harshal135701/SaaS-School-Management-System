
const {
    TeacherAssignment,
    Teacher,
    Class,
    Section,
    Subject,
} = require("../models");

const { Op } = require("sequelize");

// CREATE ASSIGNMENT
const createAssignment = async (req, res) => {
    try {
        const { teacherId, classId, sectionId, subjectId } = req.body;
        const franchiseId = req.user.franchiseId;

        if (!teacherId || !classId || !sectionId || !subjectId) {
            return res.status(400).json({
                success: false,
                message:
                    "teacherId, classId, sectionId and subjectId are required",
            });
        }

        const [teacher, cls, section] = await Promise.all([
            Teacher.findOne({
                where: {
                    id: teacherId,
                    franchiseId,
                },
            }),

            Class.findOne({
                where: {
                    id: classId,
                    franchiseId,
                },
            }),

            Section.findOne({
                where: {
                    id: sectionId,
                    franchiseId,
                    classId,
                },
            }),
        ]);

        if (!teacher || !cls || !section) {
            return res.status(404).json({
                success: false,
                message: "Teacher, class or section not found",
            });
        }

        if (teacher.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Cannot assign an inactive teacher",
            });
        }

        if (!cls.isActive) {
            return res.status(400).json({
                success: false,
                message: "Cannot assign a teacher to an inactive class",
            });
        }

        if (!section.isActive) {
            return res.status(400).json({
                success: false,
                message: "Cannot assign a teacher to an inactive section",
            });
        }

        const subject = await Subject.findOne({
            where: {
                id: subjectId,
                franchiseId,
            },
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }

        if (!subject.isActive) {
            return res.status(400).json({
                success: false,
                message: "Cannot assign an inactive subject",
            });
        }

        const existingAssignment = await TeacherAssignment.findOne({
            where: {
                franchiseId,
                teacherId,
                classId,
                sectionId,
                subjectId,
                status: "ACTIVE",
            },
        });

        if (existingAssignment) {
            return res.status(409).json({
                success: false,
                message:
                    "Teacher is already assigned to this class, section and subject",
            });
        }

        const inactiveAssignment = await TeacherAssignment.findOne({
            where: {
                franchiseId,
                teacherId,
                classId,
                sectionId,
                subjectId,
                status: "INACTIVE",
            },
        });

        if (inactiveAssignment) {
            await inactiveAssignment.update({
                status: "ACTIVE",
            });

            return res.status(200).json({
                success: true,
                message:
                    "Previous teacher assignment reactivated successfully",
                data: inactiveAssignment,
            });
        }

        const assignment = await TeacherAssignment.create({
            franchiseId,
            teacherId,
            classId,
            sectionId,
            subjectId,
            status: "ACTIVE",
        });

        return res.status(201).json({
            success: true,
            message: "Teacher assigned successfully",
            data: assignment,
        });
    } catch (error) {
        console.error("Create Assignment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// GET ASSIGNMENTS
const getAssignments = async (req, res) => {
    try {
        const {
            teacherId,
            classId,
            sectionId,
            subjectId,
            status = "ACTIVE",
            page = 1,
            limit = 20,
        } = req.query;

        const franchiseId = req.user.franchiseId;

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);

        const limitNumber = Math.min(
            Math.max(parseInt(limit, 10) || 20, 1),
            100
        );

        const offset = (pageNumber - 1) * limitNumber;

        const where = {
            franchiseId,
        };

        if (status) {
            if (!["ACTIVE", "INACTIVE"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid assignment status",
                });
            }

            where.status = status;
        }

        if (teacherId) {
            where.teacherId = teacherId;
        }

        if (classId) {
            where.classId = classId;
        }

        if (sectionId) {
            where.sectionId = sectionId;
        }

        if (subjectId) {
            where.subjectId = subjectId;
        }

        const { count, rows } =
            await TeacherAssignment.findAndCountAll({
                where,
                include: [
                    {
                        model: Teacher,
                        as: "teacher",
                        attributes: ["id", "name", "email", "status"],
                    },
                    {
                        model: Class,
                        as: "class",
                        attributes: ["id", "name", "code", "isActive"],
                    },
                    {
                        model: Section,
                        as: "section",
                        attributes: ["id", "name", "isActive"],
                    },
                    {
                        model: Subject,
                        as: "subject",
                        attributes: ["id", "name", "code", "isActive"],
                    },
                ],
                order: [["createdAt", "DESC"]],
                limit: limitNumber,
                offset,
            });

        return res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(count / limitNumber),
            },
        });
    } catch (error) {
        console.error("Get Assignments Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// UPDATE ASSIGNMENT
const updateAssignment = async (req, res) => {
    try {
        const franchiseId = req.user.franchiseId;

        const assignment = await TeacherAssignment.findOne({
            where: {
                id: req.params.id,
                franchiseId,
            },
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }

        const {
            teacherId,
            classId,
            sectionId,
            subjectId,
            status,
        } = req.body;

        const finalTeacherId = teacherId ?? assignment.teacherId;
        const finalClassId = classId ?? assignment.classId;
        const finalSectionId = sectionId ?? assignment.sectionId;

        const finalSubjectId =
            subjectId !== undefined
                ? subjectId || null
                : assignment.subjectId;

        if (status && !["ACTIVE", "INACTIVE"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assignment status",
            });
        }

        const finalStatus = status || assignment.status;

        // DEACTIVATE
        // Related entities do not need to remain active
        if (finalStatus === "INACTIVE") {
            await assignment.update({
                teacherId: finalTeacherId,
                classId: finalClassId,
                sectionId: finalSectionId,
                subjectId: finalSubjectId,
                status: "INACTIVE",
            });

            return res.status(200).json({
                success: true,
                message: "Assignment deactivated successfully",
                data: assignment,
            });
        }

        // ACTIVE assignment requires all related entities
        // to exist and be active
        if (!finalSubjectId) {
            return res.status(400).json({
                success: false,
                message: "subjectId is required",
            });
        }

        const [teacher, cls, section] = await Promise.all([
            Teacher.findOne({
                where: {
                    id: finalTeacherId,
                    franchiseId,
                },
            }),

            Class.findOne({
                where: {
                    id: finalClassId,
                    franchiseId,
                },
            }),

            Section.findOne({
                where: {
                    id: finalSectionId,
                    franchiseId,
                    classId: finalClassId,
                },
            }),
        ]);

        if (!teacher || !cls || !section) {
            return res.status(404).json({
                success: false,
                message: "Teacher, class or section not found",
            });
        }

        if (teacher.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Cannot assign an inactive teacher",
            });
        }

        if (!cls.isActive) {
            return res.status(400).json({
                success: false,
                message: "Cannot assign a teacher to an inactive class",
            });
        }

        if (!section.isActive) {
            return res.status(400).json({
                success: false,
                message: "Cannot assign a teacher to an inactive section",
            });
        }

        const subject = await Subject.findOne({
            where: {
                id: finalSubjectId,
                franchiseId,
            },
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }

        if (!subject.isActive) {
            return res.status(400).json({
                success: false,
                message: "Cannot assign an inactive subject",
            });
        }

        const duplicate = await TeacherAssignment.findOne({
            where: {
                franchiseId,
                teacherId: finalTeacherId,
                classId: finalClassId,
                sectionId: finalSectionId,
                subjectId: finalSubjectId,
                status: "ACTIVE",
                id: {
                    [Op.ne]: assignment.id,
                },
            },
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "This teacher assignment already exists",
            });
        }

        await assignment.update({
            teacherId: finalTeacherId,
            classId: finalClassId,
            sectionId: finalSectionId,
            subjectId: finalSubjectId,
            status: "ACTIVE",
        });

        return res.status(200).json({
            success: true,
            message: "Assignment updated successfully",
            data: assignment,
        });
    } catch (error) {
        console.error("Update Assignment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// DEACTIVATE ASSIGNMENT
const deleteAssignment = async (req, res) => {
    try {
        const franchiseId = req.user.franchiseId;

        const assignment = await TeacherAssignment.findOne({
            where: {
                id: req.params.id,
                franchiseId,
            },
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }

        if (assignment.status === "INACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Assignment is already inactive",
            });
        }

        await assignment.update({
            status: "INACTIVE",
        });

        return res.status(200).json({
            success: true,
            message: "Teacher assignment deactivated successfully",
            data: assignment,
        });
    } catch (error) {
        console.error("Delete Assignment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    createAssignment,
    getAssignments,
    updateAssignment,
    deleteAssignment,
};

