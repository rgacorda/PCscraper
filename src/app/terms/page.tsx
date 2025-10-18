import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | PH PC Parts Aggregator',
  description: 'Terms and conditions for using PH PC Parts Aggregator',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: October 18, 2025</p>

          <div className="prose prose-blue max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 mb-4">
                Welcome to PH PC Parts Aggregator ("we," "our," or "us"). These Terms and
                Conditions ("Terms") govern your access to and use of our website,
                services, and PC building tools (collectively, the "Service"). By
                accessing or using our Service, you agree to be bound by these Terms.
              </p>
              <p className="text-gray-700">
                If you do not agree to these Terms, please do not use our Service.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Acceptance of Terms
              </h2>
              <p className="text-gray-700 mb-4">
                By creating an account, accessing, or using our Service, you acknowledge
                that you have read, understood, and agree to be bound by these Terms, as
                well as our Privacy Policy. You must be at least 13 years old to use our
                Service.
              </p>
            </section>

            {/* Service Description */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Service Description
              </h2>
              <p className="text-gray-700 mb-4">PH PC Parts Aggregator provides:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  Price comparison tools for PC components from Philippine retailers
                </li>
                <li>PC building and configuration tools</li>
                <li>User accounts for saving builds and preferences</li>
                <li>Community features including ratings, comments, and build sharing</li>
                <li>Product information aggregated from third-party retailers</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. User Accounts
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                4.1 Account Registration
              </h3>
              <p className="text-gray-700 mb-4">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                4.2 Account Termination
              </h3>
              <p className="text-gray-700 mb-4">
                We reserve the right to suspend or terminate your account if you violate
                these Terms or engage in conduct that we deem inappropriate or harmful to
                our Service or other users.
              </p>
            </section>

            {/* Acceptable Use */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Acceptable Use Policy
              </h2>
              <p className="text-gray-700 mb-4">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  Use the Service for any unlawful purpose or in violation of any
                  applicable laws
                </li>
                <li>
                  Post or transmit any harmful, threatening, abusive, or offensive content
                </li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>
                  Use automated tools (bots, scrapers) without our written permission
                </li>
                <li>Collect or harvest personal information of other users</li>
                <li>Post false or misleading information about products or builds</li>
                <li>Spam, advertise, or solicit other users</li>
              </ul>
            </section>

            {/* User Content */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. User-Generated Content
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                6.1 Your Content
              </h3>
              <p className="text-gray-700 mb-4">
                You retain ownership of any content you create, including PC builds,
                comments, and ratings ("User Content"). By submitting User Content, you
                grant us a worldwide, non-exclusive, royalty-free license to use, display,
                and distribute your content within the Service.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                6.2 Content Moderation
              </h3>
              <p className="text-gray-700 mb-4">
                We reserve the right to review, monitor, and remove any User Content that
                violates these Terms or is deemed inappropriate, without prior notice.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                6.3 Content Responsibility
              </h3>
              <p className="text-gray-700 mb-4">
                You are solely responsible for your User Content. We do not endorse or
                guarantee the accuracy of any User Content.
              </p>
            </section>

            {/* Price Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Price and Product Information
              </h2>
              <p className="text-gray-700 mb-4">
                We aggregate price and product information from third-party retailers.
                While we strive to provide accurate and up-to-date information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  We do not guarantee the accuracy, completeness, or timeliness of product
                  information
                </li>
                <li>Prices and availability may change without notice</li>
                <li>
                  We are not responsible for errors in product descriptions or pricing
                </li>
                <li>
                  All purchases are made directly with retailers, not through our Service
                </li>
                <li>We are not party to any transactions between you and retailers</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                7.1 Data Scraping Disclosure
              </h3>
              <p className="text-gray-700 mb-4">
                Our Service collects publicly available product information from retailer
                websites through automated scraping. We only collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Product names and descriptions</li>
                <li>Product images and specifications</li>
                <li>Pricing information</li>
                <li>Product availability status</li>
              </ul>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
                <p className="text-gray-700 font-semibold">
                  We DO NOT collect, store, or process any sensitive personal information,
                  payment data, or customer information from retailer websites.
                </p>
              </div>
            </section>

            {/* PC Build Compatibility */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. PC Build Compatibility and Liability
              </h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-gray-700 font-semibold mb-2">
                  IMPORTANT: Build Configuration Disclaimer
                </p>
                <p className="text-gray-700">
                  PH PC Parts Aggregator is NOT LIABLE for any PC build mistakes,
                  compatibility issues, or hardware problems that may arise from using our
                  PC building tools.
                </p>
              </div>

              <p className="text-gray-700 mb-4">
                While we provide tools to help you configure PC builds, you acknowledge
                and agree that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>
                  <strong>You are solely responsible</strong> for verifying component
                  compatibility before making any purchases
                </li>
                <li>
                  Our compatibility suggestions are automated and may not catch all
                  potential issues
                </li>
                <li>
                  Component specifications, compatibility requirements, and BIOS updates
                  change frequently
                </li>
                <li>
                  Physical dimensions, power requirements, and thermal considerations must
                  be verified independently
                </li>
                <li>
                  We do not guarantee that suggested builds will work as intended or meet
                  your performance expectations
                </li>
                <li>Motherboard BIOS updates may be required for CPU compatibility</li>
                <li>
                  Case clearance for GPU length, CPU cooler height, and PSU depth must be
                  verified
                </li>
                <li>
                  RAM compatibility (speed, timing, XMP profiles) should be verified with
                  motherboard QVL lists
                </li>
              </ul>

              <p className="text-gray-700 mb-4">
                <strong>We strongly recommend:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Consulting with PC building experts or experienced builders</li>
                <li>Checking manufacturer compatibility lists and documentation</li>
                <li>Verifying all specifications before purchasing components</li>
                <li>
                  Understanding return policies of retailers before making purchases
                </li>
                <li>
                  Seeking professional assembly if you are not experienced with PC
                  building
                </li>
              </ul>

              <p className="text-gray-700 mt-4">
                <strong>You assume all risks</strong> associated with purchasing
                components and building PCs based on configurations created using our
                Service. We shall not be liable for any damages, losses, or expenses
                resulting from incompatible parts, build errors, or hardware failures.
              </p>
            </section>

            {/* Third-Party Links */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Third-Party Links and Services
              </h2>
              <p className="text-gray-700 mb-4">
                Our Service contains links to third-party websites and retailers
                (Datablitz, PCWorth, Bermor Techzone, etc.). We are not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  The content, privacy policies, or practices of third-party websites
                </li>
                <li>Any transactions or interactions with third parties</li>
                <li>The quality, safety, or legality of products sold by retailers</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Your use of third-party services is at your own risk and subject to their
                terms and conditions.
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Intellectual Property
              </h2>
              <p className="text-gray-700 mb-4">
                All content, features, and functionality of our Service (excluding User
                Content) are owned by PH PC Parts Aggregator and are protected by
                copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-700">
                You may not reproduce, distribute, modify, or create derivative works
                without our express written permission.
              </p>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Disclaimers
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-gray-700 font-semibold">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF
                  ANY KIND.
                </p>
              </div>
              <p className="text-gray-700 mb-4">
                We disclaim all warranties, express or implied, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  Warranties of merchantability and fitness for a particular purpose
                </li>
                <li>Warranties regarding accuracy, reliability, or availability</li>
                <li>Warranties that the Service will be uninterrupted or error-free</li>
                <li>Warranties regarding PC build compatibility or performance</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Limitation of Liability
              </h2>
              <p className="text-gray-700 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, PH PC PARTS AGGREGATOR SHALL NOT
                BE LIABLE FOR:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Damages resulting from use or inability to use the Service</li>
                <li>Damages from unauthorized access to your account or data</li>
                <li>Damages from errors, viruses, or other harmful components</li>
                <li>Damages from interactions with third-party retailers</li>
              </ul>
            </section>

            {/* Indemnification */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Indemnification
              </h2>
              <p className="text-gray-700 mb-4">
                You agree to indemnify and hold harmless PH PC Parts Aggregator, its
                officers, directors, employees, and agents from any claims, damages,
                losses, or expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your User Content</li>
              </ul>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                14. Changes to Terms
              </h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms at any time. We will notify
                users of material changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Posting the updated Terms on this page</li>
                <li>Updating the "Last Updated" date</li>
                <li>Sending email notifications for significant changes</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Your continued use of the Service after changes constitutes acceptance of
                the modified Terms.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                15. Termination
              </h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your access to the Service immediately,
                without prior notice, for any reason, including breach of these Terms.
              </p>
              <p className="text-gray-700">
                Upon termination, your right to use the Service will cease immediately.
                All provisions that should survive termination shall survive, including
                ownership provisions, disclaimers, and limitations of liability.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                16. Governing Law and Jurisdiction
              </h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed by and construed in accordance with the laws
                of the Republic of the Philippines, without regard to its conflict of law
                provisions.
              </p>
              <p className="text-gray-700">
                Any disputes arising from these Terms or the Service shall be subject to
                the exclusive jurisdiction of the courts of the Philippines.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                17. Contact Information
              </h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>PH PC Parts Aggregator</strong>
                  <br />
                  Email: peanutbuttered02@gmail.com
                </p>
              </div>
            </section>

            {/* Severability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                18. Severability
              </h2>
              <p className="text-gray-700">
                If any provision of these Terms is found to be invalid or unenforceable,
                the remaining provisions shall continue to be valid and enforceable to the
                fullest extent permitted by law.
              </p>
            </section>

            {/* Entire Agreement */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                19. Entire Agreement
              </h2>
              <p className="text-gray-700">
                These Terms, together with our Privacy Policy, constitute the entire
                agreement between you and PH PC Parts Aggregator regarding the use of the
                Service, superseding any prior agreements.
              </p>
            </section>

            {/* Acknowledgment */}
            <section className="mb-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <p className="text-gray-800 font-semibold mb-2">
                  By using PH PC Parts Aggregator, you acknowledge that you have read,
                  understood, and agree to be bound by these Terms and Conditions.
                </p>
                <p className="text-gray-600 text-sm">Thank you for using our Service!</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
