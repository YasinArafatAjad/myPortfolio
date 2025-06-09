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
    const checkDailySummary = () => {
      const lastSummary = localStorage.getItem('lastDailySummary');
      const today = new Date().toDateString();
      
      if (lastSummary !== today) {
        // Generate daily summary
        notificationService.generateDailyActivitySummary();
        localStorage.setItem('lastDailySummary', today);
      }
    };

    // Set up performance milestone checks (runs every hour)
    const checkPerformance = () => {
      const lastCheck = localStorage.getItem('lastPerformanceCheck');
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      if (!lastCheck || (now - parseInt(lastCheck)) > oneHour) {
        notificationService.checkPerformanceMilestones();
        localStorage.setItem('lastPerformanceCheck', now.toString());
      }
    };

    // Run checks on mount
    checkDailySummary();
    checkPerformance();

    // Set up intervals
    const dailyInterval = setInterval(checkDailySummary, 24 * 60 * 60 * 1000); // Daily
    const performanceInterval = setInterval(checkPerformance, 60 * 60 * 1000); // Hourly

    return () => {
      clearInterval(dailyInterval);
      clearInterval(performanceInterval);
    };
  }, []);

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