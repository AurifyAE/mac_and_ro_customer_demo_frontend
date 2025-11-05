import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, CreditCard, Building, Calendar, Shield, AlertCircle } from 'lucide-react';

interface FormData {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    bankAccountNumber: string;
    dateOfBirth: string;
    nationality: string;
    residence: string;
    sourceOfIncome: string;
    idNumber: string;
    branch: string;
    type: string;
    image: File | null;
    document: File | null;
    // Additional Idenfo fields
    gender?: string;
    passportNumber?: string;
    passportExpiryDate?: string;
    idExpiryDate?: string;
    workType?: string;
    industry?: string;
    companyName?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    isdCode?: string;
    // PEP Information
    anyPublicPos?: string;
    posLastTwoMonths?: string;
    everPublicPosition?: string;
    diplomaticImmunity?: string;
    relativeTwelveMonths?: string;
    closeAssociateTwelveMonths?: string;
    conviction?: string;
    other?: string;
    sourceOfWealth?: string[];
    sourceOfWealthOther?: string;
    sourceOfFunds?: string[];
    sourceOfFundsOther?: string;
    products?: string[];
}

// Lists for dropdowns
const countries = [
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'India',
    'China',
    'Japan',
    'Brazil',
    'Mexico',
    'Russia',
    'South Africa',
    'Egypt',
    'Nigeria',
    'Kenya',
    'UAE',
    'Saudi Arabia',
    'Singapore',
    'Malaysia',
    'Indonesia',
    'Thailand',
    'Philippines',
];

const industries = [
    'Accommodation and food service activities',
    'Agriculture, forestry and fishing',
    'Construction',
    'Education',
    'Financial and insurance activities',
    'Information and communication',
    'Manufacturing',
    'Real estate activities',
    'Transportation and storage',
    'Wholesale and retail trade',
    'Other',
];

const workTypes = ['Salaried-General', 'Self-Employed', 'Business Owner', 'Retired', 'Student', 'Homemaker', 'Unemployed', 'Freelancer'];

const wealthSources = ['Salary', 'Business', 'Investments', 'Inheritance', 'Saving', 'Other'];

// Company KYC interface
interface CompanyFormData {
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    dateOfIncorporation: string;
    countryOfOperations: string;
    countryOfDomicile: string;
    nationalIdNumber: string;
    expiryDate: string;
    industry: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    isdCode: string;
    phoneNumber: string;
    email: string;
    products: string[];
    branch: string;
    tradeLicense: File | null;
    memorandumOfAssociation: File | null;
    articlesOfAssociation: File | null;
    certificateOfIncorporation: File | null;
}

