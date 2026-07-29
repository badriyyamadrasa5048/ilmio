const { Attendance, Student, Class } = require('../models');

async function testSaveAttendance() {
  try {
    const student = await Student.findOne();
    if (!student) {
      console.log('No student found in DB.');
      process.exit(0);
    }
    const today = new Date().toISOString().split('T')[0];

    const [att, created] = await Attendance.findOrCreate({
      where: { studentId: student.id, date: today },
      defaults: { status: 'Present', checkInTime: '08:30:00' }
    });

    if (!created) {
      att.status = 'Present';
      att.checkInTime = '08:30:00';
      await att.save();
    }

    console.log('Attendance saved successfully:', att.toJSON());
    process.exit(0);
  } catch (err) {
    console.error('Error saving attendance:', err);
    process.exit(1);
  }
}

testSaveAttendance();
