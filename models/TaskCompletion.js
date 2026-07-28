const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaskCompletion = sequelize.define('TaskCompletion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true // NULL for permanent tasks (completed once), or YYYY-MM-DD for daily routine tasks
  },
  completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  percentage: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

module.exports = TaskCompletion;
