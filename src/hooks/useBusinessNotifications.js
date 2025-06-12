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
    // Set up daily activity summary (runs at 7:00 PM every day)
    const checkDailySummary = async () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Check if it's 7:00 PM (19:00) - allow a 5-minute window (19:00-19:05)
      const isScheduledTime = currentHour === 19 && currentMinute < 5;
      
      if (isScheduledTime) {
        const today = new Date().toDateString();
        const lastSummary = localStorage.getItem('lastDailySummary');
        
        // Only run if we haven't already run today
        if (lastSummary !== today) {
          try {
            // Double-check database to ensure no duplicate
            const hasCreatedToday = await notificationService.hasDailySummaryForToday();
            
            if (!hasCreatedToday) {
              console.log('Creating daily summary at 7:00 PM...');
              await notificationService.generateDailyActivitySummary();
              localStorage.setItem('lastDailySummary', today);
            } else {
              // Update localStorage to prevent further checks today
              localStorage.setItem('lastDailySummary', today);
            }
          } catch (error) {
            console.error('Error creating scheduled daily summary:', error);
          }
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

    // Calculate time until next 7:00 PM
    const getTimeUntilNext7PM = () => {
      const now = new Date();
      const next7PM = new Date();
      
      // Set to 7:00 PM today
      next7PM.setHours(19, 0, 0, 0);
      
      // If it's already past 7:00 PM today, set to 7:00 PM tomorrow
      if (now >= next7PM) {
        next7PM.setDate(next7PM.getDate() + 1);
      }
      
      return next7PM.getTime() - now.getTime();
    };

    // Initial check for performance milestones (run immediately)
    const initialPerformanceCheck = setTimeout(() => {
      checkPerformance();
    }, 2000); // Small delay to avoid rapid calls on app start

    // Schedule first daily summary check
    const timeUntil7PM = getTimeUntilNext7PM();
    console.log(`Next daily summary scheduled in ${Math.round(timeUntil7PM / (1000 * 60 * 60))} hours`);
    
    const initialDailySummaryTimeout = setTimeout(() => {
      checkDailySummary();
      
      // Set up daily interval starting from the first 7:00 PM
      const dailyInterval = setInterval(checkDailySummary, 24 * 60 * 60 * 1000); // Every 24 hours
      
      // Store interval ID for cleanup
      window.dailySummaryInterval = dailyInterval;
    }, timeUntil7PM);

    // Set up performance check interval (every hour)
    const performanceInterval = setInterval(checkPerformance, 60 * 60 * 1000);

    // Also check every 5 minutes if we're close to 7:00 PM (between 6:55 PM and 7:05 PM)
    const frequentCheckInterval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Check if we're in the window around 7:00 PM (18:55 to 19:05)
      const isNear7PM = (currentHour === 18 && currentMinute >= 55) || 
                        (currentHour === 19 && currentMinute <= 5);
      
      if (isNear7PM) {
        checkDailySummary();
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      clearTimeout(initialPerformanceCheck);
      clearTimeout(initialDailySummaryTimeout);
      clearInterval(performanceInterval);
      clearInterval(frequentCheckInterval);
      
      // Clear the daily interval if it exists
      if (window.dailySummaryInterval) {
        clearInterval(window.dailySummaryInterval);
        delete window.dailySummaryInterval;
      }
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