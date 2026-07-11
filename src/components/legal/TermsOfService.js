import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center mr-4 text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-sm text-[var(--textSecondary)]">Last Updated: April 16, 2025</p>
          
          <h2 className="text-xl font-semibold mt-6">1. Introduction</h2>
          <p>
            Welcome to Prompt Catalyst! These Terms of Service ("Terms") govern your access to and use of the Prompt Catalyst web application
            and related services ("Service"). By accessing or using our Service, you agree to be bound by these Terms. If you disagree with
            any part of the Terms, you may not access the Service.
          </p>

          <h2 className="text-xl font-semibold mt-6">2. Definitions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>"Service"</strong> refers to the Prompt Catalyst web application accessible at promptcatalyst.ai and any related websites, apps, or services provided by Catalyst Media.</li>
            <li><strong>"User"</strong> refers to individuals who access or use our Service, whether as a guest, registered user, or paid subscriber.</li>
            <li><strong>"Account"</strong> refers to a registered user profile created on our Service.</li>
            <li><strong>"Generated Content"</strong> refers to prompts, images, videos, or other output created through our Service based on user input.</li>
            <li><strong>"User Content"</strong> refers to any information, data, or content that users submit to the Service.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">3. Account Registration and Eligibility</h2>
          <p>
            To access certain features of the Service, you may be required to register for an account. When you register, you agree to provide
            accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials
            and for all activities that occur under your account.
          </p>
          <p className="mt-4">
            By using the Service, you represent and warrant that you are at least 13 years of age. If you are under the age of 18, you must
            have parental consent to use the Service. The Service is not intended for children under 13 years of age.
          </p>

          <h2 className="text-xl font-semibold mt-6">4. Subscription Plans and Payments</h2>
          <p>
            Prompt Catalyst offers both free and paid subscription plans. The specific features and limitations of each plan are described
            on our website and are subject to change.
          </p>
          <h3 className="text-lg font-medium mt-4">Free Plan:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Limited number of daily credits for generating content</li>
            <li>Basic features and models</li>
            <li>Credits reset daily</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">Premium Plans:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Increased daily credits</li>
            <li>Access to additional features and advanced models</li>
            <li>Priority processing</li>
            <li>Other benefits as described in the plan details</li>
          </ul>

          <p className="mt-4">
            By subscribing to a paid plan, you agree to pay all fees in accordance with the billing terms in effect at the time of your
            subscription. Payment processing is handled by third-party payment processors, and you agree to their terms of service when making
            a payment.
          </p>

          <p className="mt-4">
            Subscription fees are billed in advance on a recurring basis (monthly or annually) depending on the plan you select. You
            can cancel your subscription at any time, but no refunds will be provided for partial subscription periods or unused credits
            unless required by law.
          </p>

          <h2 className="text-xl font-semibold mt-6">5. Credit System</h2>
          <p>
            Prompt Catalyst operates on a credit system for generating content. Different operations, such as generating prompts, images, or
            animations, consume different amounts of credits. The specific credit costs are displayed within the Service and may vary based
            on factors such as the complexity of the request, the model used, and other technical parameters.
          </p>

          <p className="mt-4">
            Free users receive a limited number of credits per day. Premium users receive an increased daily credit allocation based on their
            subscription plan. Unused credits do not roll over to the next day. Additional credits can be purchased separately from the
            subscription plans.
          </p>

          <h2 className="text-xl font-semibold mt-6">6. Acceptable Use</h2>
          <p>
            You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
            <li>To exploit, harm, or attempt to exploit or harm minors in any way by exposing them to inappropriate content or otherwise</li>
            <li>To transmit, procure, or generate material that is illegal, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, or invasive of another's privacy</li>
            <li>To impersonate or attempt to impersonate Prompt Catalyst, a Prompt Catalyst employee, another user, or any other person or entity</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which may harm Prompt Catalyst or users of the Service</li>
            <li>To generate content for spam, scams, or fraudulent activities</li>
            <li>To consistently generate harmful, deceptive, or misleading content</li>
            <li>To attempt to bypass rate limits, quotas, or other usage restrictions</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">7. Intellectual Property Rights</h2>
          <h3 className="text-lg font-medium mt-4">Our Intellectual Property:</h3>
          <p>
            The Service and its original content (excluding User Content and Generated Content), features, and functionality are and will remain
            the exclusive property of Prompt Catalyst and its licensors. Our trademarks and trade dress may not be used in connection with any product or
            service without the prior written consent of Prompt Catalyst or Catalyst Media.
          </p>

          <h3 className="text-lg font-medium mt-4">Your Generated Content:</h3>
          <p>
            You retain all rights to content you generate using our Service, including prompts, images, and videos. You are free to use these
            outputs for both personal and commercial purposes. Prompt Catalyst does not claim ownership of any content you create through our
            platform.
          </p>

          <p className="mt-4">
            While we do not generally store your generated content on our servers, we may temporarily process and cache certain content to provide
            the Service. By using our Service, you grant us a limited license to use your User Content solely for the purpose of providing and
            improving the Service.
          </p>

          <h3 className="text-lg font-medium mt-4">Third-Party Content and Services:</h3>
          <p>
            Our Service may contain links to third-party websites or services that are not owned or controlled by Prompt Catalyst. We have no
            control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
            You acknowledge and agree that Prompt Catalyst shall not be responsible or liable for any damage or loss caused by or in connection
            with the use of any such content, goods, or services available on or through any such websites or services.
          </p>

          <h2 className="text-xl font-semibold mt-6">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, in no event shall Prompt Catalyst, its directors, employees, partners, agents, suppliers,
            or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation,
            loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Your access to or use of or inability to access or use the Service</li>
            <li>Any conduct or content of any third party on the Service</li>
            <li>Any content obtained from the Service</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content</li>
          </ul>

        

          <h2 className="text-xl font-semibold mt-6">9. Disclaimer of Warranties</h2>
          <p>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis, without any warranties of any kind, either express or implied.
            Prompt Catalyst expressly disclaims all warranties, whether express, implied, statutory or otherwise, including but not limited to
            the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </p>

          <p className="mt-4">
            Prompt Catalyst does not warrant that the Service will be uninterrupted, timely, secure, or error-free, or that any content generated
            through the Service will meet your requirements or expectations. The content generated through our Service is produced by artificial
            intelligence and may not always be accurate, reliable, or appropriate for all uses.
          </p>

          <h2 className="text-xl font-semibold mt-6">10. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless Prompt Catalyst, its parent company, affiliates, partners, officers, directors,
            agents, contractors, licensors, service providers, subcontractors, suppliers, and employees, from and against any claims, liabilities,
            damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your
            violation of these Terms or your use of the Service, including, but not limited to, your User Content, any use of the Service's content,
            services, and products other than as expressly authorized in these Terms.
          </p>

          <h2 className="text-xl font-semibold mt-6">11. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason
            whatsoever, including without limitation if you breach these Terms.
          </p>

          <p className="mt-4">
            Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply
            discontinue using the Service or contact us to request account deletion.
          </p>

          <h2 className="text-xl font-semibold mt-6">12. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to
            provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our
            sole discretion.
          </p>

          <p className="mt-4">
            By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you
            do not agree to the new terms, please stop using the Service.
          </p>

          <h2 className="text-xl font-semibold mt-6">13. Privacy Policy</h2>
          <p>
            Your use of the Service is also governed by our Privacy Policy, which is incorporated by reference into these Terms. Please review our
            Privacy Policy to understand our practices regarding your personal information.
          </p>

          <h2 className="text-xl font-semibold mt-6">14. Force Majeure</h2>
          <p>
            We will not be liable or responsible for any failure to perform, or delay in performance of, any of our obligations under these Terms
            that is caused by events outside our reasonable control ("Force Majeure Event"). A Force Majeure Event includes any act, event,
            non-happening, omission, or accident beyond our reasonable control including but not limited to strikes, lock-outs or other industrial
            action, civil commotion, riot, invasion, terrorist attack, war, fire, explosion, storm, flood, earthquake, epidemic, pandemic, or other
            natural disaster, failure of public or private telecommunications networks, or third-party services.
          </p>

         
          <h2 className="text-xl font-semibold mt-6">15. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            support@catalystmedia.ai
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;