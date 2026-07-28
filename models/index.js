const sequelize = require('../config/database');
const User = require('./User');
const Teacher = require('./Teacher');
const Class = require('./Class');
const Student = require('./Student');
const Attendance = require('./Attendance');
const Mark = require('./Mark');
const Task = require('./Task');
const TaskCompletion = require('./TaskCompletion');

// Associations

// Class <-> Student (One-to-Many)
Class.hasMany(Student, { foreignKey: 'classId', as: 'students', onDelete: 'SET NULL' });
Student.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

// Teacher <-> Class (One-to-Many: A teacher can be class teacher of multiple classes)
Teacher.hasMany(Class, { foreignKey: 'teacherId', as: 'classes', onDelete: 'SET NULL' });
Class.belongsTo(Teacher, { as: 'classTeacher', foreignKey: 'teacherId' });

// Student <-> Attendance (One-to-Many)
Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendances', onDelete: 'CASCADE' });
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Student <-> Mark (One-to-Many)
Student.hasMany(Mark, { foreignKey: 'studentId', as: 'marks', onDelete: 'CASCADE' });
Mark.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Class <-> Task (One-to-Many)
Class.hasMany(Task, { foreignKey: 'classId', as: 'tasks', onDelete: 'SET NULL' });
Task.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

// User <-> Task (One-to-Many)
User.hasMany(Task, { foreignKey: 'creatorId', as: 'createdTasks', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

// Task <-> TaskCompletion (One-to-Many)
Task.hasMany(TaskCompletion, { foreignKey: 'taskId', as: 'completions', onDelete: 'CASCADE' });
TaskCompletion.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

// Student <-> TaskCompletion (One-to-Many)
Student.hasMany(TaskCompletion, { foreignKey: 'studentId', as: 'taskCompletions', onDelete: 'CASCADE' });
TaskCompletion.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// User links
// Since role is admin, teacher, or parent:
// If teacher, referenceId refers to Teacher.id
// If parent, referenceId refers to Student.id (parent views student's dashboard)
User.belongsTo(Teacher, { foreignKey: 'referenceId', constraints: false, as: 'teacherDetail' });
User.belongsTo(Student, { foreignKey: 'referenceId', constraints: false, as: 'studentDetail' });
Teacher.hasOne(User, { foreignKey: 'referenceId', constraints: false, as: 'userAccount' });

module.exports = {
  sequelize,
  User,
  Teacher,
  Class,
  Student,
  Attendance,
  Mark,
  Task,
  TaskCompletion
};
