import emailjs from '@emailjs/browser';

/**
 * EmailJS configuration for sending contact form emails
 */
export const emailjsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
};

/**
 * Initialize EmailJS with public key
 */
export const initEmailJS = () => {
  if (emailjsConfig.publicKey) {
    emailjs.init(emailjsConfig.publicKey);
  }
};

/**
 * Send contact form email notification
 * @param {Object} formData - Contact form data
 * @returns {Promise} - EmailJS send promise
 */
export const sendContactEmail = async (formData) => {
  try {
    // Validate EmailJS configuration
    if (!emailjsConfig.serviceId || !emailjsConfig.templateId || !emailjsConfig.publicKey) {
      throw new Error('EmailJS configuration is incomplete. Please check your environment variables.');
    }

    // Prepare template parameters for EmailJS
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject || 'New Contact Form Submission',
      message: formData.message,
      to_email: import.meta.env.VITE_ADMIN_EMAIL,
      reply_to: formData.email,
      // Additional metadata
      submission_date: new Date().toLocaleString(),
      user_agent: navigator.userAgent,
      page_url: window.location.href
    };

    // Send email using EmailJS
    const response = await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.templateId,
      templateParams
    );

    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send auto-reply email to the contact form submitter
 * @param {Object} formData - Contact form data
 * @returns {Promise} - EmailJS send promise
 */
export const sendAutoReplyEmail = async (formData) => {
  try {
    // You can create a separate template for auto-replies
    const autoReplyTemplateId = import.meta.env.VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID;
    
    if (!autoReplyTemplateId) {
      // Skip auto-reply if template not configured
      return null;
    }

    const templateParams = {
      to_name: formData.name,
      to_email: formData.email,
      from_name: 'Your Portfolio', // Or use settings.siteName
      original_subject: formData.subject || 'Your message',
      original_message: formData.message,
      reply_date: new Date().toLocaleString()
    };

    const response = await emailjs.send(
      emailjsConfig.serviceId,
      autoReplyTemplateId,
      templateParams
    );

    return response;
  } catch (error) {
    console.error('Error sending auto-reply email:', error);
    // Don't throw error for auto-reply failures
    return null;
  }
};