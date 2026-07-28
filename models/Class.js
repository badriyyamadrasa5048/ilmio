const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  section: {
    type: DataTypes.STRING,
    allowNull: true
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Assigned class teacher'
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: '08:30:00'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: '09:30:00'
  },
  graceTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10 // grace period in minutes
  }
});

module.exports = Class;
