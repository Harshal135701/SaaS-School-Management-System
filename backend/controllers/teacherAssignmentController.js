const {
    TeacherAssignment,
    Teacher,
    Class,
    Section,
    Subject,
} = require("../models");

const createAssignment = async (req, res) => {
    try {
        const { teacherId, classId, sectionId, subjectId } = req.body;

        if (!teacherId || !classId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "teacherId, classId and sectionId are required",
            });
        }

        const [teacher, cls, section] = await Promise.all([
            Teacher.findOne({
                where: { id: teacherId, franchiseId: req.user.franchiseId },
            }),
            Class.findOne({
                where: { id: classId, franchiseId: req.user.franchiseId },
            }),
            Section.findOne({
                where: { id: sectionId, franchiseId: req.user.franchiseId, classId },
            }),
        ]);

        if (teacher && teacher.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Cannot assign an inactive teacher",
            });
        }

        if (!teacher || !cls || !section) {
            return res.status(404).json({
                success: false,
                message: "Teacher, class or section not found",
            });
        }

        if (subjectId) {
            const subject = await Subject.findOne({
                where: { id: subjectId, franchiseId: req.user.franchiseId },
            });

            if (!subject) {
                return res.status(404).json({
                    success: false,
                    message: "Subject not found",
                });
            }
        }

        const existingAssignment = await TeacherAssignment.findOne({
            where: {
                franchiseId: req.user.franchiseId,
                teacherId,
                classId,
                sectionId,
                subjectId: subjectId || null,
            },
        });

        if (existingAssignment) {
            return res.status(409).json({
                success: false,
                message: "Teacher is already assigned to this class, section and subject",
            });
        }

        const assignment = await TeacherAssignment.create({
            franchiseId: req.user.franchiseId,
            teacherId,
            classId,
            sectionId,
            subjectId: subjectId || null,
        });

        res.status(201).json({
            success: true,
            message: "Teacher assigned successfully",
            data: assignment,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getAssignments = async (req, res) => {
    try {
        const assignments = await TeacherAssignment.findAll({
            where: {
                franchiseId: req.user.franchiseId,
            },
            include: [
                { model: Teacher, as: "teacher", attributes: ["id", "name"] },
                { model: Class, as: "class", attributes: ["id", "name"] },
                { model: Section, as: "section", attributes: ["id", "name"] },
                { model: Subject, as: "subject", attributes: ["id", "name"] },
            ],
        });

        res.status(200).json({
            success: true,
            data: assignments,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const updateAssignment = async (req, res) => {
    try {
        const assignment = await TeacherAssignment.findOne({
            where: {
                id: req.params.id,
                franchiseId: req.user.franchiseId,
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
        } = req.body;

        const finalTeacherId = teacherId ?? assignment.teacherId;
        const finalClassId = classId ?? assignment.classId;
        const finalSectionId = sectionId ?? assignment.sectionId;
        const finalSubjectId = subjectId ?? assignment.subjectId;

        const [teacher, cls, section] = await Promise.all([
            Teacher.findOne({
                where: {
                    id: finalTeacherId,
                    franchiseId: req.user.franchiseId,
                },
            }),
            Class.findOne({
                where: {
                    id: finalClassId,
                    franchiseId: req.user.franchiseId,
                },
            }),
            Section.findOne({
                where: {
                    id: finalSectionId,
                    franchiseId: req.user.franchiseId,
                    classId: finalClassId,
                },
            }),
        ]);

        if (teacher && teacher.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Cannot assign an inactive teacher",
            });
        }

        if (!teacher || !cls || !section) {
            return res.status(404).json({
                success: false,
                message: "Teacher, class or section not found",
            });
        }

        if (finalSubjectId) {
            const subject = await Subject.findOne({
                where: {
                    id: finalSubjectId,
                    franchiseId: req.user.franchiseId,
                },
            });

            if (!subject) {
                return res.status(404).json({
                    success: false,
                    message: "Subject not found",
                });
            }
        }

        const duplicate = await TeacherAssignment.findOne({
            where: {
                franchiseId: req.user.franchiseId,
                teacherId: finalTeacherId,
                classId: finalClassId,
                sectionId: finalSectionId,
                subjectId: finalSubjectId,
            },
        });

        if (duplicate && duplicate.id !== assignment.id) {
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
        });

        res.status(200).json({
            success: true,
            message: "Assignment updated successfully",
            data: assignment,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const deleteAssignment = async (req, res) => {
    try {
        const assignment = await TeacherAssignment.findOne({
            where: {
                id: req.params.id,
                franchiseId: req.user.franchiseId,
            },
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }

        await assignment.destroy();

        res.status(200).json({
            success: true,
            message: "Assignment deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    createAssignment, getAssignments,
    updateAssignment, deleteAssignment
};