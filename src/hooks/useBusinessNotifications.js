import { useEffect } from 'react';
import notificationService from '../utils/notificationService';

/**
 * Custom hook for managing business logic notifications
 */
export const useBusinessNotifications = () => {
  
  /**
   * Initialize business notification listeners
   */
  useEffect(() => {
    // Set up daily activity summary (runs once per day)
    const checkDailySummary = async () => {
      const lastSummary = localStorage.getItem('lastDailySummary');
      const today = new Date().toDateString();
      
      if (lastSummary !== today) {
        try {
          // Check if we already created a summary today by querying the database
          const hasCreatedToday = await notificationService.hasDailySummaryForToday();
          
          if (!hasCreatedToday) {
            // Generate daily summary
            await notificationService.generateDailyActivitySummary();
            localStorage.setItem('lastDailySummary', today);
          } else {
            // Update localStorage to prevent further checks today
            localStorage.setItem('lastDailySummary', today);
          }
        } catch (error) {
          console.error('Error checking/creating daily summary:', error);
        }
      }
    };

    // Set up performance milestone checks (runs every hour)
    const checkPerformance = async () => {
      const lastCheck = localStorage.getItem('lastPerformanceCheck');
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      if (!lastCheck || (now - parseInt(lastCheck)) > oneHour) {
        try {
          await notificationService.checkPerformanceMilestones();
          localStorage.setItem('lastPerformanceCheck', now.toString());
        } catch (error) {
          console.error('Error checking performance milestones:', error);
        }
      }
    };

    // Run checks on mount with a small delay to avoid multiple rapid calls
    const timeoutId = setTimeout(() => {
      checkDailySummary();
      checkPerformance();
    }, 1000);

    // Set up intervals
    const dailyInterval = setInterval(checkDailySummary, 24 * 60 * 60 * 1000); // Daily
    const performanceInterval = setInterval(checkPerformance, 60 * 60 * 1000); // Hourly

    return () => {
      clearTimeout(timeoutId);
      clearInterval(dailyInterval);
      clearInterval(performanceInterval);
    };
  }, []); // Empty dependency array to run only once

  return {
    // Notification methods
    notifyContactSubmission: notificationService.notifyContactFormSubmission.bind(notificationService),
    notifyProjectMilestone: notificationService.notifyProjectViewMilestone.bind(notificationService),
    notifyMaintenance: notificationService.notifySystemMaintenance.bind(notificationService),
    notifyActivitySummary: notificationService.notifyActivitySummary.bind(notificationService),
    notifyProjectStatus: notificationService.notifyProjectStatusChange.bind(notificationService),
    notifyPerformance: notificationService.notifyPerformanceAlert.bind(notificationService),
    notifySecurity: notificationService.notifySecurityAlert.bind(notificationService),
    notifyBackup: notificationService.notifyBackupStatus.bind(notificationService)
  };
};

export default useBusinessNotifications;