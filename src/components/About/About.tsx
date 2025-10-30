import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedWrapper from '../Animation/AnimatedWrapper';
import CollapsibleMenu from '../UI/CollapsibleMenu';
import Carousel, { CarouselItem } from '../Carousel/Carousel';
import Modal from '../Modal/Modal';
import './About.css';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  skills: string[];
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

interface Technology {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Design';
  description: string;
  icon: string;
  proficiency: number;
  color: string;
}

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  type: 'milestone' | 'achievement' | 'launch' | 'partnership';
  icon: string;
}

const About: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'tech' | 'timeline'>('overview');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0);
  const [selectedValue, setSelectedValue] = useState<any>(null);
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [currentValueIndex, setCurrentValueIndex] = useState(0);

  // Team data
  const teamMembers: TeamMember[] = useMemo(() => [
    {
      id: '1',
      name: 'Patrick Guntharp',
      role: 'Founder & Card Collector',
      bio: 'A passionate 12-year-old card collector who founded CardFlex™ to revolutionize how collectors track and manage their sports card collections. Patrick brings fresh perspective and genuine love for the hobby.',
      avatar: '👦',
      skills: ['Card Collecting', 'Innovation', 'Leadership', 'Vision'],
      social: {
        linkedin: 'https://linkedin.com/in/patrickguntharp',
        twitter: 'https://twitter.com/patrickguntharp'
      }
    },
    {
      id: '2',
      name: 'Tony Guntharp',
      role: 'Father & All-Around Bad-Ass Ninja',
      bio: 'The technical mastermind and supportive father behind CardFlex™. Tony brings decades of experience in technology and business, ensuring the platform is robust, secure, and user-friendly.',
      avatar: '🥷',
      skills: ['Technology', 'Business Strategy', 'Mentorship', 'Problem Solving'],
      social: {
        linkedin: 'https://linkedin.com/in/tonyguntharp',
        twitter: 'https://twitter.com/tonyguntharp'
      }
    },
    {
      id: '3',
      name: 'Tuxedo the Mascot',
      role: 'Official Mascot & Good Boy',
      bio: 'Our beloved dog mascot who brings joy, loyalty, and endless enthusiasm to the CardFlex™ team. Tuxedo represents the fun and community spirit of card collecting.',
      avatar: '🐕',
      skills: ['Morale Boosting', 'Team Spirit', 'Loyalty', 'Cuteness'],
      social: {
        twitter: 'https://twitter.com/tuxedomascot'
      }
    }
  ], []);

  const technologies: Technology[] = useMemo(() => [
    {
      id: '1',
      name: 'React',
      category: 'Frontend',
      description: 'Modern UI library for building interactive user interfaces',
      icon: '⚛️',
      proficiency: 95,
      color: '#61dafb'
    },
    {
      id: '2',
      name: 'TypeScript',
      category: 'Frontend',
      description: 'Type-safe JavaScript for better development experience',
      icon: '🔷',
      proficiency: 90,
      color: '#3178c6'
    },
    {
      id: '3',
      name: 'Node.js',
      category: 'Backend',
      description: 'JavaScript runtime for server-side development',
      icon: '🟢',
      proficiency: 85,
      color: '#339933'
    },
    {
      id: '4',
      name: 'PostgreSQL',
      category: 'Database',
      description: 'Advanced open-source relational database',
      icon: '🐘',
      proficiency: 80,
      color: '#336791'
    },
    {
      id: '5',
      name: 'AWS',
      category: 'DevOps',
      description: 'Cloud computing platform for scalable applications',
      icon: '☁️',
      proficiency: 75,
      color: '#ff9900'
    },
    {
      id: '6',
      name: 'Figma',
      category: 'Design',
      description: 'Collaborative design tool for UI/UX',
      icon: '🎨',
      proficiency: 90,
      color: '#f24e1e'
    }
  ], []);

  const timelineEvents: TimelineEvent[] = useMemo(() => [
    {
      id: '0',
      year: '2012',
      title: 'Founder is Born 👶',
      description: 'The journey begins! Setup for success from day one.',
      type: 'milestone',
      icon: '⭐'
    },
    {
      id: '1',
      year: '2024',
      title: 'Sports Card Tracker Launch',
      description: 'Launched the first version of our comprehensive sports card tracking platform',
      type: 'launch',
      icon: '🚀'
    },
    {
      id: '2',
      year: '2024',
      title: 'AI Integration',
      description: 'Integrated AI-powered pricing suggestions and market analysis',
      type: 'achievement',
      icon: '🤖'
    },
    {
      id: '3',
      year: '2024',
      title: 'eBay Partnership',
      description: 'Established partnership with eBay for seamless listing integration',
      type: 'partnership',
      icon: '🤝'
    },
    {
      id: '4',
      year: '2024',
      title: '7+ Users',
      description: 'Reached milestone of 7+ active users on the platform',
      type: 'milestone',
      icon: '👥'
    },
    {
      id: '5',
      year: '2026',
      title: 'Mobile App Release - Coming Soon 🎉',
      description: 'Slated for 2026 launch - Mobile applications for iOS and Android in development',
      type: 'launch',
      icon: '📱'
    }
  ], []);

  // Company Values with detailed content for modal
  const companyValues = useMemo(() => [
    {
      id: '1',
      title: 'Innovation',
      description: 'Constantly pushing boundaries with cutting-edge technology',
      icon: '💡',
      detailedContent: 'We believe in continuous innovation and staying ahead of the curve. Our team is dedicated to implementing the latest technologies including AI-powered pricing, advanced analytics, and intuitive user interfaces. We constantly explore new ways to enhance the collecting experience through automation, smart recommendations, and data-driven insights.',
      keyPoints: ['AI-Powered Insights', 'Cutting-Edge Technology', 'Continuous Improvement', 'Future-Forward Thinking']
    },
    {
      id: '2',
      title: 'Community',
      description: 'Building a passionate community of collectors',
      icon: '🤝',
      detailedContent: 'Our community is at the heart of everything we do. We foster connections between collectors, provide platforms for sharing knowledge, and create opportunities for collaboration. From beginners to seasoned professionals, every collector has a voice in our growing community.',
      keyPoints: ['Collector Network', 'Knowledge Sharing', 'Support & Resources', 'Collaborative Platform']
    },
    {
      id: '3',
      title: 'Transparency',
      description: 'Open and honest about our processes and data',
      icon: '🔍',
      detailedContent: 'We maintain complete transparency in our valuation methods, data sources, and pricing algorithms. Users can trust that our analytics are based on real market data, and we clearly communicate how we calculate values, trends, and recommendations. Your data security and privacy are our top priorities.',
      keyPoints: ['Clear Pricing Methods', 'Open Data Sources', 'Honest Communication', 'Privacy Protection']
    },
    {
      id: '4',
      title: 'Excellence',
      description: 'Committed to delivering the best possible experience',
      icon: '⭐',
      detailedContent: 'Excellence is our standard. From our user interface design to customer support, we strive for perfection in every detail. We continuously refine our platform based on user feedback, ensuring that every feature adds genuine value to your collecting journey.',
      keyPoints: ['Quality First', 'User-Centric Design', 'Exceptional Support', 'Attention to Detail']
    }
  ], []);

  // Convert values to carousel items
  const valuesCarouselItems: CarouselItem[] = useMemo(() => {
    return companyValues.map(value => ({
      id: value.id,
      title: value.title,
      description: value.description,
      icon: value.icon,
      category: 'Company Value'
    }));
  }, [companyValues]);

  const handleTabChange = useCallback((tab: 'overview' | 'team' | 'tech' | 'timeline') => {
    setActiveTab(tab);
  }, []);

  const handleMemberClick = useCallback((member: TeamMember) => {
    setSelectedMember(member);
  }, []);

  const handleTechHover = useCallback((techId: string | null) => {
    setHoveredTech(techId);
  }, []);

  const handleTimelineNext = useCallback(() => {
    setCurrentTimelineIndex((prev) => (prev + 1) % timelineEvents.length);
  }, [timelineEvents.length]);

  const handleTimelinePrev = useCallback(() => {
    setCurrentTimelineIndex((prev) => (prev - 1 + timelineEvents.length) % timelineEvents.length);
  }, [timelineEvents.length]);

  const handleValueClick = useCallback((item: CarouselItem) => {
    const value = companyValues.find(v => v.id === item.id);
    if (value) {
      setSelectedValue(value);
      const index = companyValues.findIndex(v => v.id === item.id);
      setCurrentValueIndex(index);
      setIsValueModalOpen(true);
    }
  }, [companyValues]);

  const handleValueModalClose = useCallback(() => {
    setIsValueModalOpen(false);
    setSelectedValue(null);
  }, []);

  const handleValuePrevious = useCallback(() => {
    const newIndex = currentValueIndex > 0 ? currentValueIndex - 1 : companyValues.length - 1;
    setCurrentValueIndex(newIndex);
    setSelectedValue(companyValues[newIndex]);
  }, [currentValueIndex, companyValues]);

  const handleValueNext = useCallback(() => {
    const newIndex = currentValueIndex < companyValues.length - 1 ? currentValueIndex + 1 : 0;
    setCurrentValueIndex(newIndex);
    setSelectedValue(companyValues[newIndex]);
  }, [currentValueIndex, companyValues]);

  // Auto-advance timeline
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimelineIndex((prev) => (prev + 1) % timelineEvents.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [timelineEvents.length]);

  const getCategoryColor = (category: string) => {
    const colors = {
      Frontend: '#3b82f6',
      Backend: '#10b981',
      Database: '#f59e0b',
      DevOps: '#ef4444',
      Design: '#8b5cf6'
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  return (
    <div className="about-container">
      {/* Hero Section */}
      <AnimatedWrapper animation="fadeInDown" duration={0.8}>
        <div className="about-hero">
          <div className="hero-background">
            <div className="floating-element floating-element-1">🏆</div>
            <div className="floating-element floating-element-2">💎</div>
            <div className="floating-element floating-element-3">📈</div>
            <div className="floating-element floating-element-4">🎯</div>
            <div className="floating-element floating-element-5">⚡</div>
          </div>
          <div className="hero-content">
            <h1 className="hero-title">
              About <span className="gradient-text">CardFlex™</span>
            </h1>
            <p className="hero-subtitle">
              We're building the future of sports card collecting with cutting-edge technology, 
              AI-powered insights, and a passionate community of collectors.
            </p>
          </div>
        </div>
      </AnimatedWrapper>

      {/* Navigation Tabs */}
      <AnimatedWrapper animation="fadeInUp" duration={0.8} delay={0.2}>
        <div className="about-navigation">
          <div className="nav-tabs">
            {[
              { id: 'overview', label: 'Overview', icon: '🏠' },
              { id: 'team', label: 'Our Team', icon: '👥' },
              { id: 'timeline', label: 'Timeline', icon: '📅' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id as any)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </AnimatedWrapper>

      {/* Content Sections */}
      <div className="about-content">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="tab-content"
            >
              <AnimatedWrapper animation="fadeInUp" duration={0.6}>
                <div className="overview-section">
                  <h2 className="section-title">Our Mission</h2>
                  <p className="section-description">
                    To revolutionize sports card collecting by providing collectors with powerful tools, 
                    AI-driven insights, and a seamless experience that makes managing and valuing collections effortless.
                  </p>
                </div>
              </AnimatedWrapper>

              <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.2}>
                <div className="values-section">
                  <h3 className="values-title">Our Values</h3>
                  <div className="values-carousel">
                    <div className="values-carousel-container">
                      {[
                        {
                          id: 'innovation',
                          title: 'Innovation',
                          description: 'Constantly pushing boundaries with cutting-edge technology',
                          icon: '💡',
                          details: 'We leverage the latest in AI, machine learning, and web technologies to create tools that were previously impossible. Our platform uses advanced algorithms for card valuation, automated data entry, and predictive analytics to give collectors unprecedented insights into their collections.',
                          examples: ['AI-powered card recognition', 'Real-time market analysis', 'Predictive value modeling', 'Automated condition assessment']
                        },
                        {
                          id: 'community',
                          title: 'Community',
                          description: 'Building a passionate community of collectors',
                          icon: '🤝',
                          details: 'We believe that collecting is more than just a hobby - it\'s a community. Our platform fosters connections between collectors, facilitates knowledge sharing, and creates opportunities for collaboration and growth within the sports card community.',
                          examples: ['Collector forums and discussions', 'Knowledge sharing platform', 'Collaborative collection building', 'Community events and meetups']
                        },
                        {
                          id: 'transparency',
                          title: 'Transparency',
                          description: 'Open and honest about our processes and data',
                          icon: '🔍',
                          details: 'We believe in complete transparency in how we operate, how we calculate values, and how we handle your data. Every algorithm is explainable, every data source is cited, and every decision is made with your best interests in mind.',
                          examples: ['Open-source algorithms', 'Transparent data sources', 'Clear pricing models', 'Regular platform updates']
                        },
                        {
                          id: 'excellence',
                          title: 'Excellence',
                          description: 'Committed to delivering the best possible experience',
                          icon: '⭐',
                          details: 'We strive for excellence in every aspect of our platform - from user interface design to data accuracy, from customer support to feature development. We\'re never satisfied with "good enough" and continuously push ourselves to deliver exceptional value.',
                          examples: ['Intuitive user experience', '99.9% uptime guarantee', '24/7 customer support', 'Continuous feature improvements']
                        }
                      ].map((value, index) => (
                        <motion.div
                          key={value.id}
                          className="value-card"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedValue(value);
                            setIsValueModalOpen(true);
                          }}
                        >
                          <div className="value-icon">{value.icon}</div>
                          <h4 className="value-title">{value.title}</h4>
                          <p className="value-description">{value.description}</p>
                          <div className="value-click-hint">Click to learn more</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedWrapper>
            </motion.div>
          )}

          {activeTab === 'team' && (
            <motion.div
              key="team"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="tab-content"
            >
              <AnimatedWrapper animation="fadeInUp" duration={0.6}>
                <div className="team-section">
                  <h2 className="section-title">Meet Our Team</h2>
                  <p className="section-description">
                    A passionate group of developers, designers, and data scientists working together 
                    to build the future of sports card collecting.
                  </p>
                </div>
              </AnimatedWrapper>

              <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.2}>
                <div className="team-grid">
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      className="team-card"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleMemberClick(member)}
                    >
                      <div className="member-avatar">{member.avatar}</div>
                      <h3 className="member-name">{member.name}</h3>
                      <p className="member-role">{member.role}</p>
                      <p className="member-bio">{member.bio}</p>
                      <div className="member-skills">
                        {member.skills.map((skill) => (
                          <span key={skill} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                      <div className="member-social">
                        {member.social.linkedin && (
                          <a href={member.social.linkedin} className="social-link" target="_blank" rel="noopener noreferrer">
                            💼
                          </a>
                        )}
                        {member.social.twitter && (
                          <a href={member.social.twitter} className="social-link" target="_blank" rel="noopener noreferrer">
                            🐦
                          </a>
                        )}
                        {member.social.github && (
                          <a href={member.social.github} className="social-link" target="_blank" rel="noopener noreferrer">
                            🐙
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatedWrapper>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="tab-content"
            >
              <AnimatedWrapper animation="fadeInUp" duration={0.6}>
                <div className="timeline-section">
                  <h2 className="section-title">Our Journey</h2>
                  <p className="section-description">
                    Key milestones and achievements in our mission to revolutionize sports card collecting.
                  </p>
                </div>
              </AnimatedWrapper>

              <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.2}>
                <div className="timeline-container">
                  <div className="timeline-navigation">
                    <motion.button
                      className="timeline-nav-btn"
                      onClick={handleTimelinePrev}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ← Previous
                    </motion.button>
                    <div className="timeline-indicators">
                      {timelineEvents.map((_, index) => (
                        <button
                          key={index}
                          className={`timeline-dot ${index === currentTimelineIndex ? 'active' : ''}`}
                          onClick={() => setCurrentTimelineIndex(index)}
                        />
                      ))}
                    </div>
                    <motion.button
                      className="timeline-nav-btn"
                      onClick={handleTimelineNext}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      Next →
                    </motion.button>
          </div>

                  <div className="timeline-content">
                    <motion.div
                      key={currentTimelineIndex}
                      className="timeline-event"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="event-icon">
                        {timelineEvents[currentTimelineIndex]?.icon}
                      </div>
                      <div className="event-year">
                        {timelineEvents[currentTimelineIndex]?.year}
                      </div>
                      <h3 className="event-title">
                        {timelineEvents[currentTimelineIndex]?.title}
                      </h3>
                      <p className="event-description">
                        {timelineEvents[currentTimelineIndex]?.description}
                      </p>
                      <div className={`event-type ${timelineEvents[currentTimelineIndex]?.type}`}>
                        {timelineEvents[currentTimelineIndex]?.type}
                      </div>
                    </motion.div>
                  </div>
          </div>
              </AnimatedWrapper>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Team Member Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            className="member-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              className="member-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setSelectedMember(null)}
              >
                ×
              </button>
              <div className="modal-content">
                <div className="modal-avatar">{selectedMember.avatar}</div>
                <h2 className="modal-name">{selectedMember.name}</h2>
                <p className="modal-role">{selectedMember.role}</p>
                <p className="modal-bio">{selectedMember.bio}</p>
                <div className="modal-skills">
                  <h4>Skills</h4>
                  <div className="skills-list">
                    {selectedMember.skills.map((skill) => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="modal-social">
                  <h4>Connect</h4>
                  <div className="social-links">
                    {selectedMember.social.linkedin && (
                      <a href={selectedMember.social.linkedin} className="social-link" target="_blank" rel="noopener noreferrer">
                        LinkedIn
                      </a>
                    )}
                    {selectedMember.social.twitter && (
                      <a href={selectedMember.social.twitter} className="social-link" target="_blank" rel="noopener noreferrer">
                        Twitter
                      </a>
                    )}
                    {selectedMember.social.github && (
                      <a href={selectedMember.social.github} className="social-link" target="_blank" rel="noopener noreferrer">
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Value Modal */}
      <AnimatePresence>
        {isValueModalOpen && selectedValue && (
          <motion.div
            className="value-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsValueModalOpen(false)}
          >
            <motion.div
              className="value-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close-btn"
                onClick={() => setIsValueModalOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
              <div className="value-modal-content">
                <div className="value-modal-icon">{selectedValue.icon}</div>
                <h2 className="value-modal-title">{selectedValue.title}</h2>
                <p className="value-modal-description">{selectedValue.description}</p>
                <div className="value-modal-details">
                  <h3>What this means for you:</h3>
                  <p>{selectedValue.details}</p>
                </div>
                <div className="value-modal-examples">
                  <h3>Examples in action:</h3>
                  <ul>
                    {selectedValue.examples.map((example: string, index: number) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default About;