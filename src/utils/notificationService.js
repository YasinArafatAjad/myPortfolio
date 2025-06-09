import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Notification service for creating business logic notifications
 */
class NotificationService {
  /**
   * Create a notification in Firestore
   * @param {Object} notification - Notification data
   */
  async createNotification(notification) {
    try {
      const notificationData = {
        ...notification,
        createdAt: serverTimestamp(),
        read: false,
        id: Date.now() + Math.random() // Temporary ID for immediate use
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      return notificationData;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Contact Form Submission Notification
   * @param {Object} messageData - Contact form data
   */
  async notifyContactFormSubmission(messageData) {
    return this.createNotification({
      type: 'info',
      title: 'New Contact Form Submission',
      message: `${messageData.name} (${messageData.email}) sent a message: "${messageData.subject || 'No subject'}"`,
      category: 'contact',
      metadata: {
        messageId: messageData.id,
        senderName: messageData.name,
        senderEmail: messageData.email,
        subject: messageData.subject
      }
    });
  }

  /**
   * Project View Milestone Notifications
   * @param {Object} projectData - Project data
   * @param {number} viewCount - Current view count
   */
  async notifyProjectViewMilestone(projectData, viewCount) {
    const milestones = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    
    if (milestones.includes(viewCount)) {
      return this.createNotification({
        type: 'success',
        title: 'Project Milestone Reached!',
        message: `"${projectData.title}" has reached ${viewCount} views! 🎉`,
        category: 'milestone',
        metadata: {
          projectId: projectData.id,
          projectTitle: projectData.title,
          viewCount: viewCount,
          milestone: viewCount
        }
      });
    }
    return null;
  }

  /**
   * System Maintenance Alert
   * @param {string} type - Type of maintenance (scheduled, emergency, completed)
   * @param {string} description - Maintenance description
   * @param {Date} scheduledTime - When maintenance is scheduled
   */
  async notifySystemMaintenance(type, description, scheduledTime = null) {
    const typeConfig = {
      scheduled: {
        title: 'Scheduled Maintenance',
        notificationType: 'warning',
        icon: '🔧'
      },
      emergency: {
        title: 'Emergency Maintenance',
        notificationType: 'error',
        icon: '🚨'
      },
      completed: {
        title: 'Maintenance Completed',
        notificationType: 'success',
        icon: '✅'
      }
    };

    const config = typeConfig[type] || typeConfig.scheduled;
    
    return this.createNotification({
      type: config.notificationType,
      title: config.title,
      message: `${config.icon} ${description}${scheduledTime ? ` Scheduled for: ${scheduledTime.toLocaleString()}` : ''}`,
      category: 'maintenance',
      metadata: {
        maintenanceType: type,
        description: description,
        scheduledTime: scheduledTime?.toISOString()
      }
    });
  }

  /**
   * User Activity Summary (Daily/Weekly)
   * @param {Object} activityData - Activity summary data
   * @param {string} period - 'daily' or 'weekly'
   */
  async notifyActivitySummary(activityData, period = 'daily') {
    const {
      totalViews = 0,
      newMessages = 0,
      topProject = null,
      totalProjects = 0,
      publishedProjects = 0
    } = activityData;

    const periodText = period === 'daily' ? 'Today' : 'This Week';
    const emoji = period === 'daily' ? '📊' : '📈';

    let summaryMessage = `${emoji} ${periodText}'s Summary:\n`;
    summaryMessage += `• ${totalViews} total project views\n`;
    summaryMessage += `• ${newMessages} new messages\n`;
    summaryMessage += `• ${publishedProjects}/${totalProjects} projects published`;
    
    if (topProject) {
      summaryMessage += `\n• Top project: "${topProject.title}" (${topProject.views} views)`;
    }

    return this.createNotification({
      type: 'info',
      title: `${periodText}'s Activity Summary`,
      message: summaryMessage,
      category: 'summary',
      metadata: {
        period: period,
        totalViews: totalViews,
        newMessages: newMessages,
        topProject: topProject,
        totalProjects: totalProjects,
        publishedProjects: publishedProjects,
        date: new Date().toISOString()
      }
    });
  }

  /**
   * Project Status Change Notification
   * @param {Object} projectData - Project data
   * @param {string} oldStatus - Previous status
   * @param {string} newStatus - New status
   */
  async notifyProjectStatusChange(projectData, oldStatus, newStatus) {
    const statusConfig = {
      published: { emoji: '🚀', color: 'success', action: 'published' },
      unpublished: { emoji: '📝', color: 'warning', action: 'unpublished' },
      featured: { emoji: '⭐', color: 'info', action: 'featured' },
      unfeatured: { emoji: '📌', color: 'info', action: 'unfeatured' }
    };

    const config = statusConfig[newStatus] || { emoji: '📄', color: 'info', action: newStatus };

    return this.createNotification({
      type: config.color,
      title: 'Project Status Updated',
      message: `${config.emoji} "${projectData.title}" has been ${config.action}`,
      category: 'project',
      metadata: {
        projectId: projectData.id,
        projectTitle: projectData.title,
        oldStatus: oldStatus,
        newStatus: newStatus
      }
    });
  }

  /**
   * Performance Alert Notification
   * @param {string} metric - Performance metric name
   * @param {number} value - Current value
   * @param {number} threshold - Threshold value
   * @param {string} trend - 'up' or 'down'
   */
  async notifyPerformanceAlert(metric, value, threshold, trend = 'up') {
    const isGood = (trend === 'up' && value >= threshold) || (trend === 'down' && value <= threshold);
    
    return this.createNotification({
      type: isGood ? 'success' : 'warning',
      title: 'Performance Alert',
      message: `${isGood ? '📈' : '📉'} ${metric}: ${value} (threshold: ${threshold})`,
      category: 'performance',
      metadata: {
        metric: metric,
        value: value,
        threshold: threshold,
        trend: trend,
        isGood: isGood
      }
    });
  }

  /**
   * Security Alert Notification
   * @param {string} alertType - Type of security alert
   * @param {string} description - Alert description
   * @param {string} severity - 'low', 'medium', 'high', 'critical'
   */
  async notifySecurityAlert(alertType, description, severity = 'medium') {
    const severityConfig = {
      low: { emoji: '🔒', type: 'info' },
      medium: { emoji: '⚠️', type: 'warning' },
      high: { emoji: '🚨', type: 'error' },
      critical: { emoji: '🔥', type: 'error' }
    };

    const config = severityConfig[severity] || severityConfig.medium;

    return this.createNotification({
      type: config.type,
      title: 'Security Alert',
      message: `${config.emoji} ${alertType}: ${description}`,
      category: 'security',
      metadata: {
        alertType: alertType,
        description: description,
        severity: severity
      }
    });
  }

  /**
   * Backup Status Notification
   * @param {boolean} success - Whether backup was successful
   * @param {string} details - Backup details
   */
  async notifyBackupStatus(success, details) {
    return this.createNotification({
      type: success ? 'success' : 'error',
      title: success ? 'Backup Completed' : 'Backup Failed',
      message: `${success ? '✅' : '❌'} ${details}`,
      category: 'backup',
      metadata: {
        success: success,
        details: details,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Generate daily activity summary
   */
  async generateDailyActivitySummary() {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Get today's messages
      const messagesQuery = query(
        collection(db, 'messages'),
        where('createdAt', '>=', startOfDay),
        orderBy('createdAt', 'desc')
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const newMessages = messagesSnapshot.size;

      // Get all projects for view count
      const projectsQuery = query(collection(db, 'projects'));
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalViews = projects.reduce((sum, project) => sum + (project.views || 0), 0);
      const publishedProjects = projects.filter(p => p.published).length;
      const totalProjects = projects.length;
      
      // Find top project
      const topProject = projects.reduce((top, project) => {
        return (project.views || 0) > (top?.views || 0) ? project : top;
      }, null);

      await this.notifyActivitySummary({
        totalViews,
        newMessages,
        topProject,
        totalProjects,
        publishedProjects
      }, 'daily');

    } catch (error) {
      console.error('Error generating daily activity summary:', error);
    }
  }

  /**
   * Check for performance milestones and alerts
   */
  async checkPerformanceMilestones() {
    try {
      // Get all projects
      const projectsQuery = query(collection(db, 'projects'));
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalViews = projects.reduce((sum, project) => sum + (project.views || 0), 0);
      const publishedProjects = projects.filter(p => p.published).length;
      
      // Check total views milestone
      const viewMilestones = [1000, 5000, 10000, 25000, 50000, 100000];
      for (const milestone of viewMilestones) {
        if (totalViews >= milestone) {
          // Check if we already notified about this milestone
          const existingQuery = query(
            collection(db, 'notifications'),
            where('category', '==', 'performance'),
            where('metadata.metric', '==', 'total_views'),
            where('metadata.value', '==', milestone)
          );
          const existingSnapshot = await getDocs(existingQuery);
          
          if (existingSnapshot.empty) {
            await this.notifyPerformanceAlert('Total Portfolio Views', totalViews, milestone, 'up');
          }
        }
      }

      // Check published projects milestone
      const projectMilestones = [5, 10, 20, 50];
      for (const milestone of projectMilestones) {
        if (publishedProjects >= milestone) {
          const existingQuery = query(
            collection(db, 'notifications'),
            where('category', '==', 'performance'),
            where('metadata.metric', '==', 'published_projects'),
            where('metadata.value', '==', milestone)
          );
          const existingSnapshot = await getDocs(existingQuery);
          
          if (existingSnapshot.empty) {
            await this.notifyPerformanceAlert('Published Projects', publishedProjects, milestone, 'up');
          }
        }
      }

    } catch (error) {
      console.error('Error checking performance milestones:', error);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;