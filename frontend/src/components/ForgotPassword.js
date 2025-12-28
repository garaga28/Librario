import React, { useState } from 'react';
import { Mail, CheckCircle, Lock, ArrowRight, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Card = ({ children }) => (
  <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md backdrop-blur-sm bg-white/80 border border-white/20">
    {children}
  </div>
);

const Input = ({ icon, ...props }) => (
  <div className="relative">
    {icon}
    <input {...props} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300" />
  </div>
);

const Button = ({ children, ...props }) => (
  <button
    {...props}
    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

const Message = ({ children, type }) => {
  const icon = type === 'success' ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />;
  const textColor = type === 'success' ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50`}>
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
        <div className="mb-4 flex justify-center">{icon}</div>
        <p className={`text-lg font-semibold ${textColor}`}>{children}</p>
      </div>
    </div>
  );
};

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const navigate = useNavigate();

    const API_URL = "http://localhost:8080/api/auth";

    const displayMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000); // Hide after 5 seconds
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            await axios.post(`${API_URL}/forgot-password`, { email });
            displayMessage('A password reset code has been sent to your email.', 'success');
            setStep(2);
        } catch (error) {
            const errorMsg = error.response?.data || 'Failed to send OTP. Please check your email.';
            displayMessage(errorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        if (newPassword !== confirmPassword) {
            displayMessage('Passwords do not match.', 'error');
            setIsLoading(false);
            return;
        }

        try {
            await axios.post(`${API_URL}/reset-password`, { email, otp, newPassword });
            displayMessage('Password reset successfully!', 'success');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            const errorMsg = error.response?.data || 'Failed to reset password. Invalid or expired code.';
            displayMessage(errorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Forgot Password?</h2>
                        <p className="text-center text-sm text-gray-500 mb-6">Enter your email and we'll send you a password reset code.</p>
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email</label>
                                <Input
                                    icon={<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />}
                                    type="email"
                                    id="email"
                                    placeholder="your-email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Send Reset Code'}
                            </Button>
                        </form>
                    </>
                );
            case 2:
                return (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Reset Password</h2>
                        <p className="text-center text-sm text-gray-500 mb-6">A 6-digit code has been sent to your email. Enter it below to reset your password.</p>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label htmlFor="otp" className="block text-gray-700 font-semibold mb-2">Code (OTP)</label>
                                <Input
                                    icon={<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />}
                                    type="password"
                                    id="otp"
                                    placeholder="Enter your 6-digit code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="new-password" className="block text-gray-700 font-semibold mb-2">New Password</label>
                                <Input
                                    icon={<Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />}
                                    type="password"
                                    id="new-password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="block text-gray-700 font-semibold mb-2">Confirm New Password</label>
                                <Input
                                    icon={<Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />}
                                    type="password"
                                    id="confirm-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Update Password'}
                            </Button>
                        </form>
                    </>
                );
            default:
                return null;
        }
    };

    return (
      <div className="relative h-full flex items-center justify-center font-sans">
        <Card>
          {renderContent()}
        </Card>

        {/* Custom Message Modal */}
        {message && (
          <Message type={messageType}>{message}</Message>
        )}
      </div>
    );
};

export default ForgotPassword;
