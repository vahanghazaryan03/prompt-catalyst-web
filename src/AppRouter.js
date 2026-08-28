// AppRouter.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Paths handled inside App. The first group are views — App derives which one
// to show from the pathname (see VIEW_PATHS there). The second are actions that
// open a modal and then return the URL to the root.
const APP_VIEW_PATHS = [
    '/',
    '/generate',
    '/edit',
    '/animate',
    '/history',
    '/collections',
    '/weekly',
    '/style-codes',
    '/reset-password',
];

const APP_ACTION_PATHS = [
    '/login',
    '/sign-up',
    '/password-reset',
    '/premium',
    '/community',
];

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

                {[...APP_VIEW_PATHS, ...APP_ACTION_PATHS].map((path) => (
                    <Route key={path} path={path} element={<App />} />
                ))}

                {/* Anything unrecognised goes to the app rather than a blank page. */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
