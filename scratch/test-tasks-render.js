const ejs = require('ejs');
const path = require('path');
const { Student, Class, Task, TaskCompletion, User } = require('../models');
const { Op } = require('sequelize');

async function testRender() {
  const teacherId = 1;
  const today = new Date().toISOString().split('T')[0];
  const selectedDate = today;
  const activeTab = 'routines';

  try {
    const classes = await Class.findAll({ 
      where: { teacherId },
      order: [['name', 'ASC']]
    });
    let activeClassId = classes[0]?.id;
    let students = await Student.findAll({
      where: { classId: activeClassId },
      order: [['name', 'ASC']]
    });
    let activeTasks = await Task.findAll({
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

    let completionMap = {};
    const createdTasks = await Task.findAll({
      where: { creatorId: 1 },
      include: [{ model: Class, as: 'class' }],
      order: [['createdAt', 'DESC']]
    });

    // Mock res.render variables
    const viewData = {
      user: { userId: 1, referenceId: 1, userRole: 'teacher' },
      activePage: 'tasks',
      classes,
      selectedClassId: activeClassId || '',
      selectedClass: classes[0],
      selectedDate,
      activeTab,
      students,
      activeTasks,
      completionMap,
      createdTasks,
      success: null,
      error: null
    };

    // Try rendering
    const filepath = path.join(__dirname, '../views/teacher/tasks.ejs');
    ejs.renderFile(filepath, viewData, { views: [path.join(__dirname, '../views')] }, (err, html) => {
      if (err) {
        console.error('EJS RENDER ERROR:', err);
      } else {
        console.log('EJS Rendered successfully! HTML length:', html.length);
      }
    });

  } catch (err) {
    console.error('DIAGNOSTIC ERROR:', err);
  }
}

testRender();
