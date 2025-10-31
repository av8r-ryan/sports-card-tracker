import React from 'react';

import './Terms.css';

const Terms: React.FC = () => {
  return (
    <div className="terms-container">
      <div className="terms-content">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: October 30, 2025</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using CardFlex™, you accept and agree to be bound by the terms and provisions of this
            agreement. If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            CardFlex™ provides a platform for managing, tracking, and analyzing sports card collections. Our services
            include:
          </p>
          <ul>
            <li>Digital inventory management</li>
            <li>Card valuation and pricing data</li>
            <li>Portfolio analytics and reporting</li>
            <li>Image storage and organization</li>
            <li>Market insights and recommendations</li>
          </ul>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <h3>Account Creation</h3>
          <p>You must provide accurate and complete information when creating an account.</p>

          <h3>Account Security</h3>
          <p>You are responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>

          <h3>Age Requirements</h3>
          <p>
            Users under 13 years old should use this service under parental guidance and with parental consent.
          </p>
        </section>

        <section>
          <h2>4. User Content and Data</h2>
          <h3>Your Content</h3>
          <p>
            You retain all rights to the content you upload, including card data, images, and notes. By using our
            service, you grant us a license to store, process, and display your content as necessary to provide our
            services.
          </p>

          <h3>Data Accuracy</h3>
          <p>
            While we strive to provide accurate pricing and market data, you acknowledge that card values fluctuate and
            our estimates are for informational purposes only.
          </p>
        </section>

        <section>
          <h2>5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for any illegal purpose</li>
            <li>Violate any laws or regulations</li>
            <li>Infringe on others' intellectual property rights</li>
            <li>Upload malicious code or viruses</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Use automated systems to scrape or data mine</li>
          </ul>
        </section>

        <section>
          <h2>6. Intellectual Property</h2>
          <p>
            CardFlex™ and its original content, features, and functionality are owned by Sookie Wentzel and are
            protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2>7. Disclaimer of Warranties</h2>
          <p>
            Our service is provided "as is" without warranties of any kind, either express or implied. We do not
            warrant that:
          </p>
          <ul>
            <li>The service will be uninterrupted or error-free</li>
            <li>Defects will be corrected</li>
            <li>The service is free of viruses or harmful components</li>
            <li>Pricing data or valuations are completely accurate</li>
          </ul>
        </section>

        <section>
          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Sookie Wentzel shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages resulting from your use of or inability to use the service.
          </p>
        </section>

        <section>
          <h2>9. Data Backup</h2>
          <p>
            You are responsible for backing up your data. We recommend regularly exporting your collection data. While
            we implement data protection measures, we are not responsible for data loss.
          </p>
        </section>

        <section>
          <h2>10. Modifications to Service</h2>
          <p>
            We reserve the right to modify or discontinue the service at any time, with or without notice. We shall not
            be liable to you or any third party for any modification, suspension, or discontinuation of the service.
          </p>
        </section>

        <section>
          <h2>11. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice, for any reason, including
            breach of these terms. Upon termination, your right to use the service will immediately cease.
          </p>
        </section>

        <section>
          <h2>12. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with applicable laws, without regard to
            conflict of law provisions.
          </p>
        </section>

        <section>
          <h2>13. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any material changes by
            posting the new terms and updating the "Last Updated" date. Your continued use of the service after changes
            constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2>14. Contact Information</h2>
          <p>If you have any questions about these Terms of Service, please contact us at:</p>
          <p className="contact-email">
            <a href="mailto:sookie@zylt.ai">sookie@zylt.ai</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
