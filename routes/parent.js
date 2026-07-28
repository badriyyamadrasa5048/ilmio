const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const { Student, Class, Teacher, Attendance, Mark, Task, TaskCompletion } = require('../models');
const { Op } = require('sequelize');

// Apply Parent role check
router.use(isAuthenticated, hasRole('parent'));

// ==========================================
// 1. VIEW STUDENT PROFILE
// ==========================================
router.get('/profile', async (req, res) => {
  const studentId = req.session.referenceId;
  try {
    const student = await Student.findByPk(studentId, {
      include: [
        {
          model: Class,
          as: 'class',
          include: [{ model: Teacher, as: 'classTeacher', foreignKey: 'teacherId' }]
        }
      ]
    });

    if (!student) {
      return res.status(404).send('Student not found.');
    }

    res.render('parent/profile', {
      user: req.session,
      activePage: 'profile',
      student
    });
  } catch (error) {
    console.error('Parent view profile error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ==========================================
// 2. VIEW ATTENDANCE
// ==========================================
router.get('/attendance', async (req, res) => {
  const studentId = req.session.referenceId;
  try {
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).send('Student not found.');
    }

    const attendances = await Attendance.findAll({
      where: { studentId },
      order: [['date', 'DESC']]
    });

    // Counts
    const totalDays = attendances.length;
    const presentDays = attendances.filter(a => a.status === 'Present').length;
    const absentDays = attendances.filter(a => a.status === 'Absent').length;
    const lateDays = attendances.filter(a => a.status === 'Late').length;

    const attendanceRate = totalDays > 0 
      ? Math.round(((presentDays + (lateDays * 0.5)) / totalDays) * 100) 
      : 100;

    res.render('parent/attendance', {
      user: req.session,
      activePage: 'parent-attendance',
      student,
      attendances,
      stats: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendanceRate
      },
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    console.error('Parent view attendance error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ==========================================
// 3. VIEW MARKS
// ==========================================
router.get('/marks', async (req, res) => {
  const studentId = req.session.referenceId;
  try {
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).send('Student not found.');
    }

    const marks = await Mark.findAll({
      where: { studentId },
      order: [['examDate', 'DESC'], ['subjectName', 'ASC']]
    });

    // Group marks by Exam Type
    const groupedMarks = {};
    marks.forEach(m => {
      if (!groupedMarks[m.examType]) {
        groupedMarks[m.examType] = [];
      }
      groupedMarks[m.examType].push(m);
    });

    res.render('parent/marks', {
      user: req.session,
      activePage: 'parent-marks',
      student,
      groupedMarks
    });
  } catch (error) {
    console.error('Parent view marks error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ==========================================
// 4. TASKS & DAILY ROUTINE (PARENT)
// ==========================================
router.get('/tasks', async (req, res) => {
  const studentId = req.session.referenceId;
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).send('Student not found.');
    }

    // Fetch tasks created by Admin (classId = null) and by this student's Class Teacher
    const tasks = await Task.findAll({
      where: {
        [Op.or]: [
          { classId: null },
          { classId: student.classId }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    // Fetch completions for today (daily tasks) or no date (permanent tasks)
    const completions = await TaskCompletion.findAll({
      where: {
        studentId,
        [Op.or]: [
          { date: todayStr },
          { date: null }
        ]
      }
    });

    // Map completions as a lookup object: { taskId: { completed (boolean), percentage (int) } }
    const completionMap = {};
    completions.forEach(c => {
      completionMap[c.taskId] = {
        completed: c.completed,
        percentage: c.percentage
      };
    });

    res.render('parent/tasks', {
      user: req.session,
      student,
      tasks,
      completionMap,
      todayStr,
      activePage: 'parent-tasks'
    });
  } catch (error) {
    console.error('Parent fetch tasks error:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/tasks/toggle', async (req, res) => {
  const studentId = req.session.referenceId;
  const { taskId, completed, percentage } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];
  const isCompleted = completed === 'true';

  try {
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const completionDate = task.type === 'daily' ? todayStr : null;
    const percentVal = percentage !== undefined ? parseInt(percentage) : null;

    // Find if a completion status exists
    let completion = await TaskCompletion.findOne({
      where: {
        taskId: task.id,
        studentId,
        date: completionDate
      }
    });

    if (completion) {
      completion.completed = isCompleted;
      completion.percentage = percentVal;
      await completion.save();
    } else {
      completion = await TaskCompletion.create({
        taskId: task.id,
        studentId,
        date: completionDate,
        completed: isCompleted,
        percentage: percentVal
      });
    }

    res.json({ success: true, completed: completion.completed, percentage: completion.percentage });
  } catch (error) {
    console.error('Parent toggle task error:', error);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

router.post('/attendance/remarks', async (req, res) => {
  const { attendanceId, parentRemarks } = req.body;
  const studentId = req.session.referenceId;

  try {
    const att = await Attendance.findOne({
      where: {
        id: attendanceId,
        studentId
      }
    });

    if (!att) {
      return res.redirect('/parent/attendance?error=Attendance+record+not+found');
    }

    if (att.status !== 'Absent') {
      return res.redirect('/parent/attendance?error=Remarks+can+only+be+added+for+absences');
    }

    att.parentRemarks = parentRemarks;
    await att.save();

    res.redirect('/parent/attendance?success=Remarks+updated+successfully');
  } catch (error) {
    console.error('Error saving parent remarks:', error);
    res.redirect('/parent/attendance?error=Failed+to+save+remarks');
  }
});

module.exports = router;