const KYCForm = () => {
    const navigate = useNavigate();
    const [accountType, setAccountType] = useState<'B2B' | 'B2C' | ''>('');
    const [showAdditionalFields, setShowAdditionalFields] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showPEPSection, setShowPEPSection] = useState(false);
    // B2C Individual Form Data
    const [formData, setFormData] = useState<FormData>({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        bankAccountNumber: '',
        dateOfBirth: '',
        nationality: '',
        residence: '',
        sourceOfIncome: '',
        idNumber: '',
        branch: '',
        type: '',
        image: null,
        document: null,
        // Additional Idenfo fields
        gender: '',
        passportNumber: '',
        passportExpiryDate: '',
        idExpiryDate: '',
        workType: '',
        industry: '',
        companyName: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        isdCode: '+1',
        // PEP Information
        anyPublicPos: 'No',
        posLastTwoMonths: 'No',
        everPublicPosition: 'No',
        diplomaticImmunity: 'No',
        relativeTwelveMonths: 'No',
        closeAssociateTwelveMonths: 'No',
        conviction: 'No',
        other: '',
        sourceOfWealth: [],
        sourceOfWealthOther: '',
        sourceOfFunds: [],
        sourceOfFundsOther: '',
        products: [],
    });

    // B2B Company Form Data
    const [companyData, setCompanyData] = useState<CompanyFormData>({
        companyName: '',
        companyEmail: '',
        companyPhone: '',
        dateOfIncorporation: '',
        countryOfOperations: '',
        countryOfDomicile: '',
        nationalIdNumber: '',
        expiryDate: '',
        industry: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        isdCode: '+1',
        phoneNumber: '',
        email: '',
        products: [],
        branch: '',
        tradeLicense: null,
        memorandumOfAssociation: null,
        articlesOfAssociation: null,
        certificateOfIncorporation: null,
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
        if (isActive === 'approved' || isActive === 'registered') {
            navigate('/'); // Uncomment when using React Router
        }
    }, [customer?.kycStatus, navigate]);

    console.log('Customer:', customer);

    const fetchBranches = async () => {
        try {
            await axios.get(`${backendUrl}/api/user/branches`).then((response) => {
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
        if (accountType === 'B2C') {
            setFormData((prev) => ({ ...prev, [name]: value }));
        } else if (accountType === 'B2B') {
            setCompanyData((prev) => ({ ...prev, [name]: value }));
        }
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleCompanyFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof CompanyFormData) => {
        const file = e.target.files?.[0] || null;
        setCompanyData((prev) => ({ ...prev, [fieldName]: file }));
        if (errors[fieldName]) {
            setErrors((prev) => ({ ...prev, [fieldName]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'image' | 'document') => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({ ...prev, [fieldName]: file }));
        if (errors[fieldName]) {
            setErrors((prev) => ({ ...prev, [fieldName]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!accountType) {
            newErrors.accountType = 'Please select account type (B2B or B2C)';
            setErrors(newErrors);
            return false;
        }

        if (accountType === 'B2C') {
            // B2C Individual validation
            if (!formData.bankAccountNumber?.trim()) newErrors.bankAccountNumber = 'Bank account number is required';
            if (!formData.dateOfBirth?.trim()) newErrors.dateOfBirth = 'Date of birth is required';
            if (!formData.nationality?.trim()) newErrors.nationality = 'Nationality is required';
            if (!formData.residence?.trim()) newErrors.residence = 'Residence is required';
            if (!formData.sourceOfIncome?.trim()) newErrors.sourceOfIncome = 'Source of income is required';
            if (!formData.idNumber?.trim()) newErrors.idNumber = 'ID number is required';
            if (!formData.branch?.trim()) newErrors.branch = 'Branch is required';
            if (!formData.gender) newErrors.gender = 'Gender is required';
            if (!formData.idExpiryDate) newErrors.idExpiryDate = 'ID expiry date is required';
            if (!formData.workType) newErrors.workType = 'Work type is required';
            if (!formData.address?.trim()) newErrors.address = 'Address is required';
            if (!formData.city?.trim()) newErrors.city = 'City is required';
            if (!formData.postalCode?.trim()) newErrors.postalCode = 'Postal code is required';
        } else if (accountType === 'B2B') {
            // B2B Company validation
            if (!companyData.companyName?.trim()) newErrors.companyName = 'Company name is required';
            if (!companyData.companyEmail?.trim()) newErrors.companyEmail = 'Company email is required';
            if (!companyData.companyPhone?.trim()) newErrors.companyPhone = 'Company phone is required';
            if (!companyData.nationalIdNumber?.trim()) newErrors.nationalIdNumber = 'Registration number is required';
            if (!companyData.dateOfIncorporation) newErrors.dateOfIncorporation = 'Date of incorporation is required';
            if (!companyData.countryOfOperations) newErrors.countryOfOperations = 'Country of operations is required';
            if (!companyData.countryOfDomicile) newErrors.countryOfDomicile = 'Country of domicile is required';
            if (!companyData.industry) newErrors.industry = 'Industry is required';
            if (!companyData.address?.trim()) newErrors.address = 'Address is required';
            if (!companyData.city?.trim()) newErrors.city = 'City is required';
            if (!companyData.postalCode?.trim()) newErrors.postalCode = 'Postal code is required';
            if (!companyData.branch?.trim()) newErrors.branch = 'Branch is required';
        }

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

            // Append additional Idenfo fields if provided
            if (formData.gender) submitData.append('gender', formData.gender);
            if (formData.passportNumber) submitData.append('passportNumber', formData.passportNumber);
            if (formData.passportExpiryDate) submitData.append('passportExpiryDate', formData.passportExpiryDate);
            if (formData.idExpiryDate) submitData.append('idExpiryDate', formData.idExpiryDate);
            if (formData.workType) submitData.append('workType', formData.workType);
            if (formData.industry) submitData.append('industry', formData.industry);
            if (formData.companyName) submitData.append('companyName', formData.companyName);
            if (formData.address) submitData.append('address', formData.address);
            if (formData.city) submitData.append('city', formData.city);
            if (formData.state) submitData.append('state', formData.state);
            if (formData.postalCode) submitData.append('postalCode', formData.postalCode);
            if (formData.isdCode) submitData.append('isdCode', formData.isdCode);

            // PEP Information
            if (formData.anyPublicPos) submitData.append('anyPublicPos', formData.anyPublicPos);
            if (formData.posLastTwoMonths) submitData.append('posLastTwoMonths', formData.posLastTwoMonths);
            if (formData.everPublicPosition) submitData.append('everPublicPosition', formData.everPublicPosition);
            if (formData.diplomaticImmunity) submitData.append('diplomaticImmunity', formData.diplomaticImmunity);
            if (formData.relativeTwelveMonths) submitData.append('relativeTwelveMonths', formData.relativeTwelveMonths);
            if (formData.closeAssociateTwelveMonths) submitData.append('closeAssociateTwelveMonths', formData.closeAssociateTwelveMonths);
            if (formData.conviction) submitData.append('conviction', formData.conviction);
            if (formData.other) submitData.append('other', formData.other);

            // Source of Wealth/Funds
            if (formData.sourceOfWealth && formData.sourceOfWealth.length > 0) {
                submitData.append(
                    'sourceOfWealth',
                    JSON.stringify({
                        evidenced: formData.sourceOfWealth,
                        OtherEvidenced: formData.sourceOfWealthOther || '',
                    })
                );
            }
            if (formData.sourceOfFunds && formData.sourceOfFunds.length > 0) {
                submitData.append(
                    'sourceOfFunds',
                    JSON.stringify({
                        evidenced: formData.sourceOfFunds,
                        OtherEvidenced: formData.sourceOfFundsOther || '',
                    })
                );
            }
            if (formData.products && formData.products.length > 0) {
                submitData.append('products', JSON.stringify(formData.products));
            }

            // Append files
            if (formData.image) {
                submitData.append('image', formData.image);
            }
            if (formData.document) {
                submitData.append('document', formData.document);
            }

            // Make API call based on account type
            const endpoint = accountType === 'B2B' ? '/api/user/company-kyc' : '/api/user/kyc';
            const response = await fetch(`${backendUrl}${endpoint}`, {
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
                document: null,
            });

            // Reset file inputs
            const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
            fileInputs.forEach((input) => {
                input.value = '';
            });
        } catch (error: any) {
            console.error('KYC submission error:', error);
            setErrors({
                submit: error.message || 'Failed to submit KYC form. Please try again.',
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
                            <p className="text-gray-300">Thank you for submitting your KYC information. Our team will review your application and contact you soon.</p>
                            <button
                                onClick={() => navigate('/')}
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

                <div className="space-y-8 text-white">
                    {/* Account Type Selection */}
                    <div className="rounded-lg bg-white/5 p-6 border border-white/10">
                        <h2 className="mb-6 text-xl font-semibold text-white">Select Account Type</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setAccountType('B2C')}
                                className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                                    accountType === 'B2C' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                                }`}
                            >
                                <div className="text-center">
                                    <div className="text-3xl mb-2">👤</div>
                                    <h3 className="text-lg font-semibold mb-2">B2C - Individual</h3>
                                    <p className="text-sm opacity-80">Personal account for individual customers</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setAccountType('B2B')}
                                className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                                    accountType === 'B2B' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                                }`}
                            >
                                <div className="text-center">
                                    <div className="text-3xl mb-2">🏢</div>
                                    <h3 className="text-lg font-semibold mb-2">B2B - Company</h3>
                                    <p className="text-sm opacity-80">Business account for companies</p>
                                </div>
                            </button>
                        </div>
                        {errors.accountType && <p className="mt-4 text-sm text-red-400 text-center">{errors.accountType}</p>}
                    </div>

                    {/* Show form based on account type selection */}
                    {accountType === 'B2C' && (
                        <>
                            {/* Personal Information Section for B2C */}
                            <div className="rounded-lg bg-white/5 p-6 border border-white/10">
                                <h2 className="mb-6 text-xl font-semibold text-white">Personal Information</h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="customerName" className="mb-2 block text-sm font-medium">
                                            Full Name *
                                        </label>
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
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                                        </div>
                                        {errors.customerName && <p className="mt-1 text-sm text-red-400">{errors.customerName}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="customerEmail" className="mb-2 block text-sm font-medium">
                                            Email Address *
                                        </label>
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
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                                        </div>
                                        {errors.customerEmail && <p className="mt-1 text-sm text-red-400">{errors.customerEmail}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="customerPhone" className="mb-2 block text-sm font-medium">
                                            Contact Number *
                                        </label>
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
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📞</span>
                                        </div>
                                        {errors.customerPhone && <p className="mt-1 text-sm text-red-400">{errors.customerPhone}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="dateOfBirth" className="mb-2 block text-sm font-medium">
                                            Date of Birth *
                                        </label>
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
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                                        </div>
                                        {errors.dateOfBirth && <p className="mt-1 text-sm text-red-400">{errors.dateOfBirth}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="nationality" className="mb-2 block text-sm font-medium">
                                            Nationality *
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="nationality"
                                                name="nationality"
                                                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                                value={formData.nationality}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="" className="bg-gray-800">
                                                    Select nationality
                                                </option>
                                                {countries.map((country) => (
                                                    <option key={country} value={country} className="bg-gray-800">
                                                        {country}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🌍</span>
                                        </div>
                                        {errors.nationality && <p className="mt-1 text-sm text-red-400">{errors.nationality}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="residence" className="mb-2 block text-sm font-medium">
                                            Country of Residence *
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="residence"
                                                name="residence"
                                                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                                value={formData.residence}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="" className="bg-gray-800">
                                                    Select country
                                                </option>
                                                {countries.map((country) => (
                                                    <option key={country} value={country} className="bg-gray-800">
                                                        {country}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🏠</span>
                                        </div>
                                        {errors.residence && <p className="mt-1 text-sm text-red-400">{errors.residence}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="gender" className="mb-2 block text-sm font-medium">
                                            Gender *
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="gender"
                                                name="gender"
                                                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="" className="bg-gray-800">
                                                    Select gender
                                                </option>
                                                <option value="Male" className="bg-gray-800">
                                                    Male
                                                </option>
                                                <option value="Female" className="bg-gray-800">
                                                    Female
                                                </option>
                                            </select>
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                                        </div>
                                        {errors.gender && <p className="mt-1 text-sm text-red-400">{errors.gender}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Financial Information Section */}
                            <div className="rounded-lg bg-white/5 p-6 border border-white/10">
                                <h2 className="mb-6 text-xl font-semibold text-white">Financial Information</h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="bankAccountNumber" className="mb-2 block text-sm font-medium">
                                            Bank Account Number *
                                        </label>
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
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">💳</span>
                                        </div>
                                        {errors.bankAccountNumber && <p className="mt-1 text-sm text-red-400">{errors.bankAccountNumber}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="branch" className="mb-2 block text-sm font-medium">
                                            Branch *
                                        </label>
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
                                                    Select your branch
                                                </option>
                                                {branches.map((branch) => (
                                                    <option key={branch._id} value={branch._id} className="text-white bg-gray-800">
                                                        {branch.branchName}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🏛️</span>
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
                                        </div>
                                        {errors.branch && <p className="mt-1 text-sm text-red-400">{errors.branch}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="sourceOfIncome" className="mb-2 block text-sm font-medium">
                                            Source of Income *
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="sourceOfIncome"
                                                name="sourceOfIncome"
                                                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                                value={formData.sourceOfIncome}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="" className="bg-gray-800">
                                                    Select source of income
                                                </option>
                                                <option value="Employment" className="bg-gray-800">
                                                    Employment
                                                </option>
                                                <option value="Business" className="bg-gray-800">
                                                    Business
                                                </option>
                                                <option value="Investment" className="bg-gray-800">
                                                    Investment
                                                </option>
                                                <option value="Pension" className="bg-gray-800">
                                                    Pension
                                                </option>
                                                <option value="Other" className="bg-gray-800">
                                                    Other
                                                </option>
                                            </select>
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">💰</span>
                                        </div>
                                        {errors.sourceOfIncome && <p className="mt-1 text-sm text-red-400">{errors.sourceOfIncome}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Employment Information Section */}
                            <div className="rounded-lg bg-white/5 p-6 border border-white/10">
                                <h2 className="mb-6 text-xl font-semibold text-white">Employment Information</h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="workType" className="mb-2 block text-sm font-medium">
                                            Work Type *
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="workType"
                                                name="workType"
                                                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                                value={formData.workType}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="" className="bg-gray-800">
                                                    Select work type
                                                </option>
                                                {workTypes.map((type) => (
                                                    <option key={type} value={type} className="bg-gray-800">
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">💼</span>
                                        </div>
                                        {errors.workType && <p className="mt-1 text-sm text-red-400">{errors.workType}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="industry" className="mb-2 block text-sm font-medium">
                                            Industry
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="industry"
                                                name="industry"
                                                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                                value={formData.industry}
                                                onChange={handleInputChange}
                                            >
                                                <option value="" className="bg-gray-800">
                                                    Select industry
                                                </option>
                                                {industries.map((ind) => (
                                                    <option key={ind} value={ind} className="bg-gray-800">
                                                        {ind}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🏭</span>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="companyName" className="mb-2 block text-sm font-medium">
                                            Company Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="companyName"
                                                name="companyName"
                                                type="text"
                                                placeholder="Enter your company name"
                                                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                                value={formData.companyName}
                                                onChange={handleInputChange}
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🏢</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Information Section */}
                            <div className="rounded-lg bg-white/5 p-6 border border-white/10">
                                <h2 className="mb-6 text-xl font-semibold text-white">Address Information</h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label htmlFor="address" className="mb-2 block text-sm font-medium">
                                            Street Address *
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="address"
                                                name="address"
                                                type="text"
                                                placeholder="Enter your street address"
                                                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                                        </div>
                                        {errors.address && <p className="mt-1 text-sm text-red-400">{errors.address}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="city" className="mb-2 block text-sm font-medium">
                                            City *
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="city"
                                                name="city"
                                                type="text"
                                                placeholder="Enter your city"
                                                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🏙️</span>
                                        </div>
                                        {errors.city && <p className="mt-1 text-sm text-red-400">{errors.city}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="state" className="mb-2 block text-sm font-medium">
                                            State/Province
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="state"
                                                name="state"
                                                type="text"
                                                placeholder="Enter your state/province"
                                                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🏛️</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="postalCode" className="mb-2 block text-sm font-medium">
                                            Postal Code *
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="postalCode"
                                                name="postalCode"
                                                type="text"
                                                placeholder="Enter postal code"
                                                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                                value={formData.postalCode}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📮</span>
                                        </div>
                                        {errors.postalCode && <p className="mt-1 text-sm text-red-400">{errors.postalCode}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="isdCode" className="mb-2 block text-sm font-medium">
                                            Country Code
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="isdCode"
                                                name="isdCode"
                                                type="text"
                                                placeholder="+1"
                                                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                                value={formData.isdCode}
                                                onChange={handleInputChange}
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📞</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PEP Information Section */}
                            <div className="rounded-lg bg-white/5 p-6 border border-white/10">
                                <h2 className="mb-6 text-xl font-semibold text-white">Politically Exposed Person (PEP) Information</h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="anyPublicPos" className="mb-2 block text-sm font-medium">
                                            Do you hold any public position?
                                        </label>
                                        <select
                                            id="anyPublicPos"
                                            name="anyPublicPos"
                                            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                            value={formData.anyPublicPos}
                                            onChange={handleInputChange}
                                        >
                                            <option value="No" className="bg-gray-800">
                                                No
                                            </option>
                                            <option value="Yes" className="bg-gray-800">
                                                Yes
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="posLastTwoMonths" className="mb-2 block text-sm font-medium">
                                            Position in last 2 months?
                                        </label>
                                        <select
                                            id="posLastTwoMonths"
                                            name="posLastTwoMonths"
                                            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                            value={formData.posLastTwoMonths}
                                            onChange={handleInputChange}
                                        >
                                            <option value="No" className="bg-gray-800">
                                                No
                                            </option>
                                            <option value="Yes" className="bg-gray-800">
                                                Yes
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="everPublicPosition" className="mb-2 block text-sm font-medium">
                                            Ever held public position?
                                        </label>
                                        <select
                                            id="everPublicPosition"
                                            name="everPublicPosition"
                                            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                            value={formData.everPublicPosition}
                                            onChange={handleInputChange}
                                        >
                                            <option value="No" className="bg-gray-800">
                                                No
                                            </option>
                                            <option value="Yes" className="bg-gray-800">
                                                Yes
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="diplomaticImmunity" className="mb-2 block text-sm font-medium">
                                            Diplomatic immunity?
                                        </label>
                                        <select
                                            id="diplomaticImmunity"
                                            name="diplomaticImmunity"
                                            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                            value={formData.diplomaticImmunity}
                                            onChange={handleInputChange}
                                        >
                                            <option value="No" className="bg-gray-800">
                                                No
                                            </option>
                                            <option value="Yes" className="bg-gray-800">
                                                Yes
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="relativeTwelveMonths" className="mb-2 block text-sm font-medium">
                                            Relative in position (12 months)?
                                        </label>
                                        <select
                                            id="relativeTwelveMonths"
                                            name="relativeTwelveMonths"
                                            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                            value={formData.relativeTwelveMonths}
                                            onChange={handleInputChange}
                                        >
                                            <option value="No" className="bg-gray-800">
                                                No
                                            </option>
                                            <option value="Yes" className="bg-gray-800">
                                                Yes
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="closeAssociateTwelveMonths" className="mb-2 block text-sm font-medium">
                                            Close associate (12 months)?
                                        </label>
                                        <select
                                            id="closeAssociateTwelveMonths"
                                            name="closeAssociateTwelveMonths"
                                            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                            value={formData.closeAssociateTwelveMonths}
                                            onChange={handleInputChange}
                                        >
                                            <option value="No" className="bg-gray-800">
                                                No
                                            </option>
                                            <option value="Yes" className="bg-gray-800">
                                                Yes
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="conviction" className="mb-2 block text-sm font-medium">
                                            Any convictions?
                                        </label>
                                        <select
                                            id="conviction"
                                            name="conviction"
                                            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                            value={formData.conviction}
                                            onChange={handleInputChange}
                                        >
                                            <option value="No" className="bg-gray-800">
                                                No
                                            </option>
                                            <option value="Yes" className="bg-gray-800">
                                                Yes
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="other" className="mb-2 block text-sm font-medium">
                                            Other Information
                                        </label>
                                        <input
                                            id="other"
                                            name="other"
                                            type="text"
                                            placeholder="Additional information (if any)"
                                            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                            value={formData.other}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Identity Information Section */}
                            <div className="rounded-lg bg-white/5 p-6 border border-white/10">
                                <h2 className="mb-6 text-xl font-semibold text-white">Identity Information</h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="idNumber" className="mb-2 block text-sm font-medium">
                                            National ID Number *
                                        </label>
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
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🆔</span>
                                        </div>
                                        {errors.idNumber && <p className="mt-1 text-sm text-red-400">{errors.idNumber}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="idExpiryDate" className="mb-2 block text-sm font-medium">
                                            ID Expiry Date *
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="idExpiryDate"
                                                name="idExpiryDate"
                                                type="date"
                                                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                                value={formData.idExpiryDate}
                                                onChange={handleInputChange}
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                                        </div>
                                        {errors.idExpiryDate && <p className="mt-1 text-sm text-red-400">{errors.idExpiryDate}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="passportNumber" className="mb-2 block text-sm font-medium">
                                            Passport Number (Optional)
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="passportNumber"
                                                name="passportNumber"
                                                type="text"
                                                placeholder="Enter passport number"
                                                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                                value={formData.passportNumber}
                                                onChange={handleInputChange}
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📔</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="passportExpiryDate" className="mb-2 block text-sm font-medium">
                                            Passport Expiry Date
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="passportExpiryDate"
                                                name="passportExpiryDate"
                                                type="date"
                                                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 pl-10 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                                value={formData.passportExpiryDate}
                                                onChange={handleInputChange}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="image" className="mb-2 block text-sm font-medium">
                                            Front side*
                                        </label>
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
                                        <label htmlFor="document" className="mb-2 block text-sm font-medium">
                                            Back side *
                                        </label>
                                        <input
                                            id="document"
                                            name="document"
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={(e) => handleFileChange(e, 'document')}
                                            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white file:mr-4 file:rounded file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white file:hover:bg-blue-700"
                                            required
                                        />
                                        {errors.document && <p className="mt-1 text-sm text-red-400">{errors.document}</p>}
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
                        </>
                    )}

                    {accountType === 'B2B' && (
                        <div className="text-center py-8">
                            <h2 className="text-2xl font-semibold text-white mb-4">B2B Account Setup</h2>
                            <p className="text-gray-300">B2B form is coming soon. Please select B2C for now or contact support.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KYCForm;
