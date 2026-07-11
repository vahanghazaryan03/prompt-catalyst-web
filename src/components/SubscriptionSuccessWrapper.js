// src/components/SubscriptionSuccessWrapper.js
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';
import { CollectionsProvider } from '../contexts/CollectionsContext';
import { CreditProvider } from '../contexts/CreditContext';
import { WeeklyPromptsProvider } from '../contexts/WeeklyPromptsContext';
import { GenerateProvider } from '../contexts/GenerateContext';
import SubscriptionSuccess from './SubscriptionSuccess';

const SubscriptionSuccessWrapper = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <ToastProvider>
                    <CollectionsProvider>
                        <CreditProvider>
                            <WeeklyPromptsProvider>
                                <GenerateProvider>
                                    <SubscriptionSuccess />
                                </GenerateProvider>
                            </WeeklyPromptsProvider>
                        </CreditProvider>
                    </CollectionsProvider>
                </ToastProvider>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default SubscriptionSuccessWrapper;