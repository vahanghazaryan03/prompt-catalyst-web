// subscriptionService.js
import apiService from './api';
import tokenService from './tokenService';

const WORDPRESS_URL = 'https://catalystmedia.ai';

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
            
            const response = await fetch(`${WORDPRESS_URL}/wp-admin/admin-post.php?action=stripe_checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    success_url: successUrl,
                    cancel_url: currentDomain,
                    yearly: isAnnual,
                    plan: plan, // 'premium' or 'pro' or 'ultimate'
                    is_upgrade: plan === 'pro' || plan === 'ultimate', // Flag for upgrade
                    preload: preload // Add preload flag
                }),
                credentials: 'include',
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
                    console.error('Response is not JSON:', text);
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
            console.error('Failed to initiate Stripe checkout:', error);
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
            console.error('Failed to process subscription:', error);
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
            console.error('Failed to check subscription status:', error);
            throw error;
        }
    },

    verifyEmailStatus: async () => {
        try {
            const token = tokenService.getToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${WORDPRESS_URL}/wp-json/um-custom/v1/check-verification`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            return {
                isVerified: data.is_verified,
                message: data.message
            };
        } catch (error) {
            console.error('Failed to verify email status:', error);
            throw error;
        }
    }
};

export default subscriptionService;