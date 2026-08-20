const { sequelize } = require("../config/database");

const Franchise = require("./Franchise");
const FranchiseAdmin = require("./FranchiseAdmin");
const SystemAdmin = require("./SystemAdmin");
const RoyaltyConfiguration = require("./RoyaltyConfiguration");
const MonthlyRoyalty = require("./MonthlyRoyalty");
const Contract = require("./Contract");
const Plan = require("./Plan");
const Student = require("./Student");
const Feature = require("./Feature");
const Teacher = require("./Teacher");
const Attendance = require("./Attendance");
const Homework = require("./Homework");
const Fee = require("./Fee");
const Examination = require("./Examination");
const Book = require("./Book");
const BookIssue = require("./BookIssue");
const Timetable = require("./Timetable");

// Plan ↔ Feature
Plan.belongsToMany(Feature, {
  through: "plan_features",
  foreignKey: "planId",
  otherKey: "featureId",
  as: "features",
});

Feature.belongsToMany(Plan, {
  through: "plan_features",
  foreignKey: "featureId",
  otherKey: "planId",
  as: "plans",
});

Franchise.belongsTo(Plan, {
  foreignKey: "planId",
  as: "plan",
});

Plan.hasMany(Franchise, {
  foreignKey: "planId",
  as: "franchises",
});

Franchise.hasMany(Student, {
  foreignKey: "franchiseId",
  as: "students",
});

Student.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

Franchise.hasMany(Teacher, {
  foreignKey: "franchiseId",
  as: "teachers",
});

Teacher.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

Franchise.hasMany(Attendance, {
  foreignKey: "franchiseId",
  as: "attendances",
});

Attendance.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

Student.hasMany(Attendance, {
  foreignKey: "studentId",
  as: "attendances",
});

Attendance.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
});

Franchise.hasMany(Homework, {
  foreignKey: "franchiseId",
  as: "homeworks",
});

Homework.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

Teacher.hasMany(Homework, {
  foreignKey: "teacherId",
  as: "homeworks",
});

Homework.belongsTo(Teacher, {
  foreignKey: "teacherId",
  as: "teacher",
});

Franchise.hasMany(Fee, {
  foreignKey: "franchiseId",
  as: "fees",
});

Fee.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

Student.hasMany(Fee, {
  foreignKey: "studentId",
  as: "fees",
});

Fee.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
});

Franchise.hasMany(Examination, {
  foreignKey: "franchiseId",
  as: "examinations",
});

Examination.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});


Franchise.hasMany(Book, {
  foreignKey: "franchiseId",
  as: "books",
});

Book.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

Book.hasMany(BookIssue, {
  foreignKey: "bookId",
  as: "issues",
});

BookIssue.belongsTo(Book, {
  foreignKey: "bookId",
  as: "book",
});

Student.hasMany(BookIssue, {
  foreignKey: "studentId",
  as: "bookIssues",
});

BookIssue.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
});

Franchise.hasMany(BookIssue, {
  foreignKey: "franchiseId",
  as: "bookIssues",
});

BookIssue.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

Teacher.hasMany(Timetable, {
  foreignKey: "teacherId",
  as: "timetables",
});

Timetable.belongsTo(Teacher, {
  foreignKey: "teacherId",
  as: "teacher",
});

Franchise.hasMany(Timetable, {
  foreignKey: "franchiseId",
  as: "timetables",
});

Timetable.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

module.exports = {
  sequelize,
  Franchise,
  FranchiseAdmin,
  SystemAdmin,
  Plan,
  Feature,
  Contract,
  Book,
  Student,
  Examination,
  Homework,
  BookIssue,
  RoyaltyConfiguration,
  MonthlyRoyalty,
  Timetable,
  Teacher,
  Fee,
  Attendance,
};