const { Attendance, Mark, Student } = require('../models');

async function testInsert() {
  try {
    console.log('Fetching Student ID 1...');
    const s = await Student.findByPk(1);
    if (!s) {
      console.log('Student ID 1 not found!');
      return;
    }
    console.log(`Found Student: ID=${s.id}, Name=${s.name}`);

    console.log('Inserting Attendance...');
    const att = await Attendance.create({
      studentId: 1,
      date: '2026-06-11',
      status: 'Present',
      notes: 'Test note'
    });
    console.log('Attendance inserted successfully:', att.toJSON());

  } catch (err) {
    console.error('INSERT FAILED ERROR:', err);
  }
}

testInsert();
