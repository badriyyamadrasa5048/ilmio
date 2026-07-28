const { Attendance, Mark, Student, Class } = require('../models');

async function testTeacherFlow() {
  console.log('=== Testing Teacher Attendance & Marks Save ===\n');

  // Simulate what the teacher POST attendance route does after the fix
  const attendanceBody = {
    classId: '1',
    date: '2026-06-13',
    attendance: {
      's_5': { status: 'Late', notes: 'Test late' },
      's_2': { status: 'Absent', notes: 'Sick leave' },
      's_1': { status: 'Present', notes: '' }
    }
  };

  console.log('--- Testing Attendance Save ---');
  try {
    const records = Object.keys(attendanceBody.attendance).map(key => ({
      studentId: parseInt(key.replace('s_', '')),
      date: attendanceBody.date,
      status: attendanceBody.attendance[key].status,
      notes: attendanceBody.attendance[key].notes || ''
    }));

    console.log('Records to insert:', JSON.stringify(records, null, 2));

    for (const record of records) {
      const existing = await Attendance.findOne({
        where: { studentId: record.studentId, date: record.date }
      });
      if (existing) {
        existing.status = record.status;
        existing.notes = record.notes;
        await existing.save();
        console.log(`✓ Updated attendance for student ID ${record.studentId}: ${record.status}`);
      } else {
        await Attendance.create(record);
        console.log(`✓ Created attendance for student ID ${record.studentId}: ${record.status}`);
      }
    }
    console.log('\n✅ Attendance save: SUCCESS\n');
  } catch (err) {
    console.error('\n❌ Attendance save: FAILED:', err.message);
  }

  // Test marks save
  const marksBody = {
    classId: '1',
    subjectName: 'Quranic Studies',
    examType: 'Final',
    examDate: '2026-06-13',
    marks: {
      's_5': { marksObtained: '88', maxMarks: '100' },
      's_2': { marksObtained: '76', maxMarks: '100' },
      's_1': { marksObtained: '95', maxMarks: '100' }
    }
  };

  console.log('--- Testing Marks Save ---');
  try {
    for (const key of Object.keys(marksBody.marks)) {
      const realStudentId = parseInt(key.replace('s_', ''));
      const marksObtained = parseFloat(marksBody.marks[key].marksObtained);
      const maxMarks = parseFloat(marksBody.marks[key].maxMarks || 100);

      if (isNaN(marksObtained)) continue;

      const existing = await Mark.findOne({
        where: {
          studentId: realStudentId,
          subjectName: marksBody.subjectName,
          examType: marksBody.examType
        }
      });

      if (existing) {
        existing.marksObtained = marksObtained;
        existing.maxMarks = maxMarks;
        existing.examDate = marksBody.examDate;
        await existing.save();
        console.log(`✓ Updated marks for student ID ${realStudentId}: ${marksObtained}/${maxMarks}`);
      } else {
        await Mark.create({
          studentId: realStudentId,
          subjectName: marksBody.subjectName,
          marksObtained,
          maxMarks,
          examType: marksBody.examType,
          examDate: marksBody.examDate
        });
        console.log(`✓ Created marks for student ID ${realStudentId}: ${marksObtained}/${maxMarks}`);
      }
    }
    console.log('\n✅ Marks save: SUCCESS');
  } catch (err) {
    console.error('\n❌ Marks save: FAILED:', err.message);
  }
}

testTeacherFlow();
