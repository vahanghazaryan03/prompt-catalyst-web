// AppRouter.js
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import FullScreenLoader from './components/loading/FullScreenLoader';

/**
 * The standalone pages are loaded on demand.
 *
 * Help, Tutorials and Legal are roughly 330KB of source between them and are
 * never needed to use the app — most visitors never open any of them. Loading
 * them eagerly meant every visitor downloaded all three before the first paint.
 *
 * App itself stays eager: it is what the root path renders, so deferring it
 * would only add a round trip before anything appeared.
 */
const HelpPage = lazy(() =>
    import('./components/help').then((m) => ({ default: m.HelpPage }))
);
const LegalHub = lazy(() =>
    import('./components/legal').then((m) => ({ default: m.LegalHub }))
);
const PrivacyPolicy = lazy(() =>
    import('./components/legal').then((m) => ({ default: m.PrivacyPolicy }))
);
const TermsOfService = lazy(() =>
    import('./components/legal').then((m) => ({ default: m.TermsOfService }))
);
const Tutorials = lazy(() => import('./components/tutorials/Tutorials'));
const SubscriptionSuccessWrapper = lazy(() =>
    import('./components/SubscriptionSuccessWrapper')
);

// Wrapper component for pages that need theme support
const ThemedPageWrapper = ({ children }) => (
    <ThemeProvider>
        <ToastProvider>
            <Suspense fallback={<FullScreenLoader />}>
                {children}
            </Suspense>
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
