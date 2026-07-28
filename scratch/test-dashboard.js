const { Student, Teacher, Class, Attendance, Mark, Task, TaskCompletion } = require('../models');

async function testAdminDashboard() {
  try {
    const studentCount = await Student.count();
    const teacherCount = await Teacher.count();
    const classCount = await Class.count();

    const totalAttendance = await Attendance.count();
    const presentAttendance = await Attendance.count({ where: { status: 'Present' } });
    const attendanceRate = totalAttendance > 0 
      ? Math.round((presentAttendance / totalAttendance) * 100) 
      : 100;

    const classes = await Class.findAll({
      include: [{ model: Student, as: 'students' }]
    });
    const chartLabels = classes.map(c => c.name);
    const chartData = classes.map(c => c.students.length);

    const attendanceSummary = await Attendance.findAll({
      attributes: ['date', 'status'],
      order: [['date', 'ASC']]
    });

    console.log('Admin Dashboard queries SUCCESSFUL!');
    console.log('Stats:', { studentCount, teacherCount, classCount, attendanceRate });
    process.exit(0);
  } catch (err) {
    console.error('Admin Dashboard Error:', err);
    process.exit(1);
  }
}

testAdminDashboard();
