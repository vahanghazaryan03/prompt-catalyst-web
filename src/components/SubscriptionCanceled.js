import React from 'react';
import { useNavigate } from 'react-router-dom';

const SubscriptionCanceled = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <div className="max-w-md w-full mx-auto p-8 rounded-lg shadow-lg bg-card">
                <h1 className="text-2xl font-bold text-center mb-4">
                    Subscription Canceled
                </h1>
                
                <p className="text-center text-muted mb-6">
                    Your subscription process was canceled.
                    You can try again whenever you're ready.
                </p>

                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        Return Home
                    </button>
                    <button
                        onClick={() => navigate('/pricing')}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                    >
                        View Plans
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionCanceled;