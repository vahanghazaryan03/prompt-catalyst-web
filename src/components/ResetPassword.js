import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const ResetPassword = ({ resetParams, onSuccess }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    // Password validation states and handlers...
    const [validations, setValidations] = useState({
        minLength: false,
        hasNumber: false,
        hasUpper: false,
        hasLower: false,
        matches: false
    });

    const validatePassword = (password) => {
        setValidations({
            minLength: password.length >= 8,
            hasNumber: /\d/.test(password),
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            matches: password === confirmPassword
        });
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setNewPassword(password);
        validatePassword(password);
    };

    const handleConfirmPasswordChange = (e) => {
        const confirmPwd = e.target.value;
        setConfirmPassword(confirmPwd);
        setValidations(prev => ({
            ...prev,
            matches: confirmPwd === newPassword
        }));
    };

    const isPasswordValid = () => {
        return Object.values(validations).every(v => v);
    };

    const handleReset = async (e) => {
      e.preventDefault();
      
      if (!isPasswordValid()) {
          setError('Please ensure your password meets all requirements');
          return;
      }

      if (!resetParams?.email || !resetParams?.resetKey) {
          setError('Invalid reset password link');
          return;
      }

      setIsResetting(true);
      setError(null);

      try {
          const result = await apiService.resetPassword(
              resetParams.email,
              resetParams.resetKey,
              newPassword
          );

          if (result.success) {
              // Navigate to root first to ensure proper routing
              navigate('/', { replace: true });
              // Then call onSuccess callback
              onSuccess();
          } else {
              setError(result.error || 'Failed to reset password');
          }
      } catch (error) {
          console.error('Password reset failed:', error);
          
          if (error.message === 'invalid_reset_key') {
              setError('This password reset link has expired or is invalid.');
          } else {
              setError(
                  error.response?.data?.error || 
                  error.response?.data?.message || 
                  'Failed to reset password. Please try again.'
              );
          }
      } finally {
          setIsResetting(false);
      }
  };

    if (!resetParams?.email || !resetParams?.resetKey) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#171717] p-4">
                <div className="w-full max-w-md p-8 bg-[#1e1e1e] rounded-xl border border-[#333] shadow-lg">
                    <div className="text-center">
                        <KeyRound className="mx-auto h-12 w-12 text-[#ff4444] mb-4" />
                        <h2 className="text-2xl font-bold mb-2 text-[#f5f5f5]">Invalid Reset Link</h2>
                        <p className="text-[#888] mb-6">
                            This password reset link is invalid or has expired.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full px-4 py-2 text-black bg-[#42f56f] rounded-lg hover:bg-[#31db8a] transition-colors focus:outline-none"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#171717] p-4">
            <div className="w-full max-w-md p-8 bg-[#1e1e1e] rounded-xl border border-[#333] shadow-lg">
                <div className="text-center mb-8">
                    <KeyRound className="mx-auto h-12 w-12 text-[#42f56f] mb-4" />
                    <h2 className="text-2xl font-bold mb-2 text-[#f5f5f5]">Reset Your Password</h2>
                    <p className="text-[#888]">
                        Please enter your new password below
                    </p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                value={newPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 bg-[#1e1e1e] border border-[#333] rounded-lg text-[#f5f5f5] placeholder-[#888] focus:outline-none focus:border-[#42f56f] transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#f5f5f5] transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOffIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                className="w-full px-4 py-2 bg-[#1e1e1e] border border-[#333] rounded-lg text-[#f5f5f5] placeholder-[#888] focus:outline-none focus:border-[#42f56f] transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#f5f5f5] transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <EyeOffIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        {Object.entries({
                            'At least 8 characters long': validations.minLength,
                            'Contains at least one number': validations.hasNumber,
                            'Contains at least one uppercase letter': validations.hasUpper,
                            'Contains at least one lowercase letter': validations.hasLower,
                            'Passwords match': validations.matches
                        }).map(([text, isValid]) => (
                            <p key={text} className={`flex items-center space-x-2 ${
                                isValid ? 'text-[#42f56f]' : 'text-[#ff4444]'
                            }`}>
                                <span>✓</span>
                                <span>{text}</span>
                            </p>
                        ))}
                    </div>

                    {error && (
                        <div className="text-[#ff4444] text-sm text-center px-4 py-2 bg-[#ff4444]/10 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isResetting || !isPasswordValid()}
                        className={`w-full px-4 py-2 text-black bg-[#42f56f] rounded-lg hover:bg-[#31db8a] transition-colors focus:outline-none ${
                            (isResetting || !isPasswordValid()) && 'opacity-50 cursor-not-allowed'
                        }`}
                    >
                        {isResetting ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;