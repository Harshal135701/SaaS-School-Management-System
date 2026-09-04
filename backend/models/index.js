const { sequelize } = require("../config/database");

const Franchise = require("./Franchise");
const FranchiseAdmin = require("./FranchiseAdmin");
const SystemAdmin = require("./SystemAdmin");
const TeacherAssignment = require("./TeacherAssignment");
const RoyaltyConfiguration = require("./RoyaltyConfiguration");
const MonthlyRoyalty = require("./MonthlyRoyalty");
const Contract = require("./Contract");
const Plan = require("./Plan");
const PasswordResetOTP = require("./PasswordResetOTP");
const TransportRoute = require("./TransportRoute");
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
const Vehicle = require("./Vehicle");
const Parent = require("./Parent");
const ParentStudent = require("./ParentStudent");
const Conversation = require("./Conversation");
const ConversationParticipant = require("./ConversationParticipant");
const Message = require("./Message");
const Class = require("./Class")(sequelize);
const Section = require("./Section")(sequelize);
const Subject = require("./Subject")(sequelize);
const ExamResult = require("./ExamResult");

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



Franchise.hasMany(Class, {
  foreignKey: "franchiseId",
  as: "classes",
});

Class.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

Franchise.hasMany(Section, {
  foreignKey: "franchiseId",
  as: "sections",
});

Section.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

Class.hasMany(Section, {
  foreignKey: "classId",
  as: "sections",
  onDelete: "CASCADE",
});

Section.belongsTo(Class, {
  foreignKey: "classId",
  as: "class",
});

Franchise.hasMany(Subject, {
  foreignKey: "franchiseId",
  as: "subjects",
});

Subject.belongsTo(Franchise, {
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

Franchise.hasMany(ExamResult, {
  foreignKey: "franchiseId",
  as: "examResults",
});

ExamResult.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

Examination.hasMany(ExamResult, {
  foreignKey: "examinationId",
  as: "results",
});

ExamResult.belongsTo(Examination, {
  foreignKey: "examinationId",
  as: "examination",
});

Student.hasMany(ExamResult, {
  foreignKey: "studentId",
  as: "examResults",
});

ExamResult.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
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

Franchise.hasMany(Vehicle, {
  foreignKey: "franchiseId",
  as: "vehicles",
});

Vehicle.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

Vehicle.hasMany(TransportRoute, {
  foreignKey: "vehicleId",
  as: "routes",
});

TransportRoute.belongsTo(Vehicle, {
  foreignKey: "vehicleId",
  as: "vehicle",
});

Franchise.hasMany(TransportRoute, {
  foreignKey: "franchiseId",
  as: "transportRoutes",
});

TransportRoute.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

Franchise.hasMany(Parent, {
  foreignKey: "franchiseId",
  as: "parents",
});

Parent.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

Parent.belongsToMany(Student, {
  through: ParentStudent,
  foreignKey: "parentId",
  otherKey: "studentId",
  as: "students",
});

Student.belongsToMany(Parent, {
  through: ParentStudent,
  foreignKey: "studentId",
  otherKey: "parentId",
  as: "parents",
});

ParentStudent.belongsTo(Parent, {
  foreignKey: "parentId",
  as: "parent",
});

ParentStudent.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
});

Parent.hasMany(ParentStudent, {
  foreignKey: "parentId",
  as: "parentStudents",
});

Student.hasMany(ParentStudent, {
  foreignKey: "studentId",
  as: "parentStudents",
});

Franchise.hasMany(Conversation, {
  foreignKey: "franchiseId",
  as: "conversations",
});

Conversation.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

Student.hasMany(Conversation, {
  foreignKey: "studentId",
  as: "conversations",
});

Conversation.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
});

Parent.hasMany(Conversation, {
  foreignKey: "parentId",
  as: "conversations",
});

Conversation.belongsTo(Parent, {
  foreignKey: "parentId",
  as: "parent",
});

Teacher.hasMany(Conversation, {
  foreignKey: "teacherId",
  as: "conversations",
});

Conversation.belongsTo(Teacher, {
  foreignKey: "teacherId",
  as: "teacher",
});

Conversation.hasMany(ConversationParticipant, {
  foreignKey: "conversationId",
  as: "participants",
});

ConversationParticipant.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

Conversation.hasMany(Message, {
  foreignKey: "conversationId",
  as: "messages",
});

Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

Student.belongsTo(Class, {
  foreignKey: "classId",
  as: "class",
});

Student.belongsTo(Section, {
  foreignKey: "sectionId",
  as: "section",
});

Class.hasMany(Student, {
  foreignKey: "classId",
  as: "students",
});

Section.hasMany(Student, {
  foreignKey: "sectionId",
  as: "students",
});

Class.hasMany(Homework, {
  foreignKey: "classId",
  as: "homeworks",
});

Homework.belongsTo(Class, {
  foreignKey: "classId",
  as: "class",
});

Section.hasMany(Homework, {
  foreignKey: "sectionId",
  as: "homeworks",
});

Homework.belongsTo(Section, {
  foreignKey: "sectionId",
  as: "section",
});

Teacher.hasMany(TeacherAssignment, {
  foreignKey: "teacherId",
  as: "assignments",
});

TeacherAssignment.belongsTo(Teacher, {
  foreignKey: "teacherId",
  as: "teacher",
});

Class.hasMany(TeacherAssignment, {
  foreignKey: "classId",
  as: "teacherAssignments",
});

TeacherAssignment.belongsTo(Class, {
  foreignKey: "classId",
  as: "class",
});

Section.hasMany(TeacherAssignment, {
  foreignKey: "sectionId",
  as: "teacherAssignments",
});

TeacherAssignment.belongsTo(Section, {
  foreignKey: "sectionId",
  as: "section",
});

Subject.hasMany(TeacherAssignment, {
  foreignKey: "subjectId",
  as: "teacherAssignments",
});

TeacherAssignment.belongsTo(Subject, {
  foreignKey: "subjectId",
  as: "subject",
});

module.exports = {
  sequelize,
  Franchise,
  FranchiseAdmin,
  SystemAdmin,
  Plan,
  Feature,
  Contract,
  TransportRoute,
  Class,
  Section,
  Subject,
  Book,
  ConversationParticipant,
  Vehicle,
  Student,
  Examination,
  Homework,
  Conversation,
  BookIssue,
  PasswordResetOTP,
  Message,
  RoyaltyConfiguration,
  MonthlyRoyalty,
  ExamResult,
  Timetable,
  Parent,
  Teacher,
  Fee,
  TeacherAssignment,
  Attendance,
  ParentStudent,
};