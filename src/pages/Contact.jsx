import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNotification } from '../contexts/NotificationContext';
import { useSettings } from '../contexts/SettingsContext';
import { useBusinessNotifications } from '../hooks/useBusinessNotifications';
import SEOHead from '../components/SEOHead';

/**
 * Contact page component with contact form and information
 */
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { showSuccess, showError } = useNotification();
  const { settings } = useSettings();
  const { notifyContactSubmission } = useBusinessNotifications();
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [formRef, formInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      showError('Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      
      // Save message to Firestore
      const messageRef = await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: serverTimestamp(),
        read: false
      });

      // Create business notification for contact form submission
      await notifyContactSubmission({
        id: messageRef.id,
        ...formData
      });

      showSuccess('Thank you for your message! I\'ll get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Contact Me"
        description="Get in touch with me for project inquiries, collaborations, or any questions"
        keywords="contact, hire, freelance, collaboration, project inquiry"
      />
      
      <div className="pt-20">
        {/* Header Section */}
        <section ref={headerRef} className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Get in Touch
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Have a project in mind or want to collaborate? I'd love to hear from you. 
                Let's discuss how we can bring your ideas to life.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Let's Start a Conversation
                </h2>
                
                <div className="space-y-6">
                  <p className="text-gray-600 text-lg">
                    I'm always interested in new opportunities, exciting projects, 
                    and meaningful collaborations. Whether you have a question, 
                    a project idea, or just want to say hello, feel free to reach out.
                  </p>

                  {/* Contact Methods */}
                  <div className="space-y-4">
                    {settings.contactEmail && (
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary-600\" fill="currentColor\" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Email</h3>
                          <a 
                            href={`mailto:${settings.contactEmail}`}
                            className="text-primary-600 hover:text-primary-700 transition-colors"
                          >
                            {settings.contactEmail}
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Response Time</h3>
                        <p className="text-gray-600">Usually within 24 hours</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Availability</h3>
                        <p className="text-gray-600">Open to new projects</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  {settings.socialLinks && Object.values(settings.socialLinks).some(Boolean) && (
                    <div className="pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Connect with me
                      </h3>
                      <div className="flex space-x-4">
                        {Object.entries(settings.socialLinks).map(([platform, url]) => {
                          if (!url) return null;
                          return (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 bg-gray-100 hover:bg-primary-100 rounded-lg flex items-center justify-center transition-colors group"
                            >
                              <span className="text-gray-600 group-hover:text-primary-600 capitalize">
                                {platform.charAt(0).toUpperCase()}
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                ref={formRef}
                initial={{ opacity: 0, x: 50 }}
                animate={formInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="card lg:card-lg"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Send me a message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="form-label">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="form-label">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="form-label">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="form-input resize-none"
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full btn-primary ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      'Send Message'
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Quick answers to common questions about working with me.
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-6">
              {[
                {
                  question: "What is your typical project timeline?",
                  answer: "Project timelines vary depending on scope and complexity. Simple websites can be completed in 1-2 weeks, while complex applications may take 4-8 weeks or more. I'll provide a detailed timeline during our initial consultation."
                },
                {
                  question: "Do you work with clients remotely?",
                  answer: "Yes! I work with clients all around the world. I'm experienced in remote collaboration and use modern tools to ensure smooth communication and project management."
                },
                {
                  question: "What technologies do you specialize in?",
                  answer: "I specialize in modern web technologies including React, Node.js, Firebase, and various frontend frameworks. I'm always learning new technologies to provide the best solutions for my clients."
                },
                {
                  question: "Do you provide ongoing support after project completion?",
                  answer: "Yes, I offer ongoing support and maintenance services. We can discuss support options that fit your needs and budget during the project planning phase."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact;