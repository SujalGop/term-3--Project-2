// Mock delay to simulate network request
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const saveRevisionSchedule = async (scheduleData) => {
  try {
    // Simulate real network request bridging mock data
    await delay(600);
    console.log('[Mock API] Revision Schedule successfully tracked:', scheduleData);
    
    // Assume success response from fake backend
    return {
      success: true,
      message: 'Revision interval synced with cloud correctly',
      data: scheduleData,
    };
  } catch (error) {
    console.error('[Mock API] Error syncing revision data:', error);
    throw new Error('Failed to save to mock backend');
  }
};
