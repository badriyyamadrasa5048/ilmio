const { Student, User } = require('../models');

async function cleanup() {
  try {
    const student = await Student.findOne({ where: { name: 'Test Student Optional' } });
    if (student) {
      await User.destroy({ where: { role: 'parent', referenceId: student.id } });
      await student.destroy();
      console.log('Test student cleaned up.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanup();
