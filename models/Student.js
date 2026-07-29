const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
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
  admissionNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female'),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  parentName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  parentPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  parentEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  photoUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Student;
