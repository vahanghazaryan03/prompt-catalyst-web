import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-sm text-[var(--textSecondary)]">Last Updated: March 2, 2025</p>
          
          <h2 className="text-xl font-semibold mt-6">1. Introduction</h2>
          <p>
            Prompt Catalyst is a web application designed to enhance your creative workflow by assisting with the generation 
            of prompts for AI image and video tools. This Privacy Policy explains how we collect, use, and protect your 
            information when you use the Prompt Catalyst web application and related services, including our website at 
            promptcatalyst.ai.
          </p>

          <h2 className="text-xl font-semibold mt-6">2. Information We Collect</h2>
          <p>We collect information in the following ways:</p>
          
          <h3 className="text-lg font-medium mt-4">Information You Provide Directly:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account Information (Optional):</strong> If you choose to create an account (required for premium features 
              and free daily credits), we collect your email address, username, and password. This information is securely 
              stored and managed on our servers.
            </li>
            <li>
              <strong>Payment Information (Optional):</strong> If you purchase a premium subscription or buy credits, your 
              payment details (e.g., credit card information) are processed by Stripe, our third-party payment processor. 
              We do not store your full payment card details on our servers.
            </li>
            <li>
              <strong>User-Generated Content:</strong> Your prompt history and collections are stored in your browser's local storage on your device, not on our servers. 
              This means your prompts history is private to your device, and we do not have access to this information. 
            </li>
            <li>
              <strong>Uploaded Images:</strong> If you use our image analysis features, images you upload are temporarily 
              processed on our servers and then deleted after processing is complete.
            </li>
            <li>
              <strong>Generated Content:</strong> When you generate images, prompts, or videos through our service, these are stored 
              locally in your browser and not on our servers. You retain all rights to use these generated outputs for commercial 
              or personal purposes.
            </li>
          </ul>

          <h3 className="text-lg font-medium mt-4">Information Collected Automatically:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Usage Data:</strong> We collect information about how you interact with the web app, including the 
              features you use and the settings you select. This data helps us improve our 
              services and troubleshoot issues.
            </li>
            <li>
              <strong>IP Address:</strong> We collect your IP address to manage rate limiting and provide basic functionality 
              for unauthorized users.
            </li>
            <li>
              <strong>Device and Browser Information:</strong> We may collect information about your browser type, operating 
              system, and device to ensure compatibility and optimize performance.
            </li>
            <li>
              <strong>Cookies:</strong> We use cookies for authentication, caching purposes (e.g., caching your premium status), 
              and to enhance your user experience. We do not use cookies for tracking your activity across other websites.
            </li>
            <li>
              <strong>API Request Data:</strong> When you make API requests to external AI service providers, we log the request details 
              for debugging and monitoring purposes. This may include the content of the requests, but we do not retain this data long-term.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">3. How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>

          <h3 className="text-lg font-medium mt-4">To Provide and Maintain the Service:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>To deliver the core functionality of the web app, such as generating prompts and managing your account (if applicable).</li>
            <li>To process your premium subscription purchases and verify your subscription status.</li>
            <li>To manage credit usage and provide daily credit resets.</li>
            <li>To facilitate image, prompt, and video generation based on your inputs.</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">To Improve the Service:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>To analyze usage patterns and identify areas for improvement in the web app's features and performance.</li>
            <li>To develop new features and enhance existing ones based on user feedback and usage data.</li>
            <li>To debug and troubleshoot technical issues.</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">To Communicate with You:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>To send you important updates about the web app, such as changes to our terms of service or privacy policy.</li>
            <li>To respond to your support requests and inquiries.</li>
            <li>To send you promotional offers related to Prompt Catalyst (only if you have opted in to receive such communications).</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">To Ensure Security:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>To protect against unauthorized access, fraud, and abuse.</li>
            <li>To enforce our terms of service and this privacy policy.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">4. How We Share Your Information</h2>
          <p>We may share your information in the following circumstances:</p>

          <h3 className="text-lg font-medium mt-4">With Third-Party Service Providers:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Payment Processors:</strong> For processing payments and subscriptions.</li>
            <li><strong>AI Service Providers:</strong> For generating prompts, images, and other content.</li>
            <li><strong>Cloud Service Providers:</strong> For hosting and application services.</li>
          </ul>

          <p className="mt-4">
            <strong>For Legal Reasons:</strong> We may disclose your information if required by law, such as to comply with a subpoena or other legal process, or to protect the rights, property, or safety of Prompt Catalyst, our users, or others.
          </p>

          <p className="mt-4">
            <strong>In Connection with a Business Transaction:</strong> If Prompt Catalyst is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change in ownership or control of your personal information.
          </p>

          <p className="mt-4">
            <strong>With Your Consent:</strong> We may share your information with other third parties with your explicit consent.
          </p>

          <h2 className="text-xl font-semibold mt-6">5. Data Security</h2>
          <p>We take reasonable measures to protect your information from unauthorized access, use, or disclosure. These measures include:</p>
          
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Encryption:</strong> We use HTTPS to encrypt data transmitted between your browser and our servers.</li>
            <li><strong>Secure Storage:</strong> We store your data on secure servers provided by reputable cloud providers.</li>
            <li><strong>Access Controls:</strong> We limit access to your information to authorized personnel who need it to perform their job duties.</li>
            <li><strong>Regular Security Audits:</strong> We conduct regular security assessments to identify and address potential vulnerabilities.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">6. Data Retention</h2>
          <p>We retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.</p>
          
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Information:</strong> We retain your account information for as long as your account is active.</li>
            <li><strong>Uploaded Images:</strong> Images uploaded for analysis are deleted after processing is complete, typically within 24 hours.</li>
            <li><strong>Generated Content:</strong> As your prompts, images, and videos are stored locally in your browser and not on our servers, 
            you control their retention period. Clearing your browser's local storage or cache will remove this data.</li>
            <li><strong>Usage Data:</strong> We may retain anonymized or aggregated usage data for analytical purposes.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">7. Your Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information:</p>
          
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access:</strong> You have the right to request access to the personal information we have collected about you.</li>
            <li><strong>Correction:</strong> You have the right to request that we correct inaccurate or incomplete information about you.</li>
            <li><strong>Deletion:</strong> You have the right to request that we delete your personal information.</li>
            <li><strong>Data Portability:</strong> You have the right to receive a copy of your personal information in a structured, commonly used, and machine-readable format.</li>
            <li><strong>Restriction of Processing:</strong> You have the right to request that we restrict the processing of your personal information under certain circumstances.</li>
            <li><strong>Objection to Processing:</strong> You have the right to object to the processing of your personal information under certain circumstances.</li>
          </ul>

          <p className="mt-4">
            To exercise any of these rights, please contact us at support@catalystmedia.ai
          </p>

          <h2 className="text-xl font-semibold mt-6">8. Intellectual Property Rights</h2>
          <p>
            You retain all rights to the content you generate using our service, including prompts, images, and videos. You are free 
            to use these outputs for both personal and commercial purposes. Prompt Catalyst does not claim ownership of any 
            content you create through our platform.
          </p>

          <h2 className="text-xl font-semibold mt-6">9. Children's Privacy</h2>
          <p>
            Prompt Catalyst is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child under 13 has provided us with personal information, please contact us, and we will take steps to delete such information.
          </p>

          <h2 className="text-xl font-semibold mt-6">10. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from the laws of your country. We take appropriate safeguards to ensure that your personal information remains protected in accordance with this Privacy Policy.
          </p>

          <h2 className="text-xl font-semibold mt-6">11. Changes to this Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on our website and updating the "Last Updated" date at the top of this policy. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2 className="text-xl font-semibold mt-6">12. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <p>
            support@catalystmedia.ai
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;