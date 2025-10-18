import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Step1Form from '../components/Registration/Step1Form';
import Step2Form from '../components/Registration/Step2Form';
import Step3Form from '../components/Registration/Step3Form';
import Footer from '../components/Registration/Footer';


interface FormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  userName: string;
  country: string;
  customerPassword: string;
  confirmPassword: string;
  dateOfBirth: string;
  residence: string;
  bankAccountNumber: string;
  branch: string;
  sourceOfIncome: string;
  type: string;
  idNumber: string;
  identityFront: File | null;
  identityBack: File | null;
}

interface Branch {
  _id: string;
  branchName: string;
  branchCode: string;
  country: string;
}

const ExternalRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [goldPrice, setGoldPrice] = useState('2,685.30');
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Form data state
  const [formData, setFormData] = useState<FormData>({
    // Step 1 - Basic Information
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    userName: '',
    country: '',
    customerPassword: '',
    confirmPassword: '',
    
    // Step 2 - Personal Details
    dateOfBirth: '',
    residence: '',
    bankAccountNumber: '',
    branch: '',
    sourceOfIncome: '',
    type: 'B2C',
    
    // Step 3 - Identity Verification
    idNumber: '',
    identityFront: null,
    identityBack: null
  });

  // File preview states
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches();
    // Simulate gold price update
    const interval = setInterval(() => {
      const price = (2685 + Math.random() * 10).toFixed(2);
      setGoldPrice(price.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Debug branches state changes
  useEffect(() => {
    console.log('Branches state updated:', branches);
  }, [branches]);

  // Expose test function to window for debugging
  useEffect(() => {
    (window as any).testBranchesAPI = async () => {
      console.log('Manual test - Backend URL:', backendUrl);
      try {
        const response = await fetch(`${backendUrl}/api/external/branches`);
        console.log('Manual test - Response status:', response.status);
        const data = await response.json();
        console.log('Manual test - Response data:', data);
        return data;
      } catch (error) {
        console.error('Manual test - Error:', error);
        return error;
      }
    };
  }, [backendUrl]);

  const fetchBranches = async () => {
    setBranchesLoading(true);
    try {
      console.log('Backend URL:', backendUrl);
      console.log('Fetching branches from:', `${backendUrl}/api/external/branches`);
      
      const response = await axios.get(`${backendUrl}/api/external/branches`);
      console.log('Branches response status:', response.status);
      console.log('Branches response data:', response.data);
      
      if (response.data.success) {
        setBranches(response.data.branches);
        console.log('Branches set successfully:', response.data.branches);
      } else {
        console.error('API returned success: false');
        setBranches([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch branches - Full error:', error);
      console.error('Error message:', error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      if (error.request) {
        console.error('Error request:', error.request);
      }
      
      // Fallback: Set default branches if API fails (using actual IDs from database)
      console.log('Setting fallback branches due to API failure');
      setBranches([
        { _id: '68affd48211e3a51b4e8705b', branchName: 'Dubai', branchCode: 'MAC-BR-0001', country: 'United Arab Emirates' },
        { _id: '68affd66211e3a51b4e8705f', branchName: 'Sharjah', branchCode: 'MAC-BR-0002', country: 'United Arab Emirates' }
      ]);
    } finally {
      setBranchesLoading(false);
    }
  };

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) return;
    try {
      const response = await axios.get(`${backendUrl}/api/external/check-username/${username}`);
      if (!response.data.available) {
        setErrors(prev => ({ ...prev, userName: response.data.message }));
      } else {
        setErrors(prev => ({ ...prev, userName: '' }));
      }
    } catch (error) {
      console.error('Failed to check username:', error);
    }
  };

  // Check email availability
  const checkEmailAvailability = async (email: string) => {
    if (!email.includes('@')) return;
    try {
      const response = await axios.get(`${backendUrl}/api/external/check-email?email=${encodeURIComponent(email)}`);
      if (!response.data.available) {
        setErrors(prev => ({ ...prev, customerEmail: response.data.message }));
      } else {
        setErrors(prev => ({ ...prev, customerEmail: '' }));
      }
    } catch (error) {
      console.error('Failed to check email:', error);
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/\d/)) strength += 25;
    if (password.match(/[^a-zA-Z\d]/)) strength += 25;
    setPasswordStrength(strength);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));

    // Special handling for specific fields
    if (name === 'userName') {
      checkUsernameAvailability(value);
    } else if (name === 'customerEmail') {
      checkEmailAvailability(value);
    } else if (name === 'customerPassword') {
      calculatePasswordStrength(value);
    }
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'identityFront' | 'identityBack') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [type]: 'File size must be less than 5MB' }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [type]: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'identityFront') {
          setFrontPreview(reader.result as string);
        } else {
          setBackPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate current step
  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.customerName?.trim()) newErrors.customerName = 'Full name is required';
      if (!formData.customerPhone?.trim()) newErrors.customerPhone = 'Phone number is required';
      if (!formData.customerEmail?.trim()) newErrors.customerEmail = 'Email is required';
      if (!formData.userName?.trim()) newErrors.userName = 'Username is required';
      if (!formData.country?.trim()) newErrors.country = 'Country is required';
      if (!formData.customerPassword?.trim()) newErrors.customerPassword = 'Password is required';
      if (formData.customerPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (step === 2) {
      if (!formData.dateOfBirth?.trim()) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.residence?.trim()) newErrors.residence = 'Residence address is required';
      if (!formData.bankAccountNumber?.trim()) newErrors.bankAccountNumber = 'Bank account number is required';
      if (!formData.branch?.trim()) newErrors.branch = 'Branch selection is required';
      if (!formData.sourceOfIncome?.trim()) newErrors.sourceOfIncome = 'Source of income is required';
    } else if (step === 3) {
      if (!formData.idNumber?.trim()) newErrors.idNumber = 'Identity number is required';
      if (!formData.identityFront) newErrors.identityFront = 'Front side of ID is required';
      if (!formData.identityBack) newErrors.identityBack = 'Back side of ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug: Log current form data
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Current form data:', formData);
    console.log('Current errors before validation:', errors);
    
    // Check if formData has the required fields
    console.log('=== IMMEDIATE FORM DATA CHECK ===');
    console.log('customerName:', formData.customerName);
    console.log('userName:', formData.userName);
    console.log('customerEmail:', formData.customerEmail);
    console.log('customerPhone:', formData.customerPhone);
    console.log('customerPassword:', formData.customerPassword);
    
    // Validate all steps before submission
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);
    
    console.log('Validation results:', { step1Valid, step2Valid, step3Valid });
    console.log('Errors after validation:', errors);
    
    if (!step1Valid || !step2Valid || !step3Valid) {
      // Show detailed error information
      const errorDetails = Object.entries(errors).map(([field, error]) => `${field}: ${error}`).join('\n');
      console.log('Detailed errors:', errorDetails);
      
      let errorMessage = 'Please fill in all required fields:\n\n';
      if (!step1Valid) errorMessage += '- Step 1: Basic Information\n';
      if (!step2Valid) errorMessage += '- Step 2: Personal Details\n';
      if (!step3Valid) errorMessage += '- Step 3: Identity Verification\n';
      errorMessage += '\nDetailed errors:\n' + errorDetails;
      
      alert(errorMessage);
      return;
    }
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Debug: Log all form data before sending
      console.log('Form data being sent:', formData);
      
      // Check required customer fields specifically
      const requiredCustomerFields = ['customerName', 'userName', 'customerPassword', 'customerEmail', 'customerPhone'];
      console.log('=== REQUIRED CUSTOMER FIELDS CHECK ===');
      requiredCustomerFields.forEach(field => {
        const value = (formData as any)[field];
        console.log(`${field}: "${value}" (length: ${value?.length || 0}, type: ${typeof value})`);
        if (!value || !value.trim()) {
          console.error(`❌ MISSING: ${field} is empty or undefined!`);
        } else {
          console.log(`✅ OK: ${field} has value`);
        }
      });
      
      // Append all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'identityFront' && key !== 'identityBack' && key !== 'confirmPassword') {
          const value = (formData as any)[key];
          console.log(`Appending ${key}: "${value}"`);
          formDataToSend.append(key, value || ''); // Ensure we don't send undefined
        }
      });
      
      // Append files
      if (formData.identityFront) {
        formDataToSend.append('identityFront', formData.identityFront);
        console.log('Appending identityFront file:', formData.identityFront.name);
      }
      if (formData.identityBack) {
        formDataToSend.append('identityBack', formData.identityBack);
        console.log('Appending identityBack file:', formData.identityBack.name);
      }
      
      // Log all FormData entries
      console.log('=== FORM DATA ENTRIES ===');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }
      
      console.log('Sending POST request to:', `${backendUrl}/api/external/register`);
      const response = await axios.post(`${backendUrl}/api/external/register`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        // Log the successful response data for debugging
        console.log('Registration successful! Response data:', response.data);
        console.log('Customer data:', response.data.customer);
        console.log('KYC form data:', response.data.kycForm);
        console.log('Token:', response.data.token);
        
        // Store token
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('customer', JSON.stringify(response.data.customer));
        
        // Show success message and redirect
        alert('Registration successful! Your KYC is pending approval.');
        window.location.reload()
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      const errorMessage = error?.response?.data?.message || 'Registration failed. Please try again.';
      console.error('Backend error message:', errorMessage);
      
      alert(`Registration failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Step indicator component
  const StepIndicator = ({ step, title, isActive, isCompleted }: { step: number; title: string; isActive: boolean; isCompleted: boolean }) => (
    <div className="flex items-center">
      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
        isCompleted ? 'bg-[#D4AF37] border-[#D4AF37] text-black' : 
        isActive ? 'bg-black border-[#D4AF37] text-[#D4AF37]' : 
        'bg-gray-200 border-gray-300 text-gray-500'
      }`}>
        {isCompleted ? '✓' : step}
      </div>
      <span className={`ml-3 font-medium ${
        isActive || isCompleted ? 'text-black' : 'text-gray-500'
      }`}>{title}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F0E6]">
      {/* Header */}
      {/* <header className="bg-black text-white">
        <div className="container mx-auto px-4">
        
          <div className="flex justify-between items-center py-2 text-sm border-b border-gray-800">
            <div className="flex items-center space-x-4">
              <span>Download App</span>
              <span className="text-gray-400">|</span>
              <span>USD</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-[#D4AF37]">Gold Spot Price</span>
              <span className="font-bold">${goldPrice}/oz</span>
              <span className="text-gray-400">|</span>
              <button className="hover:text-[#D4AF37] transition">EN</button>
              <span className="text-gray-400">|</span>
              <button onClick={() => navigate('/login')} className="hover:text-[#D4AF37] transition">
                Sign In
              </button>
            </div>
          </div>
        
          <nav className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-[#D4AF37]">MAC & RO</div>
              <div className="text-xs">CAPITAL FZC</div>
            </div>
            <ul className="flex space-x-8 text-sm">
              <li><a href="/" className="hover:text-[#D4AF37] transition">Home</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition">Who We Are</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition">Products</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition">Services</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition">Corporate Governance</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition">News</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition">FAQ</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header> */}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl font-serif text-center mb-8 text-black">Create Your Account</h1>
          
          {/* Step Indicators */}
          <div className="flex justify-between mb-12 max-w-3xl mx-auto">
            <StepIndicator 
              step={1} 
              title="Basic Information" 
              isActive={currentStep === 1}
              isCompleted={currentStep > 1}
            />
            <div className={`flex-1 h-0.5 self-center mx-4 ${currentStep > 1 ? 'bg-[#D4AF37]' : 'bg-gray-300'}`}></div>
            <StepIndicator 
              step={2} 
              title="Personal Details" 
              isActive={currentStep === 2}
              isCompleted={currentStep > 2}
            />
            <div className={`flex-1 h-0.5 self-center mx-4 ${currentStep > 2 ? 'bg-[#D4AF37]' : 'bg-gray-300'}`}></div>
            <StepIndicator 
              step={3} 
              title="Identity Verification" 
              isActive={currentStep === 3}
              isCompleted={false}
            />
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <Step1Form 
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  passwordStrength={passwordStrength}
                  checkEmailAvailability={checkEmailAvailability}
                  checkUsernameAvailability={checkUsernameAvailability}
                  handleNext={handleNext}
                />
              )}

              {/* Step 2: Personal Details */}
              {currentStep === 2 && (
                <Step2Form
                  formData={formData}
                  errors={errors}
                  branches={branches}
                  branchesLoading={branchesLoading}
                  handleInputChange={handleInputChange}
                  handlePrevious={handlePrevious}
                  handleNext={handleNext}
                  onRetryBranches={fetchBranches}
                />
              )}

              {/* Step 3: Identity Verification */}
              {currentStep === 3 && (
                <Step3Form
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  handleFileUpload={handleFileUpload}
                  frontPreview={frontPreview}
                  backPreview={backPreview}
                  handlePrevious={handlePrevious}
                  loading={loading}
                />
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
};

export default ExternalRegistration;
