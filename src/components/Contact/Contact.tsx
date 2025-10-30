import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useCallback } from 'react';

import { logInfo, logError } from '../../utils/logger';
import AnimatedWrapper from '../Animation/AnimatedWrapper';
import CollapsibleMenu from '../UI/CollapsibleMenu';
import './Contact.css';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'general' | 'support' | 'feature' | 'bug' | 'partnership';
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'suggestion';
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
}

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: Date;
  views: number;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Live chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatStatus, setChatStatus] = useState<'online' | 'offline' | 'away'>('online');

  // Knowledge base states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeBaseArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [knowledgeBaseCategories, setKnowledgeBaseCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // FAQ states
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [filteredFAQs, setFilteredFAQs] = useState<FAQItem[]>([]);

  // Mock data
  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'How quickly do you respond to support requests?',
      answer:
        'We typically respond within 2 hours during business hours (9 AM - 6 PM EST) and within 24 hours on weekends. For urgent issues, we have a priority support queue.',
      category: 'Support',
      helpful: 45,
      notHelpful: 2,
    },
    {
      id: '2',
      question: 'Is my data secure when I contact support?',
      answer:
        'Absolutely! All communications are encrypted using industry-standard SSL/TLS encryption. Your personal data is never shared with third parties and is stored securely in our encrypted databases.',
      category: 'Security',
      helpful: 38,
      notHelpful: 1,
    },
    {
      id: '3',
      question: 'Can I request new features?',
      answer:
        'Yes! We love hearing from our users. Use the "Feature Request" category when submitting your message, or vote on existing feature requests in our community forum.',
      category: 'Features',
      helpful: 52,
      notHelpful: 3,
    },
    {
      id: '4',
      question: 'Do you offer phone support?',
      answer:
        'Yes, we offer phone support for premium users and urgent technical issues. Call us at +1 (555) 123-4567 during business hours.',
      category: 'Support',
      helpful: 29,
      notHelpful: 4,
    },
    {
      id: '5',
      question: 'How do I export my card collection data?',
      answer:
        'You can export your collection data in multiple formats (CSV, JSON, Excel) from the Collections page. Go to Collections > Export Options to download your data.',
      category: 'Data',
      helpful: 67,
      notHelpful: 2,
    },
    {
      id: '6',
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through Stripe.',
      category: 'Billing',
      helpful: 41,
      notHelpful: 1,
    },
  ];

  const knowledgeBaseData: KnowledgeBaseArticle[] = [
    {
      id: '1',
      title: 'Getting Started with Sports Card Tracker',
      content: 'Learn how to set up your account, add your first cards, and navigate the interface...',
      category: 'Getting Started',
      tags: ['beginner', 'setup', 'tutorial'],
      lastUpdated: new Date('2024-01-15'),
      views: 1250,
    },
    {
      id: '2',
      title: 'Understanding Card Grading and Condition',
      content:
        'A comprehensive guide to card grading systems, condition assessment, and how to properly evaluate your cards...',
      category: 'Card Management',
      tags: ['grading', 'condition', 'evaluation'],
      lastUpdated: new Date('2024-01-10'),
      views: 890,
    },
    {
      id: '3',
      title: 'eBay Integration and Listing Optimization',
      content: 'How to use our eBay integration features, optimize your listings, and maximize your sales...',
      category: 'eBay Integration',
      tags: ['ebay', 'selling', 'optimization'],
      lastUpdated: new Date('2024-01-08'),
      views: 756,
    },
    {
      id: '4',
      title: 'Advanced Collection Organization',
      content:
        'Tips and tricks for organizing large collections, using smart groups, and maintaining your inventory...',
      category: 'Organization',
      tags: ['organization', 'collections', 'inventory'],
      lastUpdated: new Date('2024-01-05'),
      views: 634,
    },
  ];

  React.useEffect(() => {
    logInfo('Contact', 'Contact page loaded');
    setFilteredFAQs(faqData);
    setKnowledgeBaseCategories(['all', ...Array.from(new Set(knowledgeBaseData.map((article) => article.category)))]);
  }, []);

  // Chat functions
  const sendChatMessage = useCallback(async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(message),
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
      };

      setChatMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  }, []);

  const getBotResponse = (message: string): string => {
    const responses = [
      "I understand you're looking for help. Let me connect you with our support team.",
      "That's a great question! I can help you find the right information.",
      "I'm here to help! Can you provide more details about your issue?",
      'Let me search our knowledge base for relevant articles about that topic.',
      "I'll make sure our support team gets back to you with a detailed response.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Knowledge base functions
  const searchKnowledgeBase = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = knowledgeBaseData.filter(
      (article) =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.content.toLowerCase().includes(query.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );

    setSearchResults(results);
  }, []);

  // FAQ functions
  const searchFAQs = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredFAQs(faqData);
      return;
    }

    const results = faqData.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query.toLowerCase()) ||
        faq.answer.toLowerCase().includes(query.toLowerCase()) ||
        faq.category.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredFAQs(results);
  }, []);

  const toggleFAQ = useCallback((faqId: string) => {
    setExpandedFAQ((prev) => (prev === faqId ? null : faqId));
  }, []);

  const rateFAQ = useCallback((faqId: string, helpful: boolean) => {
    setFilteredFAQs((prev) =>
      prev.map((faq) =>
        faq.id === faqId
          ? {
              ...faq,
              helpful: helpful ? faq.helpful + 1 : faq.helpful,
              notHelpful: !helpful ? faq.notHelpful + 1 : faq.notHelpful,
            }
          : faq
      )
    );
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    logInfo('Contact', 'Form input changed', { field: name, value: value.substring(0, 50) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      logInfo('Contact', 'Contact form submission started', {
        category: formData.category,
        hasName: !!formData.name,
        hasEmail: !!formData.email,
        hasSubject: !!formData.subject,
        hasMessage: !!formData.message,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real app, this would send to your backend
      console.log('Contact form data:', formData);

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general',
      });

      logInfo('Contact', 'Contact form submitted successfully');
    } catch (error) {
      logError('Contact', 'Contact form submission failed', error as Error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      contact: 'support@collectorsplaybook.com',
      action: () => window.open('mailto:support@collectorsplaybook.com'),
    },
    {
      icon: '💬',
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      contact: 'Available 9 AM - 6 PM EST',
      action: () => logInfo('Contact', 'Live chat clicked'),
    },
    {
      icon: '📞',
      title: 'Phone Support',
      description: 'Speak directly with our team',
      contact: '+1 (555) 123-4567',
      action: () => window.open('tel:+15551234567'),
    },
    {
      icon: '📚',
      title: 'Help Center',
      description: 'Browse our comprehensive guides',
      contact: 'Self-service resources',
      action: () => logInfo('Contact', 'Help center clicked'),
    },
  ];

  const features = [
    {
      icon: '🚀',
      title: 'Fast Response',
      description: 'We typically respond within 2 hours during business hours',
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your data is encrypted and never shared with third parties',
    },
    {
      icon: '🎯',
      title: 'Expert Support',
      description: 'Our team includes sports card collecting experts',
    },
    {
      icon: '📈',
      title: 'Continuous Improvement',
      description: 'We use your feedback to make the app better',
    },
  ];

  return (
    <div className="contact-container">
      {/* Hero Section */}
      <AnimatedWrapper animation="fadeInDown" duration={0.8}>
        <div className="contact-hero card-glass">
          <div className="hero-background">
            <motion.div
              className="floating-element floating-element-1"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              🃏
            </motion.div>
            <motion.div
              className="floating-element floating-element-2"
              animate={{
                y: [0, -15, 0],
                rotate: [0, -3, 3, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: 0.5,
              }}
            >
              ⚾
            </motion.div>
            <motion.div
              className="floating-element floating-element-3"
              animate={{
                y: [0, -25, 0],
                rotate: [0, 4, -4, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: 1,
              }}
            >
              🏀
            </motion.div>
            <motion.div
              className="floating-element floating-element-4"
              animate={{
                y: [0, -18, 0],
                rotate: [0, -2, 2, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: 1.5,
              }}
            >
              📊
            </motion.div>
            <motion.div
              className="floating-element floating-element-5"
              animate={{
                y: [0, -22, 0],
                rotate: [0, 3, -3, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: 2,
              }}
            >
              💎
            </motion.div>
          </div>

          <div className="hero-content">
            <h1 className="hero-title text-gradient">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="hero-subtitle">
              We're here to help you make the most of your sports card collection. Reach out anytime for support,
              feedback, or just to say hello!
            </p>

            <div className="hero-actions">
              <motion.button
                className="chat-toggle-btn"
                onClick={() => setIsChatOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                💬 Start Live Chat
              </motion.button>
              <motion.button
                className="knowledge-base-btn"
                onClick={() => (window.location.href = '/docs')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📚 Browse Knowledge Base
              </motion.button>
            </div>
          </div>
        </div>
      </AnimatedWrapper>

      {/* Contact Methods */}
      <section className="contact-methods">
        <div className="container">
          <h2 className="section-title">How can we help you?</h2>
          <div className="methods-grid">
            {contactMethods.map((method, index) => (
              <div key={index} className="method-card" onClick={method.action}>
                <div className="method-icon">{method.icon}</div>
                <h3 className="method-title">{method.title}</h3>
                <p className="method-description">{method.description}</p>
                <div className="method-contact">{method.contact}</div>
                <div className="method-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="contact-form-section">
        <div className="container">
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Send us a message</h2>
              <p className="form-subtitle">Fill out the form below and we'll get back to you as soon as possible.</p>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="Brief description of your inquiry"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              {submitStatus === 'success' && (
                <div className="form-success">
                  <div className="success-icon">✅</div>
                  <p>Thank you! Your message has been sent successfully. We'll get back to you soon.</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="form-error">
                  <div className="error-icon">❌</div>
                  <p>Sorry, there was an error sending your message. Please try again.</p>
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">📤</span>
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="contact-features">
        <div className="container">
          <h2 className="section-title">Why choose our support?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Base Section */}
      <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.4}>
        <section className="knowledge-base-section card-glass">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title text-gradient">Knowledge Base</h2>
              <p className="section-subtitle">Find answers to common questions and learn how to use our features</p>
            </div>

            <div className="knowledge-base-search">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchKnowledgeBase(e.target.value);
                  }}
                  className="search-input"
                />
                <button className="search-btn">🔍</button>
              </div>

              <div className="category-filter">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  {knowledgeBaseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="knowledge-base-content">
              {searchResults.length > 0 ? (
                <div className="search-results">
                  {searchResults.map((article, index) => (
                    <motion.div
                      key={article.id}
                      className="article-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="article-header">
                        <h3 className="article-title">{article.title}</h3>
                        <span className="article-category">{article.category}</span>
                      </div>
                      <p className="article-preview">{article.content}</p>
                      <div className="article-meta">
                        <span className="article-views">{article.views} views</span>
                        <span className="article-date">Updated {article.lastUpdated.toLocaleDateString()}</span>
                      </div>
                      <div className="article-tags">
                        {article.tags.map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="knowledge-base-grid">
                  {knowledgeBaseData
                    .filter((article) => selectedCategory === 'all' || article.category === selectedCategory)
                    .map((article, index) => (
                      <motion.div
                        key={article.id}
                        className="knowledge-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setSelectedArticle(article)}
                      >
                        <div className="knowledge-card-header">
                          <h3>{article.title}</h3>
                          <span className="knowledge-category">{article.category}</span>
                        </div>
                        <p className="knowledge-preview">{article.content}</p>
                        <div className="knowledge-meta">
                          <span className="knowledge-views">{article.views} views</span>
                          <span className="knowledge-date">{article.lastUpdated.toLocaleDateString()}</span>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </AnimatedWrapper>

      {/* FAQ Section */}
      <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.6}>
        <section className="contact-faq card-glass">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title text-gradient">Frequently Asked Questions</h2>
              <p className="section-subtitle">Quick answers to the most common questions</p>
            </div>

            <div className="faq-search">
              <input
                type="text"
                placeholder="Search FAQs..."
                value={faqSearchQuery}
                onChange={(e) => {
                  setFaqSearchQuery(e.target.value);
                  searchFAQs(e.target.value);
                }}
                className="faq-search-input"
              />
            </div>

            <div className="faq-list">
              <AnimatePresence>
                {filteredFAQs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    className="faq-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <CollapsibleMenu
                      title={faq.question}
                      icon="❓"
                      isOpen={expandedFAQ === faq.id}
                      onToggle={() => toggleFAQ(faq.id)}
                    >
                      <div className="faq-content">
                        <p className="faq-answer">{faq.answer}</p>
                        <div className="faq-rating">
                          <span className="faq-category">{faq.category}</span>
                          <div className="faq-actions">
                            <button className="faq-helpful-btn" onClick={() => rateFAQ(faq.id, true)}>
                              👍 {faq.helpful}
                            </button>
                            <button className="faq-not-helpful-btn" onClick={() => rateFAQ(faq.id, false)}>
                              👎 {faq.notHelpful}
                            </button>
                          </div>
                        </div>
                      </div>
                    </CollapsibleMenu>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </AnimatedWrapper>

      {/* Live Chat Widget */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="chat-widget"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="chat-header">
              <div className="chat-status">
                <div className={`status-indicator ${chatStatus}`} />
                <span>Support Team</span>
              </div>
              <button className="chat-close-btn" onClick={() => setIsChatOpen(false)}>
                ✕
              </button>
            </div>

            <div className="chat-messages">
              <AnimatePresence>
                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`chat-message ${message.sender}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="message-content">
                      <p>{message.text}</p>
                      <span className="message-time">{message.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  className="typing-indicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span>Support is typing...</span>
                </motion.div>
              )}
            </div>

            <div className="chat-input-container">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    sendChatMessage(chatInput);
                  }
                }}
                className="chat-input"
              />
              <button
                className="chat-send-btn"
                onClick={() => {
                  if (chatInput.trim()) {
                    sendChatMessage(chatInput);
                  }
                }}
                disabled={!chatInput.trim()}
              >
                📤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contact;
