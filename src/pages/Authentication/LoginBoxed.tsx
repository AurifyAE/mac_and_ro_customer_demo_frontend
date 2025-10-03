import React, { useEffect, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Globe, User, Phone, UserPlus, LogIn, Upload, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { countries, Country } from '../../utils/countries';

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
        country: '',
        customerPhone: '',
        confirmPassword: '',
        image: null
    });

    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [countrySearchTerm, setCountrySearchTerm] = useState('');
    const [phoneValidationMessage, setPhoneValidationMessage] = useState('');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (showCountryDropdown && !target.closest('.country-dropdown')) {
                setShowCountryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCountryDropdown]);

    const [imagePreview, setImagePreview] = useState(null);

    const backendUrl = import.meta.env.VITE_API_URL; // Using default since we can't access env in artifacts

    const handleLoginSubmit = async (e: any) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Required field validation
        if (!loginData.userName.trim() || !loginData.password.trim()) {
            setError('Username and password are required.');
            return;
        }

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

    // Email validation function
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleImageUpload = (e:any) => {
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
            reader.onload = (e:any) => {
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
       const fileInput = document.getElementById('imageUpload') as HTMLInputElement | null;
if (fileInput) {
    fileInput.value = '';
}
    };

    const handleRegisterSubmit = async (e:any) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        // Enhanced Validation with Regional Support
        
        // 1. Basic field validation
        if (!registerData.customerName.trim()) {
            setError('Please enter your full name');
            setIsSubmitting(false);
            return;
        }

        if (!registerData.userName.trim()) {
            setError('Please enter a username');
            setIsSubmitting(false);
            return;
        }

        if (!registerData.customerEmail.trim()) {
            setError('Please enter your email address');
            setIsSubmitting(false);
            return;
        }

        // 2. Email validation
        if (!validateEmail(registerData.customerEmail)) {
            setError('Please enter a valid email address');
            setIsSubmitting(false);
            return;
        }

        // 3. Country validation
        if (!validateCountrySelection(selectedCountry)) {
            setError('Please select a valid country from the list');
            setIsSubmitting(false);
            return;
        }

        // 4. Phone number validation with regional patterns
        if (!registerData.customerPhone.trim()) {
            setError('Please enter your phone number');
            setIsSubmitting(false);
            return;
        }

        if (!validatePhoneNumber(registerData.customerPhone, selectedCountry)) {
            const countryName = selectedCountry?.name || 'your country';
            setError(`Please enter a valid phone number for ${countryName}`);
            setIsSubmitting(false);
            return;
        }

        // 5. Password validation
        if (registerData.customerPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            setIsSubmitting(false);
            return;
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerData.customerPassword)) {
            setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
            setIsSubmitting(false);
            return;
        }

        if (registerData.customerPassword !== registerData.confirmPassword) {
            setError('Passwords do not match');
            setIsSubmitting(false);
            return;
        }

        // 6. Regional-specific validation
        const regionalError = validateRegionalRequirements(registerData, selectedCountry);
        if (regionalError) {
            setError(regionalError);
            setIsSubmitting(false);
            return;
        }

        // 7. Username validation
        if (registerData.userName.length < 3) {
            setError('Username must be at least 3 characters long');
            setIsSubmitting(false);
            return;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(registerData.userName)) {
            setError('Username can only contain letters, numbers, underscores, and hyphens');
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
            formData.append('country', selectedCountry?.name || '');
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
                    country: '',
                    customerPhone: '',
                    confirmPassword: '',
                    image: null
                });
                setSelectedCountry(null);
                setImagePreview(null);
                
                // Reset file input
               const fileInput = document.getElementById('imageUpload') as HTMLInputElement | null;
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

    const handleLoginInputChange = (e:any) => {
        const { name, value } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegisterInputChange = (e:any) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({
            ...prev,
            [name]: value
        }));

        // Real-time phone validation feedback
        if (name === 'customerPhone' && selectedCountry) {
            if (value.trim() === '') {
                setPhoneValidationMessage('');
            } else if (validatePhoneNumber(value, selectedCountry)) {
                setPhoneValidationMessage('✓ Valid phone number');
            } else {
                const cleanPhone = value.replace(/\D/g, '');
                const expectedLength = getExpectedPhoneLength(selectedCountry);
                setPhoneValidationMessage(`Invalid format. Expected ${expectedLength} digits for ${selectedCountry.name}`);
            }
        }
    };

    // Helper function to get expected phone length for a country
    const getExpectedPhoneLength = (country: Country): string => {
        const lengthMap: { [key: string]: string } = {
            'US': '10', 'CA': '10',
            'GB': '10-11', 'DE': '10-12', 'FR': '9-10', 'IT': '9-11', 'ES': '9', 'NL': '9',
            'IN': '10', 'CN': '11', 'JP': '10-11', 'AU': '9-10', 'SG': '8',
            'AE': '9', 'SA': '9', 'EG': '10-11', 'ZA': '9',
            'BR': '10-11', 'MX': '10', 'AR': '10-11'
        };
        return lengthMap[country.code] || '7-15';
    };

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
        setShowCountryDropdown(false);
        setCountrySearchTerm('');
        
        // Update register data with country info
        setRegisterData(prev => ({
            ...prev,
            country: country.name
        }));
        
        // Clear phone number when country changes to avoid invalid combinations
        setRegisterData(prev => ({
            ...prev,
            customerPhone: ''
        }));
    };

    // Enhanced validation functions for different regions
    const validatePhoneNumber = (phone: string, country: Country | null): boolean => {
        if (!phone || !country) return false;
        
        // Remove all non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Regional phone validation patterns
        const phonePatterns: { [key: string]: RegExp } = {
            // North America (US, Canada)
            'US': /^[2-9]\d{9}$/, // 10 digits, first digit 2-9
            'CA': /^[2-9]\d{9}$/, // Same as US
            
            // Europe
            'GB': /^\d{10,11}$/, // UK: 10-11 digits
            'DE': /^\d{10,12}$/, // Germany: 10-12 digits
            'FR': /^\d{9,10}$/, // France: 9-10 digits
            'IT': /^\d{9,11}$/, // Italy: 9-11 digits
            'ES': /^\d{9}$/, // Spain: 9 digits
            'NL': /^\d{9}$/, // Netherlands: 9 digits
            
            // Asia Pacific
            'IN': /^\d{10}$/, // India: 10 digits
            'CN': /^\d{11}$/, // China: 11 digits
            'JP': /^\d{10,11}$/, // Japan: 10-11 digits
            'AU': /^\d{9,10}$/, // Australia: 9-10 digits
            'SG': /^\d{8}$/, // Singapore: 8 digits
            
            // Middle East & Africa
            'AE': /^\d{9}$/, // UAE: 9 digits
            'SA': /^\d{9}$/, // Saudi Arabia: 9 digits
            'EG': /^\d{10,11}$/, // Egypt: 10-11 digits
            'ZA': /^\d{9}$/, // South Africa: 9 digits
            
            // Latin America
            'BR': /^\d{10,11}$/, // Brazil: 10-11 digits
            'MX': /^\d{10}$/, // Mexico: 10 digits
            'AR': /^\d{10,11}$/, // Argentina: 10-11 digits
        };
        
        const pattern = phonePatterns[country.code] || /^\d{7,15}$/; // Default: 7-15 digits
        return pattern.test(cleanPhone);
    };

    const validateCountrySelection = (country: Country | null): boolean => {
        if (!country) return false;
        
        // Ensure the country exists in our countries list
        const validCountry = countries.find(c => 
            c.code === country.code && 
            c.name === country.name && 
            c.phoneCode === country.phoneCode
        );
        
        return !!validCountry;
    };

    const validateRegionalRequirements = (data: any, country: Country | null): string | null => {
        if (!country) return 'Please select a valid country';
        
        // Regional-specific validation rules
        const regionalRules: { [key: string]: (data: any) => string | null } = {
            // European GDPR regions - stricter email validation
            'GB': (data) => {
                if (!data.customerEmail.includes('.')) return 'Email must contain a valid domain';
                return null;
            },
            'DE': (data) => {
                if (!data.customerEmail.includes('.')) return 'Email must contain a valid domain';
                return null;
            },
            'FR': (data) => {
                if (!data.customerEmail.includes('.')) return 'Email must contain a valid domain';
                return null;
            },
            
            // US - Additional name validation
            'US': (data) => {
                if (data.customerName.length < 2) return 'Name must be at least 2 characters';
                if (!/^[a-zA-Z\s'-]+$/.test(data.customerName)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
                return null;
            },
            
            // India - Additional validation
            'IN': (data) => {
                if (data.customerName.length < 2) return 'Name must be at least 2 characters';
                return null;
            },
            
            // UAE - Additional validation
            'AE': (data) => {
                if (data.customerName.length < 2) return 'Name must be at least 2 characters';
                return null;
            },
            
            // Default validation for other countries
            'default': (data) => {
                if (data.customerName.length < 2) return 'Name must be at least 2 characters';
                return null;
            }
        };
        
        const validator = regionalRules[country.code] || regionalRules['default'];
        return validator(data);
    };

    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
        country.phoneCode.includes(countrySearchTerm)
    );

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
                    <form className="space-y-6" onSubmit={handleLoginSubmit}>
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
                            type="submit"
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
                    </form>
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

                        {/* Country Selection */}
                        <div>
                            <label htmlFor="country" className="mb-2 block text-sm font-medium text-white">
                                Country *
                            </label>
                            <div className="relative country-dropdown">
                                <button
                                    type="button"
                                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-12 pr-12 text-left text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                                >
                                    {selectedCountry ? (
                                        <span className="flex items-center">
                                            <span className="mr-2">{selectedCountry.flag}</span>
                                            {selectedCountry.name} ({selectedCountry.phoneCode})
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Select your country</span>
                                    )}
                                </button>
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Globe className="w-5 h-5" />
                                </span>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <ChevronDown className={`w-5 h-5 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                                </span>
                                
                                {showCountryDropdown && (
                                    <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-60 overflow-hidden">
                                        <div className="p-2">
                                            <input
                                                type="text"
                                                placeholder="Search countries..."
                                                value={countrySearchTerm}
                                                onChange={(e) => setCountrySearchTerm(e.target.value)}
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {filteredCountries.map((country) => (
                                                <button
                                                    key={country.code}
                                                    type="button"
                                                    onClick={() => handleCountrySelect(country)}
                                                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center"
                                                >
                                                    <span className="mr-3">{country.flag}</span>
                                                    <span className="flex-1">{country.name}</span>
                                                    <span className="text-gray-400 text-sm">{country.phoneCode}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="customerPhone" className="mb-2 block text-sm font-medium text-white">
                                Phone Number *
                            </label>
                            <div className="relative flex">
                                <div className="flex items-center px-3 bg-white/5 border border-white/20 border-r-0 rounded-l-lg">
                                    {selectedCountry ? (
                                        <span className="flex items-center text-white text-sm">
                                            <span className="mr-1">{selectedCountry.flag}</span>
                                            {selectedCountry.phoneCode}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">+00</span>
                                    )}
                                </div>
                                <input
                                    id="customerPhone"
                                    name="customerPhone"
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    className="flex-1 rounded-r-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                                    value={registerData.customerPhone}
                                    onChange={handleRegisterInputChange}
                                    required
                                />
                            </div>
                            {/* Phone validation message */}
                            {phoneValidationMessage && (
                                <p className={`text-xs mt-1 ${
                                    phoneValidationMessage.includes('✓') 
                                        ? 'text-green-400' 
                                        : 'text-yellow-400'
                                }`}>
                                    {phoneValidationMessage}
                                </p>
                            )}
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