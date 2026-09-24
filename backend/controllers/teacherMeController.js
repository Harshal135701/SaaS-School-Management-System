const { Timetable, Student, Attendance, Examination, Homework, TeacherAssignment, Class, Section, Subject, SalaryProfile, SalaryPayment } = require("../models");
const { Op } = require("sequelize");

const getMyTimetable = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const timetable = await Timetable.findAll({
      where: { teacherId },
      include: [
        { model: Class, as: "class", attributes: ["name"] },
        { model: Section, as: "section", attributes: ["name"] },
        { model: Subject, as: "subject", attributes: ["name"] }
      ]
    });
    res.json({ success: true, data: timetable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching timetable" });
  }
};

const getMyStudents = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const assignments = await TeacherAssignment.findAll({ where: { teacherId } });
    const sectionIds = [...new Set(assignments.map(a => a.sectionId))];

    if (sectionIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const students = await Student.findAll({
      where: { sectionId: { [Op.in]: sectionIds } }
    });
    res.json({ success: true, data: students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching students" });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const assignments = await TeacherAssignment.findAll({ where: { teacherId } });
    const sectionIds = [...new Set(assignments.map(a => a.sectionId))];

    if (sectionIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const students = await Student.findAll({
      where: { sectionId: { [Op.in]: sectionIds } },
      attributes: ['id']
    });
    const studentIds = students.map(s => s.id);

    if (studentIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const attendance = await Attendance.findAll({
      where: {
        studentId: { [Op.in]: studentIds }
      }
    });
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching attendance: " + error.message });
  }
};

const getMyExaminations = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const franchiseId = req.user.franchiseId;
    const examinations = await Examination.findAll({
      where: { franchiseId }
    });
    res.json({ success: true, data: examinations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching examinations: " + error.message });
  }
};

const getMyHomework = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const homework = await Homework.findAll({
      where: { teacherId }
    });
    res.json({ success: true, data: homework });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching homework" });
  }
};


const getMySalary = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const salaryProfile = await SalaryProfile.findOne({
      where: { teacherId }
    });

    const latestPayment = await SalaryPayment.findOne({
      where: { teacherId },
      order: [['paymentDate', 'DESC']]
    });

    res.json({ success: true, data: { salaryProfile, latestPayment } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching salary: " + error.message });
  }
};

module.exports = {
  getMySalary,
  getMyTimetable,
  getMyStudents,
  getMyAttendance,
  getMyExaminations,
  getMyHomework
};
