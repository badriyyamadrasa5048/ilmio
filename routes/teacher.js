const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const { Student, Class, Attendance, Mark, Teacher, Task, User, TaskCompletion } = require('../models');
const { Op } = require('sequelize');

// Protect via Teacher role
router.use(isAuthenticated, hasRole('teacher'));

// ==========================================
// 1. VIEW ASSIGNED STUDENTS
// ==========================================
router.get('/students', async (req, res) => {
  const teacherId = req.session.referenceId;
  try {
    // Find all classes assigned to this teacher
    const classes = await Class.findAll({
      where: { teacherId }
    });

    const classIds = classes.map(c => c.id);

    // Find all students in these classes
    const students = await Student.findAll({
      where: { classId: classIds },
      include: [{ model: Class, as: 'class' }],
      order: [[{ model: Class, as: 'class' }, 'name', 'ASC'], ['name', 'ASC']]
    });

    res.render('teacher/students', {
      user: req.session,
      activePage: 'students',
      students,
      classes
    });
  } catch (error) {
    console.error('Teacher view students error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ==========================================
// 2. ATTENDANCE ENTRY MODULE
// ==========================================

// Get attendance sheet
// Helper to calculate student attendance status based on timings
function calculateStatus(checkInTime, startTime, endTime, graceTime) {
  if (!checkInTime) return 'Absent';

  const parseTime = (timeStr) => {
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  try {
    const checkInMin = parseTime(checkInTime);
    const startMin = parseTime(startTime);
    const endMin = parseTime(endTime);
    const graceLimitMin = startMin + graceTime;

    if (checkInMin <= graceLimitMin) {
      return 'Present';
    } else if (checkInMin <= endMin) {
      return 'Late';
    } else {
      return 'Absent';
    }
  } catch (err) {
    console.error('Error parsing time in calculateStatus:', err);
    return 'Present';
  }
}

router.get('/attendance', async (req, res) => {
  const teacherId = req.session.referenceId;
  const { classId, date } = req.query;

  const today = new Date().toISOString().split('T')[0];
  const selectedDate = date || today;

  try {
    // Fetch classes taught by this teacher
    const classes = await Class.findAll({ where: { teacherId } });

    // Auto-select the first class if none selected
    let activeClassId = classId;
    if (!activeClassId && classes.length > 0) {
      activeClassId = classes[0].id;
    }

    let students = [];
    let attendanceMap = {};
    let selectedClass = null;

    if (activeClassId) {
      selectedClass = await Class.findByPk(activeClassId);
      students = await Student.findAll({
        where: { classId: activeClassId },
        order: [['name', 'ASC']]
      });

      if (students.length > 0) {
        // Find existing attendance for these students on selectedDate
        const existingAttendance = await Attendance.findAll({
          where: {
            studentId: students.map(s => s.id),
            date: selectedDate
          }
        });

        existingAttendance.forEach(att => {
          attendanceMap[att.studentId] = {
            status: att.status,
            checkInTime: att.checkInTime || '',
            notes: att.notes || ''
          };
        });
      }
    }

    res.render('teacher/attendance', {
      user: req.session,
      activePage: 'attendance',
      classes,
      students,
      selectedClassId: activeClassId || '',
      selectedClass,
      selectedDate,
      attendanceMap,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('Teacher get attendance error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Save attendance records
router.post('/attendance', async (req, res) => {
  const { classId, date, attendance } = req.body; // attendance is { studentId: { checked, checkInTime, notes } }
  
  if (!classId || !date) {
    return res.redirect(`/teacher/attendance?classId=${classId || ''}&date=${date || ''}&error=Missing+required+fields`);
  }

  try {
    const targetClass = await Class.findByPk(classId);
    if (!targetClass) {
      return res.redirect(`/teacher/attendance?error=Class+not+found`);
    }

    const { startTime, endTime, graceTime } = targetClass;
    const students = await Student.findAll({ where: { classId } });

    for (const student of students) {
      const key = `s_${student.id}`;
      const studentSubmitted = attendance && attendance[key];
      
      let status = 'Absent';
      let checkInTime = null;
      let notes = '';

      if (studentSubmitted && studentSubmitted.checked === 'true') {
        checkInTime = studentSubmitted.checkInTime || null;
        status = calculateStatus(checkInTime, startTime, endTime, graceTime);
        notes = studentSubmitted.notes || '';
      }

      // Safe manual upsert using findOne & create/update
      const existing = await Attendance.findOne({
        where: {
          studentId: student.id,
          date: date
        }
      });

      if (existing) {
        existing.status = status;
        existing.checkInTime = checkInTime;
        existing.notes = notes;
        await existing.save();
      } else {
        await Attendance.create({
          studentId: student.id,
          date: date,
          status: status,
          checkInTime: checkInTime,
          notes: notes
        });
      }
    }

    res.redirect(`/teacher/attendance?classId=${classId}&date=${date}&success=Attendance+updated+successfully`);
  } catch (error) {
    console.error('Teacher save attendance error:', error);
    res.redirect(`/teacher/attendance?classId=${classId}&date=${date}&error=Failed+to+save+attendance`);
  }
});

// Save single student attendance instantly via AJAX
router.post('/attendance/save-single', async (req, res) => {
  const { classId, date, studentId, checked, checkInTime } = req.body;
  const teacherId = req.session.referenceId;

  try {
    const belongs = await Class.findOne({ where: { id: classId, teacherId } });
    if (!belongs) {
      return res.status(403).json({ error: 'Unauthorized class selection' });
    }

    const { startTime, endTime, graceTime } = belongs;

    let status = 'Absent';
    let savedTime = null;

    if (checked === 'true') {
      savedTime = checkInTime || null;
      status = calculateStatus(savedTime, startTime, endTime, graceTime);
    }

    const existing = await Attendance.findOne({
      where: {
        studentId: parseInt(studentId),
        date: date
      }
    });

    if (existing) {
      existing.status = status;
      existing.checkInTime = savedTime;
      await existing.save();
    } else {
      await Attendance.create({
        studentId: parseInt(studentId),
        date: date,
        status: status,
        checkInTime: savedTime
      });
    }

    res.json({ success: true, status, checkInTime: savedTime });
  } catch (error) {
    console.error('Teacher save single attendance error:', error);
    res.status(500).json({ error: 'Failed to save attendance' });
  }
});

// ==========================================
// 3. MARKS ENTRY MODULE
// ==========================================

// Get marks sheet
router.get('/marks', async (req, res) => {
  const teacherId = req.session.referenceId;
  const { classId, subjectName, examType, examDate } = req.query;
  const today = new Date().toISOString().split('T')[0];

  try {
    const classes = await Class.findAll({ where: { teacherId } });

    // Use teacher's default teaching subject if not specified
    let defaultSubject = '';
    const teacher = await Teacher.findByPk(teacherId);
    if (teacher) {
      defaultSubject = teacher.subject;
    }

    const activeSubject = subjectName || defaultSubject;
    const activeExamType = examType || 'Midterm';
    const activeExamDate = examDate || today;

    let students = [];
    let marksMap = {};

    if (classId) {
      students = await Student.findAll({
        where: { classId },
        order: [['name', 'ASC']]
      });

      const existingMarks = await Mark.findAll({
        where: {
          studentId: students.map(s => s.id),
          subjectName: activeSubject,
          examType: activeExamType
        }
      });

      existingMarks.forEach(m => {
        marksMap[m.studentId] = {
          marksObtained: m.marksObtained,
          maxMarks: m.maxMarks
        };
      });
    }

    res.render('teacher/marks', {
      user: req.session,
      activePage: 'marks',
      classes,
      students,
      selectedClassId: classId || '',
      subjectName: activeSubject,
      examType: activeExamType,
      examDate: activeExamDate,
      marksMap,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('Teacher get marks error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Save marks records
router.post('/marks', async (req, res) => {
  const { classId, subjectName, examType, examDate, marks } = req.body; // marks is { studentId: { marksObtained, maxMarks } }

  if (!classId || !subjectName || !examType || !examDate || !marks) {
    return res.redirect(`/teacher/marks?classId=${classId || ''}&subjectName=${subjectName || ''}&examType=${examType || ''}&examDate=${examDate || ''}&error=Missing+required+fields`);
  }

  try {
    for (const key of Object.keys(marks)) {
      const realStudentId = parseInt(key.replace('s_', ''));
      const marksObtained = parseFloat(marks[key].marksObtained);
      const maxMarks = parseFloat(marks[key].maxMarks || 100);

      // Skip entries where marks obtained is empty (allow partial submission)
      if (isNaN(marksObtained)) continue;

      // Find if mark exists and update, or create a new one
      const existing = await Mark.findOne({
        where: {
          studentId: realStudentId,
          subjectName,
          examType
        }
      });

      if (existing) {
        existing.marksObtained = marksObtained;
        existing.maxMarks = maxMarks;
        existing.examDate = examDate;
        await existing.save();
      } else {
        await Mark.create({
          studentId: realStudentId,
          subjectName,
          marksObtained,
          maxMarks,
          examType,
          examDate
        });
      }
    }

    res.redirect(`/teacher/marks?classId=${classId}&subjectName=${encodeURIComponent(subjectName)}&examType=${encodeURIComponent(examType)}&examDate=${examDate}&success=Marks+saved+successfully`);
  } catch (error) {
    console.error('Teacher save marks error:', error);
    res.redirect(`/teacher/marks?classId=${classId}&subjectName=${encodeURIComponent(subjectName)}&examType=${encodeURIComponent(examType)}&examDate=${examDate}&error=Failed+to+save+marks`);
  }
});

// ==========================================
// 4. TASK MANAGEMENT (TEACHER)
// ==========================================
router.get('/tasks', async (req, res) => {
  const teacherId = req.session.referenceId;
  const { classId, date, tab } = req.query;

  const today = new Date().toISOString().split('T')[0];
  const selectedDate = date || today;
  const activeTab = tab || 'routines'; // 'routines' (daily) vs 'tasks' (permanent)

  try {
    const classes = await Class.findAll({ 
      where: { teacherId },
      order: [['name', 'ASC']]
    });

    let activeClassId = classId;
    if (!activeClassId && classes.length > 0) {
      activeClassId = classes[0].id;
    }

    let students = [];
    let activeTasks = [];
    let completionMap = {};
    let selectedClass = null;
    let parentTasks = [];
    let parentCompletions = [];

    if (activeClassId) {
      selectedClass = await Class.findByPk(activeClassId);
      
      students = await Student.findAll({
        where: { classId: activeClassId },
        order: [['name', 'ASC']]
      });

      // Find tasks assigned to this class (or all classes/null) that are for Teachers
      activeTasks = await Task.findAll({
        where: {
          targetRole: 'teacher',
          type: activeTab === 'routines' ? 'daily' : 'permanent',
          [Op.or]: [
            { classId: null },
            { classId: activeClassId }
          ]
        },
        order: [['createdAt', 'ASC']]
      });

      if (students.length > 0 && activeTasks.length > 0) {
        // Fetch task completions for the selected students and date (if daily)
        const completions = await TaskCompletion.findAll({
          where: {
            taskId: activeTasks.map(t => t.id),
            studentId: students.map(s => s.id),
            date: activeTab === 'routines' ? selectedDate : null
          }
        });

        completions.forEach(c => {
          if (!completionMap[c.studentId]) {
            completionMap[c.studentId] = {};
          }
          completionMap[c.studentId][c.taskId] = {
            completed: c.completed,
            percentage: c.percentage
          };
        });
      }

      // Fetch parent tasks & completed records for class students
      parentTasks = await Task.findAll({
        where: {
          targetRole: 'parent',
          [Op.or]: [
            { classId: null },
            { classId: activeClassId }
          ]
        },
        order: [['createdAt', 'DESC']]
      });

      if (students.length > 0) {
        parentCompletions = await TaskCompletion.findAll({
          where: {
            studentId: students.map(s => s.id)
          },
          include: [
            { model: Student, as: 'student' },
            { model: Task, as: 'task' }
          ],
          order: [['updatedAt', 'DESC']]
        });
      }
    }

    // Created tasks list for management in offcanvas/modal
    const createdTasks = await Task.findAll({
      where: { creatorId: req.session.userId },
      include: [{ model: Class, as: 'class' }],
      order: [['createdAt', 'DESC']]
    });

    res.render('teacher/tasks', {
      user: req.session,
      activePage: 'tasks',
      classes,
      selectedClassId: activeClassId || '',
      selectedClass,
      students,
      activeTasks,
      completionMap,
      parentTasks,
      parentCompletions,
      selectedDate,
      activeTab,
      createdTasks,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('Teacher fetch tasks error:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/tasks/create', async (req, res) => {
  const { title, description, type, classId, targetRole, requiresPercentage } = req.body;
  const teacherId = req.session.referenceId;
  try {
    // Validate that class belongs to this teacher
    const belongs = await Class.findOne({ where: { id: classId, teacherId } });
    if (!belongs) {
      return res.redirect('/teacher/tasks?error=Unauthorized+class+selection');
    }

    await Task.create({
      title,
      description,
      type,
      classId: parseInt(classId),
      creatorId: req.session.userId,
      targetRole: targetRole || 'parent',
      requiresPercentage: requiresPercentage === 'true' || requiresPercentage === true
    });
    res.redirect('/teacher/tasks?success=Task+created+successfully');
  } catch (error) {
    console.error('Teacher create task error:', error);
    res.redirect('/teacher/tasks?error=Failed+to+create+task');
  }
});

router.post('/tasks/delete/:id', async (req, res) => {
  try {
    await Task.destroy({ 
      where: { 
        id: req.params.id,
        creatorId: req.session.userId // Only allow deletion of their own tasks
      } 
    });
    res.redirect('/teacher/tasks?success=Task+deleted+successfully');
  } catch (error) {
    console.error('Teacher delete task error:', error);
    res.redirect('/teacher/tasks?error=Failed+to+delete+task');
  }
});

module.exports = router;
