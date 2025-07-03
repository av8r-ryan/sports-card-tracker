import React from 'react';
import packageJson from '../../../package.json';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>About Collectors Playbook Card Tracker</h1>
        
        <section className="about-section">
          <h2>Welcome to Your Ultimate Card Collection Manager</h2>
          <p>
            The Collectors Playbook Card Tracker is a comprehensive sports card collection 
            management application designed to help serious collectors and investors track, 
            value, and manage their card portfolios with precision and ease.
          </p>
        </section>

        <section className="about-section">
          <h2>Key Features</h2>
          <ul className="feature-list">
            <li>Track your entire card collection with detailed metadata</li>
            <li>Monitor portfolio value and ROI performance</li>
            <li>Generate eBay listings with smart pricing recommendations</li>
            <li>Create custom collections to organize your cards</li>
            <li>Export data in multiple formats (CSV, JSON, PDF)</li>
            <li>Backup and restore your collection data</li>
            <li>Multi-user support for family or team collections</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Built for Collectors, by Collectors</h2>
          <p>
            This application was developed with the serious collector in mind. Whether you're 
            tracking vintage baseball cards, modern basketball rookies, or Pokemon cards, 
            our platform provides the tools you need to make informed decisions about your 
            collection.
          </p>
        </section>

        <section className="about-section links-section">
          <h2>Learn More</h2>
          <div className="link-cards">
            <a 
              href="https://github.com/Collectors-Playbook/sports-card-tracker" 
              target="_blank" 
              rel="noopener noreferrer"
              className="link-card"
            >
              <svg className="link-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <h3>GitHub Repository</h3>
              <p>View the source code, report issues, and contribute to the project</p>
            </a>
            
            <a 
              href="https://collectorsplaybook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="link-card"
            >
              <svg className="link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <h3>Collectors Playbook</h3>
              <p>Visit our main website for collecting guides, market insights, and more</p>
            </a>
          </div>
        </section>

        <section className="about-section">
          <h2>Version Information</h2>
          <div className="version-info">
            <p><strong>Version:</strong> {packageJson.version}</p>
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>License:</strong> MIT</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;