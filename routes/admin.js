const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const { Student, Teacher, Class, Attendance, Mark, User, Task, sequelize } = require('../models');
const { Op } = require('sequelize');

// Apply Admin role protection to all routes in this file
router.use(isAuthenticated, hasRole('admin'));

// ==========================================
// 1. TEACHER MANAGEMENT
// ==========================================

// Get all teachers
router.get('/teachers', async (req, res) => {
  const { search } = req.query;
  let whereClause = {};

  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } }
    ];
  }

  try {
    const teachers = await Teacher.findAll({
      where: whereClause,
      include: [{ model: User, as: 'userAccount' }],
      order: [['name', 'ASC']]
    });
    res.render('admin/teachers', { user: req.session, activePage: 'teachers', teachers, search: search || '', error: null, success: null });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Create new teacher
router.post('/teachers/create', async (req, res) => {
  const { name, phone, password } = req.body;
  const t = await sequelize.transaction();
  try {
    if (!phone || !phone.trim()) {
      const teachers = await Teacher.findAll({ include: [{ model: User, as: 'userAccount' }], order: [['name', 'ASC']] });
      await t.rollback();
      return res.render('admin/teachers', { user: req.session, teachers, search: '', error: 'Phone number is required for teacher login.', success: null });
    }

    const cleanPhone = phone.trim();
    
    // Check if phone already registered
    const existingTeacher = await Teacher.findOne({ where: { phone: cleanPhone } });
    if (existingTeacher) {
      const teachers = await Teacher.findAll({ include: [{ model: User, as: 'userAccount' }], order: [['name', 'ASC']] });
      await t.rollback();
      return res.render('admin/teachers', { user: req.session, teachers, search: '', error: 'A teacher with this phone number already exists.', success: null });
    }

    const teacher = await Teacher.create({ name, phone: cleanPhone }, { transaction: t });
    
    // Set username to phone number or fallback to generated name
    const loginUsername = cleanPhone;
    const finalPassword = password && password.trim() ? password.trim() : 'teacher123';

    await User.create({
      username: loginUsername,
      password: finalPassword,
      role: 'teacher',
      referenceId: teacher.id
    }, { transaction: t });

    await t.commit();
    
    const teachers = await Teacher.findAll({ include: [{ model: User, as: 'userAccount' }], order: [['name', 'ASC']] });
    res.render('admin/teachers', { 
      user: req.session, 
      teachers, 
      search: '', 
      error: null, 
      success: `Teacher added successfully! Login Phone: "${cleanPhone}", Password: "${finalPassword}"` 
    });
  } catch (error) {
    await t.rollback();
    console.error('Error creating teacher:', error);
    const teachers = await Teacher.findAll({ include: [{ model: User, as: 'userAccount' }], order: [['name', 'ASC']] });
    res.render('admin/teachers', { user: req.session, teachers, search: '', error: 'Failed to add teacher.', success: null });
  }
});

// Update teacher
router.post('/teachers/update/:id', async (req, res) => {
  const { name, phone, password } = req.body;
  const teacherId = req.params.id;
  try {
    const cleanPhone = phone ? phone.trim() : '';
    await Teacher.update({ name, phone: cleanPhone }, { where: { id: teacherId } });
    
    // Update corresponding user login username & password if needed
    const teacherIdInt = parseInt(teacherId, 10);
    const user = await User.findOne({ where: { role: 'teacher', referenceId: teacherIdInt } });
    if (user) {
      if (cleanPhone) user.username = cleanPhone;
      if (password && password.trim()) {
        user.password = password.trim();
      }
      await user.save();
    } else if (cleanPhone) {
      // Create user login if missing
      await User.create({
        username: cleanPhone,
        password: (password && password.trim()) ? password.trim() : 'teacher123',
        role: 'teacher',
        referenceId: teacherIdInt
      });
    }
    
    res.redirect('/admin/teachers');
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.redirect('/admin/teachers');
  }
});

// Delete teacher
router.post('/teachers/delete/:id', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const teacherId = req.params.id;
    // Delete User login associated with this teacher
    await User.destroy({ where: { role: 'teacher', referenceId: teacherId } }, { transaction: t });
    // Set teacherId in Classes to null (Sequelize will handle set null due to config, but let's be explicit)
    await Class.update({ teacherId: null }, { where: { teacherId } }, { transaction: t });
    // Delete Teacher record
    await Teacher.destroy({ where: { id: teacherId } }, { transaction: t });

    await t.commit();
    res.redirect('/admin/teachers');
  } catch (error) {
    await t.rollback();
    console.error('Error deleting teacher:', error);
    res.redirect('/admin/teachers');
  }
});

