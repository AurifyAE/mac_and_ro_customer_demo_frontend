import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bankAccountNumber: string;
  dateOfBirth: string; // Changed from age: string
  nationality: string;
  residence: string;
  sourceOfIncome: string;
  idNumber: string;
  branch: string;
  type: string;
  image: File | null;
  document: File | null;
}

const KYCForm = () => {
    const navigate = useNavigate(); // Uncomment when using React Router
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    bankAccountNumber: '',
  dateOfBirth: '', // Changed from age: ''
    nationality: '',
    residence: '',
    sourceOfIncome: '',
    idNumber: '',
    branch: '',
    type: '',
    image: null,
    document: null
  });
      const iscustomer = JSON.parse(localStorage.getItem('customer') || '{}');

    const customerId = iscustomer.id;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
      const [customer, setCustomer] = useState<any>('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [branches, setBranches] = useState<any[]>([]); // If you need to fetch branches dynamically
  const backendUrl = import.meta.env.VITE_API_URL; // Ensure this is set in your environment variables

  // const navigate = useNavigate(); // Uncomment when using React Router

   const fetchCustomerById = async () => {
          try {
              const res = await axios.get(`${backendUrl}/api/user/customers/${customerId}`);
              setCustomer(res.data);
          } catch (err) {
              console.error('Error fetching customer:', err);
              setCustomer(null);
          }
      };

      useEffect(() => {
        if (iscustomer && customerId) {
            fetchCustomerById();
        } else {
            setCustomer(null);
        }
    }, [customerId, backendUrl]);

 useEffect(() => {
    const isActive = customer?.kycStatus;
    if (isActive === 'rejected' || isActive === 'approved' || isActive === 'registered') {
        navigate('/'); // Uncomment when using React Router
    }
}, [customer?.kycStatus, navigate]);


    console.log('Customer:', customer);

  const fetchBranches = async () => {
    try {
      await axios.get(`${backendUrl}/api/user/branches`)
        .then(response => {
          setBranches(response.data);
        });
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  useEffect(() => {
   fetchBranches();
  }, []);

  console.log('Branches:', branches);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'image' | 'document') => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [fieldName]: file }));
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    // if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Email is required';
    // if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Contact number is required';
    if (!formData.bankAccountNumber.trim()) newErrors.bankAccountNumber = 'Bank account number is required';
  if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required'; // Changed from age
    if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
    if (!formData.residence.trim()) newErrors.residence = 'Residence is required';
    if (!formData.sourceOfIncome.trim()) newErrors.sourceOfIncome = 'Source of income is required';
    if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
    if (!formData.branch.trim()) newErrors.branch = 'Branch is required';
    if (!formData.type.trim()) newErrors.type = 'Account type is required';

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (formData.customerEmail && !emailRegex.test(formData.customerEmail)) {
    //   newErrors.customerEmail = 'Please enter a valid email address';
    // }

    // const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    // if (formData.customerPhone && !phoneRegex.test(formData.customerPhone.replace(/\s/g, ''))) {
    //   newErrors.customerPhone = 'Please enter a valid phone number';
    // }

   if (formData.dateOfBirth) {
  const birthDate = new Date(formData.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear(); // Use let here
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (birthDate > today) {
    newErrors.dateOfBirth = 'Date of birth cannot be in the future';
  } else if (age < 18) {
    newErrors.dateOfBirth = 'You must be at least 18 years old';
  } else if (age > 120) {
    newErrors.dateOfBirth = 'Please enter a valid date of birth';
  }
}


    if (!formData.image) newErrors.image = 'Front side image is required';
    if (!formData.document) newErrors.document = 'Back side image is required';

    if (formData.image) {
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!imageTypes.includes(formData.image.type)) {
        newErrors.image = 'Please upload a valid image file (JPEG, JPG, PNG)';
      }
    }

    if (formData.document) {
      const docTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!docTypes.includes(formData.document.type)) {
        newErrors.document = 'Please upload a valid document (JPEG, JPG, PNG, PDF)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors
    
    try {
      // Create FormData object for multipart/form-data submission
      const submitData = new FormData();
      
      // Append all text fields
      submitData.append('custId', customer._id);
      submitData.append('customerName', customer.customerName);
      submitData.append('customerEmail', customer.customerEmail);
      submitData.append('customerPhone', customer.customerPhone);
      submitData.append('bankAccountNumber', formData.bankAccountNumber);
    submitData.append('dateOfBirth', formData.dateOfBirth); // Changed from age
      submitData.append('nationality', formData.nationality);
      submitData.append('residence', formData.residence);
      submitData.append('sourceOfIncome', formData.sourceOfIncome);
      submitData.append('idNumber', formData.idNumber);
      submitData.append('branch', formData.branch);
      submitData.append('type', formData.type);
      
      // Append files
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      if (formData.document) {
        submitData.append('document', formData.document);
      }

      // Make API call to your backend
      const response = await fetch(`${backendUrl}/api/user/kyc`, {
        method: 'POST',
        body: submitData,
        // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('KYC submission successful:', result);
      
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        bankAccountNumber: '',
  dateOfBirth: '', // Changed from age: ''
        nationality: '',
        residence: '',
        sourceOfIncome: '',
        idNumber: '',
        branch: '',
        type: '',
        image: null,
        document: null
      });

      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      fileInputs.forEach(input => {
        input.value = '';
      });
      
    } catch (error: any) {
      console.error('KYC submission error:', error);
      setErrors({ 
        submit: error.message || 'Failed to submit KYC form. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 sm:px-16">
        <div className="relative w-full max-w-[600px] rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-8 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white">Success!</h1>
            <p className="mb-8 text-lg text-gray-200">Your KYC form has been submitted successfully</p>
            <div className="space-y-4">
              <p className="text-gray-300">
                Thank you for submitting your KYC information. Our team will review your application and contact you soon.
              </p>
              <button
                onClick={()=> navigate('/')}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 sm:px-16 py-8">
      <div className="relative w-full max-w-4xl rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">KYC Verification</h1>
          <p className="text-lg text-gray-200">Complete your Know Your Customer verification</p>
        </div>

        <div  className="space-y-8 text-white">
          {/* Personal Information Section */}
          <div className="rounded-lg bg-white/5 p-6 border border-white/10">
            <h2 className="mb-6 text-xl font-semibold text-white">Personal Information</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="customerName" className="mb-2 block text-sm font-medium">Full Name *</label>
                <div className="relative">
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    value={customer.customerName}
                    onChange={handleInputChange}
                    readOnly
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    👤
                  </span>
                </div>
                {errors.customerName && <p className="mt-1 text-sm text-red-400">{errors.customerName}</p>}
              </div>

              <div>
                <label htmlFor="customerEmail" className="mb-2 block text-sm font-medium">Email Address *</label>
                <div className="relative">
                  <input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    value={customer.customerEmail}
                    onChange={handleInputChange}
                    readOnly
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ✉️
                  </span>
                </div>
                {errors.customerEmail && <p className="mt-1 text-sm text-red-400">{errors.customerEmail}</p>}
              </div>

              <div>
                <label htmlFor="customerPhone" className="mb-2 block text-sm font-medium">Contact Number *</label>
                <div className="relative">
                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    value={customer.customerPhone}
                    onChange={handleInputChange}
                    readOnly
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    📞
                  </span>
                </div>
                {errors.customerPhone && <p className="mt-1 text-sm text-red-400">{errors.customerPhone}</p>}
              </div>

             <div>
  <label htmlFor="dateOfBirth" className="mb-2 block text-sm font-medium">Date of Birth *</label>
  <div className="relative">
    <input
      id="dateOfBirth"
      name="dateOfBirth"
      type="date"
      className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
      value={formData.dateOfBirth}
      onChange={handleInputChange}
      max={new Date().toISOString().split('T')[0]} // Prevents future dates
      required
    />
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      📅
    </span>
  </div>
  {errors.dateOfBirth && <p className="mt-1 text-sm text-red-400">{errors.dateOfBirth}</p>}
</div>

              <div>
                <label htmlFor="nationality" className="mb-2 block text-sm font-medium">Nationality *</label>
                <div className="relative">
                  <input
                    id="nationality"
                    name="nationality"
                    type="text"
                    placeholder="Enter your nationality"
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🌍
                  </span>
                </div>
                {errors.nationality && <p className="mt-1 text-sm text-red-400">{errors.nationality}</p>}
              </div>

              <div>
                <label htmlFor="residence" className="mb-2 block text-sm font-medium">Residence *</label>
                <div className="relative">
                  <input
                    id="residence"
                    name="residence"
                    type="text"
                    placeholder="Enter your residence"
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    value={formData.residence}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🏠
                  </span>
                </div>
                {errors.residence && <p className="mt-1 text-sm text-red-400">{errors.residence}</p>}
              </div>
            </div>
          </div>

          {/* Financial Information Section */}
          <div className="rounded-lg bg-white/5 p-6 border border-white/10">
            <h2 className="mb-6 text-xl font-semibold text-white">Financial Information</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="bankAccountNumber" className="mb-2 block text-sm font-medium">Bank Account Number *</label>
                <div className="relative">
                  <input
                    id="bankAccountNumber"
                    name="bankAccountNumber"
                    type="text"
                    placeholder="Enter your bank account number"
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    value={formData.bankAccountNumber}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    💳
                  </span>
                </div>
                {errors.bankAccountNumber && <p className="mt-1 text-sm text-red-400">{errors.bankAccountNumber}</p>}
              </div>

             <div>
  <label htmlFor="branch" className="mb-2 block text-sm font-medium">Branch *</label>
  <div className="relative">
    <select
      id="branch"
      name="branch"
      className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 appearance-none"
      value={formData.branch}
      onChange={handleInputChange}
      required
    >
      <option value="" disabled className="text-gray-400 bg-gray-800">
        Select your bank branch
      </option>
      {branches.map((branch) => (
        <option 
          key={branch._id} 
          value={branch._id}
          className="text-white bg-gray-800"
        >
          {branch.branchName}
        </option>
      ))}
    </select>
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      🏛️
    </span>
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
      ▼
    </span>
  </div>
  {errors.branch && <p className="mt-1 text-sm text-red-400">{errors.branch}</p>}
</div>

              <div>
                <label htmlFor="sourceOfIncome" className="mb-2 block text-sm font-medium">Source of Income *</label>
                <div className="relative">
                  <select
                    id="sourceOfIncome"
                    name="sourceOfIncome"
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    value={formData.sourceOfIncome}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" className="bg-gray-800">Select source of income</option>
                    <option value="Employment" className="bg-gray-800">Employment</option>
                    <option value="Business" className="bg-gray-800">Business</option>
                    <option value="Investment" className="bg-gray-800">Investment</option>
                    <option value="Pension" className="bg-gray-800">Pension</option>
                    <option value="Other" className="bg-gray-800">Other</option>
                  </select>
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    💰
                  </span>
                </div>
                {errors.sourceOfIncome && <p className="mt-1 text-sm text-red-400">{errors.sourceOfIncome}</p>}
              </div>

              <div>
  <label htmlFor="type" className="mb-2 block text-sm font-medium">Account Type *</label>
  <div className="relative">
    <select
      id="type"
      name="type"
      className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
      value={formData.type}
      onChange={handleInputChange}
      required
    >
      <option value="" className="bg-gray-800">Select account type</option>
      <option value="B2B" className="bg-gray-800">B2B (Business to Business)</option>
      <option value="B2C" className="bg-gray-800">B2C (Business to Consumer)</option>
    </select>
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      🏢
    </span>
  </div>
  {errors.type && <p className="mt-1 text-sm text-red-400">{errors.type}</p>}
</div>
            </div>
          </div>

          {/* Identity Information Section */}
          <div className="rounded-lg bg-white/5 p-6 border border-white/10">
            <h2 className="mb-6 text-xl font-semibold text-white">Identity Information</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="idNumber" className="mb-2 block text-sm font-medium">ID Number *</label>
                <div className="relative">
                  <input
                    id="idNumber"
                    name="idNumber"
                    type="text"
                    placeholder="Enter your ID number"
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🆔
                  </span>
                </div>
                {errors.idNumber && <p className="mt-1 text-sm text-red-400">{errors.idNumber}</p>}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="image" className="mb-2 block text-sm font-medium">Front side*</label>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange(e, 'image')}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white file:mr-4 file:rounded file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white file:hover:bg-blue-700"
                    required
                  />
                  {errors.image && <p className="mt-1 text-sm text-red-400">{errors.image}</p>}
                </div>

                <div>
                  <label htmlFor="document" className="mb-2 block text-sm font-medium">Back side *</label>
                  <input
                    id="document"
                    name="document"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) => handleFileChange(e, 'document')}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white file:mr-4 file:rounded file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white file:hover:bg-blue-700"
                    required
                  />
                  {errors.document && <p className="mt-1 text-sm text-red-400">{errors.document}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-4">
              <p className="text-sm text-red-300">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit KYC Form'
              )}
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center pt-4">
            <span className="text-gray-300">Already have credentials? </span>
            <button
              className="text-blue-400 hover:text-blue-300 underline"
              type="button"
              onClick={() => {
                navigate('/'); // Uncomment when using React Router
                // console.log('Navigate to login');
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCForm;