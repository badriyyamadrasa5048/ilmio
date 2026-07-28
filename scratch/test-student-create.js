const { Student, User } = require('../models');

function formatDobToPassword(dobStr) {
  if (!dobStr || !dobStr.trim()) return '01012000';
  const parts = dobStr.trim().split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}${month}${year}`;
  }
  return dobStr.replace(/[^0-9]/g, '') || '01012000';
}

async function testStudentCreation() {
  try {
    console.log('Testing optional student creation...');
    
    // Create student with only Name and DOB
    const studentCount = await Student.count();
    const finalAdmissionNo = `S${1000 + studentCount + 1}`;
    const dob = '2012-05-15';

    const student = await Student.create({
      name: 'Test Student Optional',
      admissionNumber: finalAdmissionNo,
      dateOfBirth: dob
    });

    const parentUsername = finalAdmissionNo.toLowerCase();
    const parentPassword = formatDobToPassword(dob);

    const user = await User.create({
      username: parentUsername,
      password: parentPassword,
      role: 'parent',
      referenceId: student.id
    });

    console.log('Student Created:', student.toJSON());
    console.log('Parent Login Created:', {
      id: parentUsername,
      pass: parentPassword,
      expectedPass: '15052012'
    });

    const isPassMatch = await user.comparePassword('15052012');
    console.log('Password Match Test (15052012):', isPassMatch ? 'PASSED' : 'FAILED');

    process.exit(0);
  } catch (err) {
    console.error('Error creating student test:', err);
    process.exit(1);
  }
}

testStudentCreation();
