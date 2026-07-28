const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { Student, Teacher, Class, Attendance, Mark, Task, TaskCompletion } = require('../models');
const { Op } = require('sequelize');

// GET Dashboard (root or /dashboard)
router.get('/', isAuthenticated, async (req, res) => {
  const role = req.session.userRole;
  const refId = req.session.referenceId;

  try {
    if (role === 'admin') {
      // 1. Admin Dashboard Analytics
      const studentCount = await Student.count();
      const teacherCount = await Teacher.count();
      const classCount = await Class.count();

      // Attendance rate overall
      const totalAttendance = await Attendance.count();
      const presentAttendance = await Attendance.count({ where: { status: 'Present' } });
      const attendanceRate = totalAttendance > 0 
        ? Math.round((presentAttendance / totalAttendance) * 100) 
        : 100;

      // Class-wise student counts for Chart.js
      const classes = await Class.findAll({
        include: [{ model: Student, as: 'students' }]
      });
      const chartLabels = classes.map(c => c.name);
      const chartData = classes.map(c => c.students.length);

      // Attendance history for the last 5 days
      const attendanceSummary = await Attendance.findAll({
        attributes: ['date', 'status'],
        order: [['date', 'ASC']]
      });

      // Group attendance by date
      const attendanceByDate = {};
      attendanceSummary.forEach(att => {
        if (!attendanceByDate[att.date]) {
          attendanceByDate[att.date] = { Present: 0, Total: 0 };
        }
        attendanceByDate[att.date].Total++;
        if (att.status === 'Present') {
          attendanceByDate[att.date].Present++;
        }
      });

      const attendanceDates = Object.keys(attendanceByDate).slice(-7); // Last 7 records
      const attendanceRates = attendanceDates.map(date => {
        const item = attendanceByDate[date];
        return Math.round((item.Present / item.Total) * 100);
      });

      return res.render('admin/dashboard', {
        user: req.session,
        activePage: 'dashboard',
        stats: {
          studentCount,
          teacherCount,
          classCount,
          attendanceRate
        },
        chart: {
          labels: JSON.stringify(chartLabels),
          data: JSON.stringify(chartData),
          attDates: JSON.stringify(attendanceDates),
          attRates: JSON.stringify(attendanceRates)
        }
      });

    } else if (role === 'teacher') {
      // 2. Teacher Dashboard Analytics
      const teacher = await Teacher.findByPk(refId, {
        include: [{ model: Class, as: 'classes' }]
      });

      if (!teacher) {
        return res.status(404).render('auth/login', { error: 'Teacher profile not found.', success: null });
      }

      // Count students in teacher's classes
      const teacherClassIds = teacher.classes.map(c => c.id);
      const studentCount = await Student.count({
        where: { classId: { [Op.in]: teacherClassIds } }
      });

      // Get classes taught by the teacher
      const classes = teacher.classes || [];

      // Get recent marks input by the teacher
      const recentMarks = await Mark.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{ model: Student, as: 'student', where: { classId: { [Op.in]: teacherClassIds } } }]
      });

      return res.render('teacher/dashboard', {
        user: req.session,
        activePage: 'dashboard',
        teacher,
        stats: {
          classCount: classes.length,
          studentCount
        },
        classes,
        recentMarks
      });

    } else if (role === 'parent') {
      // 3. Parent Dashboard Analytics (refId points to Student.id)
      const student = await Student.findByPk(refId, {
        include: [
          { model: Class, as: 'class', include: [{ model: Teacher, as: 'classTeacher', foreignKey: 'teacherId' }] }
        ]
      });

      if (!student) {
        return res.status(404).render('auth/login', { error: 'Student profile not found.', success: null });
      }

      // Get Attendance Summary
      const totalDays = await Attendance.count({ where: { studentId: student.id } });
      const presentDays = await Attendance.count({ where: { studentId: student.id, status: 'Present' } });
      const absentDays = await Attendance.count({ where: { studentId: student.id, status: 'Absent' } });
      const lateDays = await Attendance.count({ where: { studentId: student.id, status: 'Late' } });

      const attendanceRate = totalDays > 0 
        ? Math.round(((presentDays + (lateDays * 0.5)) / totalDays) * 100) 
        : 100;

      // Get Recent marks
      const recentMarks = await Mark.findAll({
        where: { studentId: student.id },
        limit: 5,
        order: [['examDate', 'DESC']]
      });

      // Get today's attendance status
      const todayStr = new Date().toISOString().split('T')[0];
      const todayAttendance = await Attendance.findOne({
        where: {
          studentId: student.id,
          date: todayStr
        }
      });

      // Fetch tasks for parents
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
          studentId: student.id,
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

      return res.render('parent/dashboard', {
        user: req.session,
        activePage: 'dashboard',
        student,
        stats: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          attendanceRate
        },
        recentMarks,
        todayAttendance,
        tasks,
        completionMap,
        todayStr
      });
    }

    res.redirect('/auth/login');
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
