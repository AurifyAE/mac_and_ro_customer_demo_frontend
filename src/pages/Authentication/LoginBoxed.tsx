import React, { useEffect, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Globe, User, Phone, UserPlus, LogIn, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginRegisterForm = () => {
    // Common states
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        // Simulate token check - would normally use localStorage
        const hasToken = token !== null;
        if (hasToken) {
            // If token exists, redirect to home page
            navigate('/');
            console.log('Redirecting to home page');
        } else {
            // If no token, ensure we're on the login page
            setIsLogin(true);
        }
    }, [])
    
    // Login states
    const [loginData, setLoginData] = useState({
        userName: '',
        password: ''
    });

    // Register states
    const [registerData, setRegisterData] = useState({
        customerName: '',
        userName: '',
        customerPassword: '',
        customerEmail: '',
        customerPhone: '',
        confirmPassword: '',
        image: null
    });

    const [imagePreview, setImagePreview] = useState(null);

    const backendUrl = import.meta.env.VITE_API_URL; // Using default since we can't access env in artifacts

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);
        
        try {
            console.log('Submitting login with:', loginData);
            
            // Simulate API call - replace with actual axios call
            const response = await fetch(`${backendUrl}/api/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userName: loginData.userName.trim(),
                    password: loginData.password.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('customer', JSON.stringify(data.customer));
                console.log('Login successful, token:', data.token);
                setSuccess('Login successful! Redirecting...');
                navigate('/'); // Uncomment when using with router
            } else {
                setError(data.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Login failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }
            
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            setRegisterData(prev => ({
                ...prev,
                image: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setRegisterData(prev => ({
            ...prev,
            image: null
        }));
        setImagePreview(null);
        // Reset file input
        const fileInput = document.getElementById('imageUpload');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        // Validation
        if (registerData.customerPassword !== registerData.confirmPassword) {
            setError('Passwords do not match');
            setIsSubmitting(false);
            return;
        }

        if (registerData.customerPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsSubmitting(false);
            return;
        }

        try {
            console.log('Submitting registration with:', registerData);
            
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('customerName', registerData.customerName.trim());
            formData.append('userName', registerData.userName.trim());
            formData.append('customerPassword', registerData.customerPassword.trim());
            formData.append('customerEmail', registerData.customerEmail.trim());
            formData.append('customerPhone', registerData.customerPhone.trim());
            
            // Append image if selected
            if (registerData.image) {
                formData.append('image', registerData.image);
            }

            const response = await fetch(`${backendUrl}/api/user/register`, {
                method: 'POST',
                body: formData, // Don't set Content-Type header when using FormData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('Registration successful! You can now login.');
                // Reset form
                setRegisterData({
                    customerName: '',
                    userName: '',
                    customerPassword: '',
                    customerEmail: '',
                    customerPhone: '',
                    confirmPassword: '',
                    image: null
                });
                setImagePreview(null);
                
                // Reset file input
                const fileInput = document.getElementById('imageUpload');
                if (fileInput) {
                    fileInput.value = '';
                }
                
                // Switch to login form after successful registration
                setTimeout(() => {
                    setIsLogin(true);
                    setSuccess('');
                }, 2000);
            } else {
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLoginInputChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegisterInputChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const switchForm = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccess('');
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 px-4 py-8">
            {/* Main Form Card */}
            <div className="relative w-full max-w-[500px] rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-8 shadow-2xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                        <Globe className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="mb-2 text-4xl font-bold text-white">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-lg text-gray-200">
                        {isLogin ? 'Sign in to your account' : 'Join us today'}
                    </p>
                </div>

                {/* Form Toggle Buttons */}
                <div className="mb-6 flex rounded-lg bg-white/5 p-1">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            isLogin
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white'
                        }`}
                    >
                        <LogIn className="inline w-4 h-4 mr-2" />
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            !isLogin
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white'
                        }`}
                    >
                        <UserPlus className="inline w-4 h-4 mr-2" />
                        Register
                    </button>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-4 rounded-lg bg-green-500/20 border border-green-500/30 p-3">
                        <p className="text-sm text-green-300">{success}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/30 p-3">
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                )}

                {/* Login Form */}
                {isLogin && (
                    <div className="space-y-6">
                        {/* Username Input */}
                        <div>
                            <label htmlFor="userName" className="mb-2 block text-sm font-medium text-white">
                                Username *
                            </label>
                            <div className="relative">
                                <input
                                    id="userName"
                                    name="userName"
                                    type="text"
                                    placeholder="Enter your username"
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-12 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                                    value={loginData.userName}
                                    onChange={handleLoginInputChange}
                                    required
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail className="w-5 h-5" />
                                </span>
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-white">
                                Password *
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-12 pr-12 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                                    value={loginData.password}
                                    onChange={handleLoginInputChange}
                                    required
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleLoginSubmit}
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                )}

                {/* Register Form */}
                {!isLogin && (
                    <div className="space-y-4">
                        {/* Image Upload */}
                        <div>
                            <label htmlFor="imageUpload" className="mb-2 block text-sm font-medium text-white">
                                Profile Image
                            </label>
                            <div className="relative">
                                {!imagePreview ? (
                                    <div className="flex items-center justify-center w-full">
                                        <label htmlFor="imageUpload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-all duration-200">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-300">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-400">PNG, JPG or JPEG (MAX. 5MB)</p>
                                            </div>
                                            <input 
                                                id="imageUpload" 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="w-full h-32 object-cover rounded-lg border border-white/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors duration-200"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Customer Name */}
                        <div>
                            <label htmlFor="customerName" className="mb-2 block text-sm font-medium text-white">
                                Full Name *
                            </label>
                            <div className="relative">
                                <input
                                    id="customerName"
                                    name="customerName"
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-12 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                                    value={registerData.customerName}
                                    onChange={handleRegisterInputChange}
                                    required
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <User className="w-5 h-5" />
                                </span>
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label htmlFor="registerUserName" className="mb-2 block text-sm font-medium text-white">
                                Username *
                            </label>
                            <div className="relative">
                                <input
                                    id="registerUserName"
                                    name="userName"
                                    type="text"
                                    placeholder="Choose a username"
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-12 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                                    value={registerData.userName}
                                    onChange={handleRegisterInputChange}
                                    required
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail className="w-5 h-5" />
                                </span>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="customerEmail" className="mb-2 block text-sm font-medium text-white">
                                Email *
                            </label>
                            <div className="relative">
                                <input
                                    id="customerEmail"
                                    name="customerEmail"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-12 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                                    value={registerData.customerEmail}
                                    onChange={handleRegisterInputChange}
                                    required
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail className="w-5 h-5" />
                                </span>
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="customerPhone" className="mb-2 block text-sm font-medium text-white">
                                Phone Number *
                            </label>
                            <div className="relative">
                                <input
                                    id="customerPhone"
                                    name="customerPhone"
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-12 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                                    value={registerData.customerPhone}
                                    onChange={handleRegisterInputChange}
                                    required
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Phone className="w-5 h-5" />
                                </span>
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="customerPassword" className="mb-2 block text-sm font-medium text-white">
                                Password *
                            </label>
                            <div className="relative">
                                <input
                                    id="customerPassword"
                                    name="customerPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a password"
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-12 pr-12 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                                    value={registerData.customerPassword}
                                    onChange={handleRegisterInputChange}
                                    required
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-white">
                                Confirm Password *
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-12 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                                    value={registerData.confirmPassword}
                                    onChange={handleRegisterInputChange}
                                    required
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleRegisterSubmit}
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-6"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Creating Account...</span>
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </div>
                )}

                {/* Switch Form Link */}
                <div className="text-center mt-6">
                    <span className="text-gray-300">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                    </span>
                    <button
                        onClick={switchForm}
                        className="text-blue-400 hover:text-blue-300 underline font-medium transition-colors duration-200"
                    >
                        {isLogin ? 'Sign up here' : 'Sign in here'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginRegisterForm;