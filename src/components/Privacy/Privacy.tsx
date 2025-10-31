import React from 'react';

import './Privacy.css';

const Privacy: React.FC = () => {
  return (
    <div className="privacy-container">
      <div className="privacy-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: October 30, 2025</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to CardFlex™. We respect your privacy and are committed to protecting your personal data. This
            privacy policy will inform you about how we look after your personal data and tell you about your privacy
            rights.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>Personal Information</h3>
          <ul>
            <li>Name and contact information</li>
            <li>Email address</li>
            <li>Account credentials</li>
            <li>Profile information</li>
          </ul>

          <h3>Collection Data</h3>
          <ul>
            <li>Sports card information you input</li>
            <li>Photos and images you upload</li>
            <li>Transaction and pricing data</li>
            <li>Collection statistics and analytics</li>
          </ul>

          <h3>Technical Data</h3>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Usage data and analytics</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Manage your account and collections</li>
            <li>Send you updates and notifications</li>
            <li>Improve our platform and user experience</li>
            <li>Analyze usage patterns and trends</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Storage and Security</h2>
          <p>
            Your data is stored locally in your browser using IndexedDB technology. We implement appropriate security
            measures to protect your information, including:
          </p>
          <ul>
            <li>Encrypted data transmission</li>
            <li>Secure authentication</li>
            <li>Regular security audits</li>
            <li>Access controls and monitoring</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Sharing</h2>
          <p>We do not sell your personal data. We may share your information with:</p>
          <ul>
            <li>Service providers who assist in platform operation</li>
            <li>Legal authorities when required by law</li>
            <li>Third parties with your explicit consent</li>
          </ul>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section>
          <h2>7. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience. You can control cookie preferences
            through your browser settings.
          </p>
        </section>

        <section>
          <h2>8. Children's Privacy</h2>
          <p>
            Our service is available to users of all ages. For users under 13, we recommend parental supervision and
            consent.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new
            policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>If you have any questions about this privacy policy, please contact us at:</p>
          <p className="contact-email">
            <a href="mailto:sookie@zylt.ai">sookie@zylt.ai</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
