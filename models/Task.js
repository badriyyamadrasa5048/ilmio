const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('daily', 'permanent'),
    allowNull: false,
    defaultValue: 'daily'
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: true // NULL means created by Admin and applicable to everyone
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  targetRole: {
    type: DataTypes.ENUM('parent', 'teacher'),
    allowNull: false,
    defaultValue: 'parent'
  },
  requiresPercentage: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

module.exports = Task;
