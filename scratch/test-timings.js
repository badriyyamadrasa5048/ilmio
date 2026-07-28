const { Class, Attendance } = require('../models');

async function test() {
  try {
    console.log('Testing Class table...');
    const classes = await Class.findAll();
    console.log(`Successfully fetched ${classes.length} classes.`);
    if (classes.length > 0) {
      console.log('Class Timings properties for first class:', {
        name: classes[0].name,
        startTime: classes[0].startTime,
        endTime: classes[0].endTime,
        graceTime: classes[0].graceTime
      });
    }

    console.log('Testing Attendance table...');
    const atts = await Attendance.findAll();
    console.log(`Successfully fetched ${atts.length} attendance records.`);
    if (atts.length > 0) {
      console.log('Attendance checkInTime property for first record:', {
        id: atts[0].id,
        status: atts[0].status,
        checkInTime: atts[0].checkInTime
      });
    }

    console.log('✅ Class and Attendance models with timings synced successfully!');
  } catch (error) {
    console.error('❌ Timing models test failed:', error);
  }
}

test();
