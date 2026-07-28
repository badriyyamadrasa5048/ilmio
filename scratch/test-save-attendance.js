const { Attendance, Student } = require('../models');

async function run() {
  try {
    const students = await Student.findAll({ where: { classId: 1 } });
    console.log(`Found ${students.length} students in Class 1:`);
    
    for (const student of students) {
      console.log(`- ID: ${student.id}, Name: ${student.name}`);
      try {
        const att = await Attendance.create({
          studentId: student.id,
          date: '2026-06-12',
          status: 'Present',
          notes: 'Test'
        });
        console.log(`  Successfully inserted attendance for ${student.name}`);
        // Clean up
        await att.destroy();
      } catch (err) {
        console.error(`  FAILED to insert attendance for ${student.name}:`, err.message);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

run();
