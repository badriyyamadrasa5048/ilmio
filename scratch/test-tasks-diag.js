const { Student, Class, Task, TaskCompletion, User } = require('../models');
const { Op } = require('sequelize');

async function test() {
  const teacherId = 1; // teacher1's Reference ID
  const today = new Date().toISOString().split('T')[0];
  const selectedDate = today;
  const activeTab = 'routines';

  try {
    const classes = await Class.findAll({ 
      where: { teacherId },
      order: [['name', 'ASC']]
    });
    console.log('Classes:', classes.length);

    let activeClassId = classes[0]?.id;
    console.log('Active Class ID:', activeClassId);

    const selectedClass = await Class.findByPk(activeClassId);
    console.log('Selected Class:', selectedClass ? selectedClass.name : 'none');

    const students = await Student.findAll({
      where: { classId: activeClassId },
      order: [['name', 'ASC']]
    });
    console.log('Students:', students.length);

    const activeTasks = await Task.findAll({
      where: {
        targetRole: 'teacher',
        type: activeTab === 'routines' ? 'daily' : 'permanent',
        [Op.or]: [
          { classId: null },
          { classId: activeClassId }
        ]
      },
      order: [['createdAt', 'ASC']]
    });
    console.log('Active Tasks:', activeTasks.length);

    if (students.length > 0 && activeTasks.length > 0) {
      const completions = await TaskCompletion.findAll({
        where: {
          taskId: activeTasks.map(t => t.id),
          studentId: students.map(s => s.id),
          date: activeTab === 'routines' ? selectedDate : null
        }
      });
      console.log('Completions:', completions.length);
    }

    const createdTasks = await Task.findAll({
      where: { creatorId: 1 }, // mock creatorId
      include: [{ model: Class, as: 'class' }],
      order: [['createdAt', 'DESC']]
    });
    console.log('Created Tasks:', createdTasks.length);

    console.log('Queries completed successfully!');
  } catch (err) {
    console.error('DIAGNOSTIC ERROR:', err);
  }
  process.exit(0);
}

test();
