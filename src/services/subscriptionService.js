// subscriptionService.js
import apiService from './api';
import tokenService from './tokenService';
import { logger } from '../utils/logger';


// Checkout is served by the reworked API, not by WordPress. Same request and
// response shape as the admin-post handler it replaces.
const API_URL = '/api';

const subscriptionService = {
    initiateStripeCheckout: async (plan, isAnnual = false, preload = false) => {
        try {
            const token = tokenService.getToken();
            if (!token) {
                throw new Error('Authentication required');
            }
    
            // Get the current domain for the success URL
            const currentDomain = window.location.origin;
            const successUrl = `${currentDomain}/subscription-success`;
            
            const response = await fetch(`${API_URL}/billing/checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success_url: successUrl,
                    cancel_url: currentDomain,
                    yearly: isAnnual,
                    plan: plan, // 'premium' or 'pro' or 'ultimate'
                    is_upgrade: plan === 'pro' || plan === 'ultimate',
                    preload: preload
                }),
                // No credentials: the API authenticates by bearer token, and sending
                // cookies cross-origin would need Allow-Credentials on the response.
                mode: 'cors'
            });
            

            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    logger.error('Response is not JSON:', text);
                    throw new Error('Invalid server response format');
                }
            }

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication required');
                }
                if (response.status === 403 && data.error === 'Email verification required') {
                    throw new Error('email_verification_required');
                }
                throw new Error(data.message || 'Failed to initiate checkout');
            }

            if (data.success && data.url) {
                // Only redirect if not preloading
                if (!preload) {
                    window.location.href = data.url;
                }
                return { success: true, url: data.url };
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            logger.error('Failed to initiate Stripe checkout:', error);
            throw error;
        }
    },

    handleSuccessfulSubscription: async () => {
        try {
            // Force token refresh
            await tokenService.refreshToken();
    
            // Refresh premium status
            const premiumStatus = await apiService.checkPremium();
    
            // Clear credits cache
            localStorage.removeItem('lastCreditsCheck');
            
            // Dispatch premium status update event
            window.dispatchEvent(new CustomEvent('premiumStatusUpdate', {
                detail: {
                    isPremium: true,
                    displayName: premiumStatus.display_name,
                    userId: premiumStatus.user_id
                }
            }));
    
            return { success: true };
        } catch (error) {
            logger.error('Failed to process subscription:', error);
            throw error;
        }
    },

    checkSubscriptionStatus: async () => {
        try {
            const response = await apiService.checkPremium();
            return {
                isPremium: response.is_premium,
                displayName: response.display_name,
                userId: response.user_id,
                subscriptionType: response.subscription_type 
            };
        } catch (error) {
            logger.error('Failed to check subscription status:', error);
            throw error;
        }
    },

};

export default subscriptionService;