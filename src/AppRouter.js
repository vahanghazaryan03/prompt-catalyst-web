// AppRouter.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import { HelpPage } from './components/help';
import { LegalHub, PrivacyPolicy, TermsOfService } from './components/legal';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

import SubscriptionSuccessWrapper from './components/SubscriptionSuccessWrapper';
import Tutorials from './components/tutorials/Tutorials';

// Wrapper component for pages that need theme support
const ThemedPageWrapper = ({ children }) => (
    <ThemeProvider>
        <ToastProvider>
            {children}
        </ToastProvider>
    </ThemeProvider>
);

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/help/*" element={
                    <ThemedPageWrapper>
                        <HelpPage />
                    </ThemedPageWrapper>
                } />
                <Route path="/legal" element={
                    <ThemedPageWrapper>
                        <LegalHub />
                    </ThemedPageWrapper>
                } />
                <Route path="/legal/privacy-policy" element={
                    <ThemedPageWrapper>
                        <PrivacyPolicy />
                    </ThemedPageWrapper>
                } />
                <Route path="/legal/terms-of-service" element={
                    <ThemedPageWrapper>
                        <TermsOfService />
                    </ThemedPageWrapper>
                } />
                <Route path="/tutorials" element={
                    <ThemedPageWrapper>
                        <Tutorials />
                    </ThemedPageWrapper>
                } />
                <Route path="/tutorials/:tutorialSlug" element={
                    <ThemedPageWrapper>
                        <Tutorials />
                    </ThemedPageWrapper>
                } />
                <Route path="/subscription-success" element={
                    <ThemedPageWrapper>
                        <SubscriptionSuccessWrapper />
                    </ThemedPageWrapper>
                } />
                <Route path="/reset-password" element={<App />} />
                <Route path="/login" element={<App />} />
                <Route path="/sign-up" element={<App />} />
                <Route path="/premium" element={<App />} />
                <Route path="/weekly" element={<App />} />
                <Route path="/community" element={<App />} />
                <Route path="/style-codes" element={<App />} />
                <Route path="/" element={<App />} />
               
            </Routes>
        </Router>
    );
};

export default AppRouter;