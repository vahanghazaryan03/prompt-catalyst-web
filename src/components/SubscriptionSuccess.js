// src/components/SubscriptionSuccess.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import subscriptionService from '../services/subscriptionService';
import { Loader2 } from 'lucide-react';
import { logger } from '../utils/logger';

const SubscriptionSuccess = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { checkAuthStatus } = useAuth();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const processSubscription = async () => {
            try {
                // Process the subscription - just refresh token and update status
                await subscriptionService.handleSuccessfulSubscription();
                
                // Force auth status refresh
                await checkAuthStatus();
                
                addToast('Successfully upgraded to Premium!', 'success');
                
                // Mark in session storage that we're coming from subscription success
                try {
                    sessionStorage.setItem('fromSubscriptionSuccess', 'true');
                } catch (e) {
                    // Ignore storage errors
                }
                
                // Redirect to home page
                navigate('/', { replace: true });
            } catch (error) {
                logger.error('Failed to process subscription:', error);
                addToast('Failed to process subscription. Please try again or contact support.', 'error');
                navigate('/', { replace: true });
            } finally {
                setIsProcessing(false);
            }
        };

        processSubscription();
    }, [navigate, addToast, checkAuthStatus]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
            <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Processing Your Subscription
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Please wait while we set up your premium account...
                </p>
            </div>
        </div>
    );
};

export default SubscriptionSuccess;