// ==========================================
// 2. CLASS MANAGEMENT
// ==========================================

// Get all classes
router.get('/classes', async (req, res) => {
  try {
    const classes = await Class.findAll({
      order: [['level', 'ASC']],
      include: [{ model: Teacher, as: 'classTeacher', foreignKey: 'teacherId' }]
    });
    const teachers = await Teacher.findAll({ order: [['name', 'ASC']] });
    res.render('admin/classes', { user: req.session, activePage: 'classes', classes, teachers, error: null, success: null });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Update class
router.post('/classes/update/:id', async (req, res) => {
  const { name, section, teacherId, startTime, endTime, graceTime } = req.body;
  try {
    await Class.update({
      name,
      section: section || "",
      teacherId: teacherId === '' ? null : teacherId,
      startTime: startTime || '08:30:00',
      endTime: endTime || '09:30:00',
      graceTime: graceTime ? parseInt(graceTime) : 10
    }, { where: { id: req.params.id } });
    res.redirect('/admin/classes');
  } catch (error) {
    console.error('Error updating class:', error);
    res.redirect('/admin/classes');
  }
});


// ==========================================
// 3. STUDENT MANAGEMENT
// ==========================================

// Get all students
router.get('/students', async (req, res) => {
  const { search, classId } = req.query;
  let whereClause = {};

  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { admissionNumber: { [Op.like]: `%${search}%` } },
      { parentName: { [Op.like]: `%${search}%` } }
    ];
  }

  if (classId) {
    whereClause.classId = classId;
  }

  try {
    const students = await Student.findAll({
      where: whereClause,
      include: [{ model: Class, as: 'class' }],
      order: [['name', 'ASC']]
    });
    const classes = await Class.findAll({ order: [['level', 'ASC']] });
    res.render('admin/students', { 
      user: req.session, 
      activePage: 'students',
      students, 
      classes, 
      search: search || '', 
      selectedClassId: classId || '', 
      error: null, 
      success: null 
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send('Internal Server Error');
  }
});

function formatDobToPassword(dobStr) {
  if (!dobStr || !dobStr.trim()) return '01012000';
  const parts = dobStr.trim().split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}${month}${year}`;
  }
  return dobStr.replace(/[^0-9]/g, '') || '01012000';
}

// Create student
router.post('/students/create', async (req, res) => {
  const { name, admissionNumber, dateOfBirth, gender, address, parentName, parentPhone, parentEmail, classId } = req.body;
  const classes = await Class.findAll({ order: [['level', 'ASC']] });

  const t = await sequelize.transaction();
  try {
    if (!name || !name.trim()) {
      await t.rollback();
      const students = await Student.findAll({ include: [{ model: Class, as: 'class' }] });
      return res.render('admin/students', {
        user: req.session,
        students,
        classes,
        search: '',
        selectedClassId: '',
        error: 'Student Name is mandatory.',
        success: null
      });
    }

    let finalAdmissionNo = admissionNumber ? admissionNumber.trim() : '';
    if (!finalAdmissionNo) {
      const studentCount = await Student.count();
      finalAdmissionNo = `S${1000 + studentCount + 1}`;
    } else {
      const existing = await Student.findOne({ where: { admissionNumber: finalAdmissionNo } });
      if (existing) {
        const students = await Student.findAll({ include: [{ model: Class, as: 'class' }] });
        await t.rollback();
        return res.render('admin/students', {
          user: req.session,
          students,
          classes,
          search: '',
          selectedClassId: '',
          error: 'Admission number already exists.',
          success: null
        });
      }
    }

    const student = await Student.create({
      name: name.trim(),
      admissionNumber: finalAdmissionNo,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      address: address || null,
      parentName: parentName || null,
      parentPhone: parentPhone || null,
      parentEmail: parentEmail || null,
      classId: classId === '' ? null : classId
    }, { transaction: t });

    // Create User login for Parent: Username = Admission Number, Password = DOB (DDMMYYYY)
    const parentUsername = finalAdmissionNo.toLowerCase();
    const parentPassword = formatDobToPassword(dateOfBirth);

    await User.create({
      username: parentUsername,
      password: parentPassword,
      role: 'parent',
      referenceId: student.id
    }, { transaction: t });

    await t.commit();

    const students = await Student.findAll({ include: [{ model: Class, as: 'class' }], order: [['name', 'ASC']] });
    res.render('admin/students', {
      user: req.session,
      students,
      classes,
      search: '',
      selectedClassId: '',
      error: null,
      success: `Student added successfully! Parent Login -> ID: "${parentUsername}", Password: "${parentPassword}" (DOB: DDMMYYYY)`
    });
  } catch (error) {
    await t.rollback();
    console.error('Error creating student:', error);
    const students = await Student.findAll({ include: [{ model: Class, as: 'class' }], order: [['name', 'ASC']] });
    res.render('admin/students', {
      user: req.session,
      students,
      classes,
      search: '',
      selectedClassId: '',
      error: 'Failed to add student.',
      success: null
    });
  }
});

// Update student
router.post('/students/update/:id', async (req, res) => {
  const { name, admissionNumber, dateOfBirth, gender, address, parentName, parentPhone, parentEmail, classId } = req.body;
  const studentId = parseInt(req.params.id, 10);
  try {
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.redirect('/admin/students');
    }

    let finalAdmissionNo = admissionNumber ? admissionNumber.trim() : student.admissionNumber;

    await Student.update({
      name: name ? name.trim() : student.name,
      admissionNumber: finalAdmissionNo,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      address: address || null,
      parentName: parentName || null,
      parentPhone: parentPhone || null,
      parentEmail: parentEmail || null,
      classId: classId === '' ? null : classId
    }, { where: { id: studentId } });

    // Update parent user login
    const user = await User.findOne({ where: { role: 'parent', referenceId: studentId } });
    const parentUsername = finalAdmissionNo.toLowerCase();
    const parentPassword = formatDobToPassword(dateOfBirth);

    if (user) {
      user.username = parentUsername;
      if (dateOfBirth) {
        user.password = parentPassword;
      }
      await user.save();
    } else {
      await User.create({
        username: parentUsername,
        password: parentPassword,
        role: 'parent',
        referenceId: studentId
      });
    }

    res.redirect('/admin/students');
  } catch (error) {
    console.error('Error updating student:', error);
    res.redirect('/admin/students');
  }
});

// Delete student
router.post('/students/delete/:id', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const studentId = req.params.id;
    // Delete Parent login associated with student
    await User.destroy({ where: { role: 'parent', referenceId: studentId } }, { transaction: t });
    // Delete attendance records
    await Attendance.destroy({ where: { studentId } }, { transaction: t });
    // Delete marks records
    await Mark.destroy({ where: { studentId } }, { transaction: t });
    // Delete Student record
    await Student.destroy({ where: { id: studentId } }, { transaction: t });

    await t.commit();
    res.redirect('/admin/students');
  } catch (error) {
    await t.rollback();
    console.error('Error deleting student:', error);
    res.redirect('/admin/students');
  }
});

// ==========================================
// 4. REPORTS SECTION
// ==========================================

// Attendance reports
router.get('/reports/attendance', async (req, res) => {
  const { classId, startDate, endDate } = req.query;
  const classes = await Class.findAll({ order: [['level', 'ASC']] });

  let studentWhere = {};
  if (classId) {
    studentWhere.classId = classId;
  }

  let attendanceWhere = {};
  if (startDate || endDate) {
    attendanceWhere.date = {};
    if (startDate) {
      attendanceWhere.date[Op.gte] = startDate;
    }
    if (endDate) {
      attendanceWhere.date[Op.lte] = endDate;
    }
  }

  try {
    const attendanceRecords = await Attendance.findAll({
      where: attendanceWhere,
      include: [
        {
          model: Student,
          as: 'student',
          where: studentWhere,
          include: [{ model: Class, as: 'class' }]
        }
      ],
      order: [['date', 'DESC'], [{ model: Student, as: 'student' }, 'name', 'ASC']]
    });

    // Summary calculations
    let totalCount = attendanceRecords.length;
    let presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
    let absentCount = attendanceRecords.filter(r => r.status === 'Absent').length;
    let lateCount = attendanceRecords.filter(r => r.status === 'Late').length;
    
    let stats = {
      totalCount,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate: totalCount > 0 ? Math.round(((presentCount + (lateCount * 0.5)) / totalCount) * 100) : 100
    };

    res.render('admin/report-attendance', {
      user: req.session,
      activePage: 'attendance-report',
      classes,
      records: attendanceRecords,
      stats,
      filters: {
        classId: classId || '',
        startDate: startDate || '',
        endDate: endDate || ''
      }
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Marks reports
router.get('/reports/marks', async (req, res) => {
  const { classId, subjectName, examType } = req.query;
  const classes = await Class.findAll({ order: [['level', 'ASC']] });

  // Dynamically get unique subjects and exam types for filter options
  const uniqueSubjects = await Mark.findAll({
    attributes: [[sequelize.fn('DISTINCT', sequelize.col('subjectName')), 'subjectName']],
    raw: true
  });
  const uniqueExams = await Mark.findAll({
    attributes: [[sequelize.fn('DISTINCT', sequelize.col('examType')), 'examType']],
    raw: true
  });

  let studentWhere = {};
  if (classId) {
    studentWhere.classId = classId;
  }

  let marksWhere = {};
  if (subjectName) {
    marksWhere.subjectName = subjectName;
  }
  if (examType) {
    marksWhere.examType = examType;
  }

  try {
    const marksRecords = await Mark.findAll({
      where: marksWhere,
      include: [
        {
          model: Student,
          as: 'student',
          where: studentWhere,
          include: [{ model: Class, as: 'class' }]
        }
      ],
      order: [[{ model: Student, as: 'student' }, 'name', 'ASC'], ['subjectName', 'ASC']]
    });

    // Calculate analytics
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let highestMark = 0;
    let lowestMark = 100;
    let passCount = 0;

    marksRecords.forEach(m => {
      totalMarksObtained += m.marksObtained;
      totalMaxMarks += m.maxMarks;
      
      const percentage = (m.marksObtained / m.maxMarks) * 100;
      if (percentage > highestMark) highestMark = percentage;
      if (percentage < lowestMark) lowestMark = percentage;
      if (percentage >= 50) passCount++; // 50% pass criteria
    });

    let stats = {
      recordCount: marksRecords.length,
      averagePercentage: totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0,
      highestMark: marksRecords.length > 0 ? Math.round(highestMark) : 0,
      lowestMark: marksRecords.length > 0 ? Math.round(lowestMark) : 0,
      passRate: marksRecords.length > 0 ? Math.round((passCount / marksRecords.length) * 100) : 0
    };

    res.render('admin/report-marks', {
      user: req.session,
      activePage: 'marks-report',
      classes,
      subjects: uniqueSubjects.map(s => s.subjectName),
      exams: uniqueExams.map(e => e.examType),
      records: marksRecords,
      stats,
      filters: {
        classId: classId || '',
        subjectName: subjectName || '',
        examType: examType || ''
      }
    });
  } catch (error) {
    console.error('Error generating marks report:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ==========================================
// 6. TASK MANAGEMENT
// ==========================================
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        { model: Class, as: 'class' },
        { model: User, as: 'creator' }
      ],
      order: [['createdAt', 'DESC']]
    });
    const classes = await Class.findAll({ order: [['level', 'ASC']] });
    res.render('admin/tasks', { 
      user: req.session, 
      tasks, 
      classes, 
      activePage: 'tasks',
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/tasks/create', async (req, res) => {
  const { title, description, type, classId, targetRole, requiresPercentage } = req.body;
  try {
    await Task.create({
      title,
      description,
      type,
      classId: classId === 'all' || !classId ? null : parseInt(classId),
      creatorId: req.session.userId,
      targetRole: targetRole || 'parent',
      requiresPercentage: requiresPercentage === 'true' || requiresPercentage === true
    });
    res.redirect('/admin/tasks?success=Task+created+successfully');
  } catch (error) {
    console.error('Error creating task:', error);
    res.redirect('/admin/tasks?error=Failed+to+create+task');
  }
});

router.post('/tasks/delete/:id', async (req, res) => {
  try {
    await Task.destroy({ where: { id: req.params.id } });
    res.redirect('/admin/tasks?success=Task+deleted+successfully');
  } catch (error) {
    console.error('Error deleting task:', error);
    res.redirect('/admin/tasks?error=Failed+to+delete+task');
  }
});

// ==========================================
// FORMAT DATABASE (DANGER ZONE)
// ==========================================
router.post('/format-database', async (req, res) => {
  try {
    // Drop all tables and recreate them
    await sequelize.sync({ force: true });
    
    // Reseed the database with default values (admin user)
    const seedDatabase = require('../config/seeder');
    await seedDatabase();

    // Log the user out since their session user might have been recreated with a new ID
    req.session.destroy();
    
    // Redirect to login page
    res.redirect('/auth/login?success=Database+formatted+successfully.+Please+login+again.');
  } catch (error) {
    console.error('Error formatting database:', error);
    res.redirect('/admin/dashboard?error=Failed+to+format+database');
  }
});

module.exports = router;
