const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mark = sequelize.define('Mark', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subjectName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  marksObtained: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  maxMarks: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 100,
    validate: {
      min: 1
    }
  },
  examType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Midterm',
    validate: {
      notEmpty: true
    }
  },
  examDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
});

module.exports = Mark;
