// Mock delay to simulate a network request
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const saveRevisionSchedule = async (scheduleData) => {
  await delay(600);
  console.log('[Mock API] Revision schedule saved:', scheduleData);
  return { success: true, message: 'Revision interval synced', data: scheduleData };
};
