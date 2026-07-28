const { Student, Class, Teacher, User, Attendance } = require('../models');

async function test() {
  try {
    const students = await Student.findAll();
    console.log('--- Students ---');
    students.forEach(s => {
      console.log(`ID: ${s.id}, Name: ${s.name}, ClassId: ${s.classId}`);
    });

    const classes = await Class.findAll();
    console.log('\n--- Classes ---');
    classes.forEach(c => {
      console.log(`ID: ${c.id}, Name: ${c.name}`);
    });

    const teachers = await Teacher.findAll();
    console.log('\n--- Teachers ---');
    teachers.forEach(t => {
      console.log(`ID: ${t.id}, Name: ${t.name}`);
    });

    const users = await User.findAll();
    console.log('\n--- Users ---');
    users.forEach(u => {
      console.log(`ID: ${u.id}, Username: ${u.username}, Role: ${u.role}, RefId: ${u.referenceId}`);
    });

    const attendances = await Attendance.findAll();
    console.log('\n--- Attendances ---');
    attendances.forEach(a => {
      console.log(`ID: ${a.id}, StudentId: ${a.studentId}, Date: ${a.date}, Status: ${a.status}`);
    });

  } catch (err) {
    console.error(err);
  }
}

test();
