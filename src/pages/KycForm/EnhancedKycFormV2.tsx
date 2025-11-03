import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Phone, CreditCard, Building, Calendar, Shield, AlertCircle, CheckCircle } from 'lucide-react';

// Lists for dropdowns
const countries = [
    'United Arab Emirates',
    'Afghanistan',
    'Antigua and Barbuda',
    'Anguilla',
    'Albania',
    'Armenia',
    'Angola',
    'Antarctica',
    'Argentina',
    'American Samoa',
    'Austria',
    'Australia',
    'Aruba',
    'Aland Islands',
    'Azerbaijan',
    'Bosnia and Herzegovina',
    'Barbados',
    'Bangladesh',
    'Belgium',
    'Burkina Faso',
    'Bulgaria',
    'Bahrain',
    'Burundi',
    'Benin',
    'Saint Barthelemy',
    'Bermuda',
    'Brunei Darussalam',
    'Bolivia',
    'Bonaire, Sint Eustatius and Saba',
    'Brazil',
    'Bahamas',
    'Bhutan',
    'Bouvet Island',
    'Botswana',
    'Belarus',
    'Belize',
    'Canada',
    'Cocos (Keeling) Islands',
    'Democratic Republic of the Congo',
    'Central African Republic',
    'Congo',
    'Switzerland',
    "Cote d'Ivoire",
    'Cook Islands',
    'Chile',
    'Cameroon',
    'China',
    'Colombia',
    'Costa Rica',
    'Cuba',
    'Cabo Verde',
    'Curacao',
    'Christmas Island',
    'Cyprus',
    'Czechia',
    'Germany',
    'Djibouti',
    'Denmark',
    'Dominica',
    'Dominican Republic',
    'Algeria',
    'Ecuador',
    'Estonia',
    'Egypt',
    'Western Sahara',
    'Eritrea',
    'Spain',
    'Ethiopia',
    'Finland',
    'Fiji',
    'Falkland Islands',
    'Micronesia',
    'Faroe Islands',
    'France',
    'Gabon',
    'United Kingdom',
    'Grenada',
    'Georgia',
    'French Guiana',
    'Guernsey',
    'Ghana',
    'Gibraltar',
    'Greenland',
    'Gambia',
    'Guinea',
    'Guadeloupe',
    'Equatorial Guinea',
    'Greece',
    'South Georgia and the South Sandwich Islands',
    'Guatemala',
    'Guam',
    'Guinea-Bissau',
    'Guyana',
    'Hong Kong',
    'Heard Island and McDonald Islands',
    'Honduras',
    'Croatia',
    'Haiti',
    'Hungary',
    'Indonesia',
    'Ireland',
    'Israel',
    'Isle of Man',
    'India',
    'British Indian Ocean Territory',
    'Iraq',
    'Iran',
    'Iceland',
    'Italy',
    'Jersey',
    'Jamaica',
    'Jordan',
    'Japan',
    'Kenya',
    'Kyrgyzstan',
    'Cambodia',
    'Kiribati',
    'Comoros',
    'Saint Kitts and Nevis',
    "Korea (Democratic People's Republic of)",
    'Korea (Republic of)',
    'Kuwait',
    'Cayman Islands',
    'Kazakhstan',
    "Lao People's Democratic Republic",
    'Lebanon',
    'Saint Lucia',
    'Liechtenstein',
    'Kosovo',
    'Sri Lanka',
    'Liberia',
    'Lesotho',
    'Lithuania',
    'Luxembourg',
    'Latvia',
    'Libya',
    'Morocco',
    'Monaco',
    'Moldova',
    'Montenegro',
    'Saint Martin (French part)',
    'Madagascar',
    'Marshall Islands',
    'Macedonia (the former Yugoslav Republic of)',
    'Mali',
    'Myanmar',
    'Mongolia',
    'Macao',
    'Northern Mariana Islands',
    'Martinique',
    'Mauritania',
    'Montserrat',
    'Malta',
    'Mauritius',
    'Maldives',
    'Malawi',
    'Mexico',
    'Malaysia',
    'Mozambique',
    'Namibia',
    'New Caledonia',
    'Niger',
    'Norfolk Island',
    'Nigeria',
    'Nicaragua',
    'Netherlands',
    'Norway',
    'Nepal',
    'Nauru',
    'Niue',
    'New Zealand',
    'Oman',
    'Panama',
    'Peru',
    'French Polynesia',
    'Papua New Guinea',
    'Philippines',
    'Pakistan',
    'Poland',
    'Saint Pierre and Miquelon',
    'Pitcairn',
    'Puerto Rico',
    'Palestine, State of',
    'Portugal',
    'Palau',
    'Paraguay',
    'Qatar',
    'Reunion',
    'Romania',
    'Serbia',
    'Russian Federation',
    'Rwanda',
    'Saudi Arabia',
    'Solomon Islands',
    'Seychelles',
    'Sudan',
    'Sweden',
    'Singapore',
    'Saint Helena, Ascension and Tristan da Cunha',
    'Slovenia',
    'Svalbard and Jan Mayen',
    'Slovakia',
    'Sierra Leone',
    'San Marino',
    'Senegal',
    'Somalia',
    'Suriname',
    'South Sudan',
    'Sao Tome and Principe',
    'El Salvador',
    'Sint Maarten (Dutch part)',
    'Syrian Arab Republic',
    'Swaziland',
    'Turks and Caicos Islands',
    'Chad',
    'French Southern Territories',
    'Togo',
    'Thailand',
    'Tajikistan',
    'Tokelau',
    'Timor-Leste',
    'Turkmenistan',
    'Tunisia',
    'Tonga',
    'Turkey',
    'Trinidad and Tobago',
    'Tuvalu',
    'Taiwan',
    'Tanzania, United Republic of',
    'Ukraine',
    'Uganda',
    'United States Minor Outlying Islands',
    'United States of America',
    'Uruguay',
    'Uzbekistan',
    'Holy See',
    'Saint Vincent and the Grenadines',
    'Venezuela',
    'Virgin Islands (British)',
    'Virgin Islands (U.S.)',
    'Viet Nam',
    'Vanuatu',
    'Wallis and Futuna',
    'Samoa',
    'Yemen',
    'Mayotte',
    'South Africa',
    'Zambia',
    'Zimbabwe',
];

const industries = [
    'Agriculture, forestry and fishing',
    'Precious Stones or Metals',
    'Manufacturing',
    'Electricity, gas, steam and air conditioning supply',
    'Water supply; sewerage, waste management',
    'Construction',
    'Wholesale and retail trade; repair of motor vehicles',
    'Shipping, Aviation or Freight forwarding companies',
    'Accommodation and food service activities',
    'Information and communication',
    'Financial and insurance activities',
    'Real estate activities',
    'Professional, scientific and technical activities',
    'Administrative and support service activities',
    'Public administration and defence; compulsory social security',
    'Education',
    'Human health and social work activities',
    'Arts, entertainment and recreation',
    'Other service activities',
    'Activities of households as employers',
    'Activities of extraterritorial organizations and bodies',
    'Money Value or Transfer Houses',
    'Company Formation Services',
    'Law Firm',
    'Independent accountants or auditors',
];

const workTypes = ['Company Shareholders','Retired', 'Authorised Persons', 'Company Directors', 'Company Executive Management', 'Company Ultimate Beneficial Owner'];

const EnhancedKycFormV2: React.FC = () => {
    const navigate = useNavigate();
    const [accountType, setAccountType] = useState<'B2B' | 'B2C' | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [branches, setBranches] = useState<any[]>([]);
    const [customer, setCustomer] = useState<any>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const backendUrl = import.meta.env.VITE_API_URL;
    const iscustomer = JSON.parse(localStorage.getItem('customer') || '{}');
    const customerId = iscustomer.id || iscustomer._id;

    // B2C Individual Form Data
    const [individualData, setIndividualData] = useState({
        // Basic Info
        customerName: '',
        customerEmail: '',
        customerContact: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        residence: '',

        // Identity
        idNumber: '',
        idExpiryDate: '',
        passportNumber: '',
        passportExpiryDate: '',

        // Financial
        bankAccountNumber: '',
        sourceOfIncome: '',
        sourceOfWealth: '',
        sourceOfFunds: '',
        workType: '',
        industry: '',
        companyName: '',
        products: '',

        // Address
        address: '',
        city: '',
        state: '',
        postalCode: '',
        isdCode: '+1',

        // PEP
        anyPublicPos: 'No',
        posLastTwoMonths: 'No',
        everPublicPosition: 'No',
        diplomaticImmunity: 'No',
        relativeTwelveMonths: 'No',
        closeAssociateTwelveMonths: 'No',
        conviction: 'No',
        other: '',

        // Branch
        branch: '',

        // Files
        image: null as File | null,
        document: null as File | null,
    });

    // B2B Company Form Data
    const [companyData, setCompanyData] = useState({
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
        branch: '',

        // Files
        tradeLicense: null as File | null,
        certificateOfIncorporation: null as File | null,
    });

    useEffect(() => {
        fetchCustomerById();
        fetchBranches();
    }, []);

    const fetchCustomerById = async () => {
        if (!customerId) return;
        try {
            const res = await axios.get(`${backendUrl}/api/user/customers/${customerId}`);
            setCustomer(res.data);
            // Pre-fill data
            setIndividualData((prev) => ({
                ...prev,
                customerName: res.data.customerName || '',
                customerEmail: res.data.customerEmail || '',
                customerContact: res.data.customerPhone || '',
            }));
        } catch (err) {
            console.error('Error fetching customer:', err);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/user/branches`);
            setBranches(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const handleIndividualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setIndividualData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCompanyData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, type: 'individual' | 'company') => {
        const file = e.target.files?.[0] || null;
        if (type === 'individual') {
            setIndividualData((prev) => ({ ...prev, [fieldName]: file }));
        } else {
            setCompanyData((prev) => ({ ...prev, [fieldName]: file }));
        }
        if (errors[fieldName]) {
            setErrors((prev) => ({ ...prev, [fieldName]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!accountType) {
            newErrors.accountType = 'Please select account type';
            setErrors(newErrors);
            return false;
        }

        if (accountType === 'B2C') {
            // B2C validation
            if (!individualData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
            if (!individualData.nationality) newErrors.nationality = 'Nationality is required';
            if (!individualData.residence) newErrors.residence = 'Residence is required';
            if (!individualData.idNumber) newErrors.idNumber = 'ID number is required';
            if (!individualData.idExpiryDate) newErrors.idExpiryDate = 'ID expiry date is required';
            if (!individualData.passportNumber) newErrors.passportNumber = 'Passport number is required';
            if (!individualData.passportExpiryDate) newErrors.passportExpiryDate = 'Passport expiry date is required';
            if (!individualData.workType) newErrors.workType = 'Work type is required';
            if (!individualData.industry) newErrors.industry = 'Industry is required';
            if (!individualData.branch) newErrors.branch = 'Branch is required';
            if (!individualData.companyName) newErrors.companyName = 'Company name is required';
    
        } else {
            // B2B validation
            if (!companyData.companyName) newErrors.companyName = 'Company name is required';
            if (!companyData.companyEmail) newErrors.companyEmail = 'Company email is required';
            if (!companyData.companyPhone) newErrors.companyPhone = 'Company phone is required';
            if (!companyData.nationalIdNumber) newErrors.nationalIdNumber = 'Registration number is required';
            if (!companyData.dateOfIncorporation) newErrors.dateOfIncorporation = 'Incorporation date is required';
            if (!companyData.countryOfOperations) newErrors.countryOfOperations = 'Country of operations is required';
            if (!companyData.countryOfDomicile) newErrors.countryOfDomicile = 'Country of domicile is required';
            if (!companyData.industry) newErrors.industry = 'Industry is required';
            if (!companyData.branch) newErrors.branch = 'Branch is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submit button clicked');
        console.log('Account Type:', accountType);
        console.log('Individual Data:', individualData);
        console.log('Company Data:', companyData);

        if (!validateForm()) {
            console.log('Validation failed', errors);
            return;
        }

        setIsSubmitting(true);
        console.log('Submitting form...');

        try {
            const formData = new FormData();

            if (accountType === 'B2C') {
                // B2C Individual submission
                formData.append('custId', customer?._id || customerId);
                formData.append('customerName', individualData.customerName);
                formData.append('customerEmail', individualData.customerEmail);
                formData.append('customerContact', individualData.customerContact);
                formData.append('dateOfBirth', individualData.dateOfBirth);
                formData.append('gender', individualData.gender);
                formData.append('nationality', individualData.nationality);
                formData.append('residence', individualData.residence);
                formData.append('idNumber', individualData.idNumber);
                formData.append('idExpiryDate', individualData.idExpiryDate);
                formData.append('passportNumber', individualData.passportNumber);
                formData.append('passportExpiryDate', individualData.passportExpiryDate);
                formData.append('workType', individualData.workType);
                formData.append('industry', individualData.industry || '');
                formData.append('companyName', individualData.companyName || '');
                formData.append('isdCode', individualData.isdCode);
                formData.append('branch', individualData.branch);
                formData.append('type', 'B2C');
                
                // Missing required fields with default values
                formData.append('bankAccountNumber', individualData.bankAccountNumber || '');
                formData.append('sourceOfIncome', individualData.sourceOfIncome || '');
                formData.append('address', individualData.address || '');
                formData.append('city', individualData.city || '');
                formData.append('state', individualData.state || '');
                formData.append('postalCode', individualData.postalCode || '');
                formData.append('sourceOfWealth', individualData.sourceOfWealth || '');
                formData.append('sourceOfFunds', individualData.sourceOfFunds || '');
                formData.append('products', individualData.products || '');

                // PEP Info
                formData.append('anyPublicPos', individualData.anyPublicPos);
                formData.append('posLastTwoMonths', individualData.posLastTwoMonths);
                formData.append('everPublicPosition', individualData.everPublicPosition);
                formData.append('diplomaticImmunity', individualData.diplomaticImmunity);
                formData.append('relativeTwelveMonths', individualData.relativeTwelveMonths);
                formData.append('closeAssociateTwelveMonths', individualData.closeAssociateTwelveMonths);
                formData.append('conviction', individualData.conviction);
                formData.append('other', individualData.other);

                // Files
                if (individualData.image) formData.append('image', individualData.image);
                if (individualData.document) formData.append('document', individualData.document);

                // Debug: Log what we're sending
                console.log('Sending B2C KYC data to:', `${backendUrl}/api/user/kyc`);
                console.log('FormData entries:');
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }

                const response = await axios.post(`${backendUrl}/api/user/kyc`, formData);
                console.log('✅ KYC Submission successful!', response.data);
            } else {
                // B2B Company submission
                formData.append('companyName', companyData.companyName);
                formData.append('companyEmail', companyData.companyEmail);
                formData.append('companyPhone', companyData.companyPhone);
                formData.append('dateOfIncorporation', companyData.dateOfIncorporation);
                formData.append('countryOfOperations', companyData.countryOfOperations);
                formData.append('countryOfDomicile', companyData.countryOfDomicile);
                formData.append('nationalIdNumber', companyData.nationalIdNumber);
                formData.append('expiryDate', companyData.expiryDate);
                formData.append('industry', companyData.industry);
                formData.append('address', companyData.address);
                formData.append('city', companyData.city);
                formData.append('state', companyData.state);
                formData.append('postalCode', companyData.postalCode);
                formData.append('isdCode', companyData.isdCode);
                formData.append('branch', companyData.branch);
                formData.append('createdBy', customer?._id || customerId);

                // Files
                if (companyData.tradeLicense) formData.append('tradeLicense', companyData.tradeLicense);
                if (companyData.certificateOfIncorporation) formData.append('certificateOfIncorporation', companyData.certificateOfIncorporation);

                const response = await axios.post(`${backendUrl}/api/user/company-kyc`, formData);
                console.log('✅ Company KYC Submission successful!', response.data);
            }

            setSubmitSuccess(true);
        } catch (error: any) {
            console.error('Submission error:', error);
            console.error('Error response:', error.response);
            setErrors({ submit: error.response?.data?.message || error.message || 'Failed to submit KYC' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 max-w-md">
                    <div className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">KYC Submitted Successfully!</h2>
                        <p className="text-gray-300 mb-6">Your KYC application is under review.</p>
                        <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8">
                    <h1 className="text-3xl font-bold text-white text-center mb-8">KYC Verification</h1>

                    {/* Account Type Selection */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-white mb-4">Select Account Type</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setAccountType('B2C')}
                                className={`p-6 rounded-lg border-2 transition-all ${accountType === 'B2C' ? 'bg-blue-600/20 border-blue-500' : 'bg-white/5 border-white/20 hover:bg-white/10'}`}
                            >
                                <User className="w-8 h-8 text-white mx-auto mb-2" />
                                <h3 className="text-lg font-semibold text-white">B2C - Individual</h3>
                                <p className="text-sm text-gray-300">Personal account</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setAccountType('B2B')}
                                className={`p-6 rounded-lg border-2 transition-all ${accountType === 'B2B' ? 'bg-blue-600/20 border-blue-500' : 'bg-white/5 border-white/20 hover:bg-white/10'}`}
                            >
                                <Building className="w-8 h-8 text-white mx-auto mb-2" />
                                <h3 className="text-lg font-semibold text-white">B2B - Company</h3>
                                <p className="text-sm text-gray-300">Business account</p>
                            </button>
                        </div>
                        {errors.accountType && <p className="text-red-400 text-sm mt-2">{errors.accountType}</p>}
                    </div>

                    {/* B2C Individual Form */}
                    {accountType === 'B2C' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information */}
                            <div className="bg-white/5 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Date of Birth *</label>
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={individualData.dateOfBirth}
                                            onChange={handleIndividualChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.dateOfBirth && <p className="text-red-400 text-xs mt-1">{errors.dateOfBirth}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Nationality *</label>
                                        <select
                                            name="nationality"
                                            value={individualData.nationality}
                                            onChange={handleIndividualChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        >
                                            <option value="">Select</option>
                                            {countries.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.nationality && <p className="text-red-400 text-xs mt-1">{errors.nationality}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Residence *</label>
                                        <select
                                            name="residence"
                                            value={individualData.residence}
                                            onChange={handleIndividualChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        >
                                            <option value="">Select</option>
                                            {countries.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.residence && <p className="text-red-400 text-xs mt-1">{errors.residence}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Identity Documents */}
                            <div className="bg-white/5 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Identity Documents</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">National ID Number *</label>
                                        <input
                                            type="text"
                                            name="idNumber"
                                            value={individualData.idNumber}
                                            onChange={handleIndividualChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        />
                                        {errors.idNumber && <p className="text-red-400 text-xs mt-1">{errors.idNumber}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">ID Expiry Date *</label>
                                        <input
                                            type="date"
                                            name="idExpiryDate"
                                            value={individualData.idExpiryDate}
                                            onChange={handleIndividualChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.idExpiryDate && <p className="text-red-400 text-xs mt-1">{errors.idExpiryDate}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Passport Number</label>
                                        <input
                                            type="text"
                                            name="passportNumber"
                                            value={individualData.passportNumber}
                                            onChange={handleIndividualChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                            placeholder="Optional"
                                        />
                                        {errors.passportNumber && <p className="text-red-400 text-xs mt-1">{errors.passportNumber}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Passport Expiry</label>
                                        <input
                                            type="date"
                                            name="passportExpiryDate"
                                            value={individualData.passportExpiryDate}
                                            onChange={handleIndividualChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.passportExpiryDate && <p className="text-red-400 text-xs mt-1">{errors.passportExpiryDate}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Financial & Employment Information */}
                            <div className="bg-white/5 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Financial & Employment</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Work Type *</label>
                                        <select
                                            name="workType"
                                            value={individualData.workType}
                                            onChange={handleIndividualChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        >
                                            <option value="">Select</option>
                                            {workTypes.map((w) => (
                                                <option key={w} value={w}>
                                                    {
                                                        w
                                                            .replace(/([A-Z])/g, ' $1') // insert space before capital letters
                                                            .replace(/^./, (str) => str.toUpperCase()) // capitalize the first letter
                                                    }
                                                </option>
                                            ))}
                                        </select>
                                        {errors.workType && <p className="text-red-400 text-xs mt-1">{errors.workType}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Industry</label>
                                        <select
                                            name="industry"
                                            value={individualData.industry}
                                            onChange={handleIndividualChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        >
                                            <option value="">Select</option>
                                            {industries.map((i) => (
                                                <option key={i} value={i}>
                                                    {i}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.industry && <p className="text-red-400 text-xs mt-1">{errors.industry}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={individualData.companyName}
                                            onChange={handleIndividualChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                            placeholder="Optional"
                                        />
                                        {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Branch *</label>
                                        <select
                                            name="branch"
                                            value={individualData.branch}
                                            onChange={handleIndividualChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        >
                                            <option value="">Select Branch</option>
                                            {branches.map((b) => (
                                                <option key={b._id} value={b._id}>
                                                    {b.branchName}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.branch && <p className="text-red-400 text-xs mt-1">{errors.branch}</p>}
                                    </div>
                                </div>
                            </div>

                         

                            {/* Submit Button */}
                            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {isSubmitting ? 'Submitting...' : 'Submit KYC'}
                            </button>
                        </form>
                    )}

                    {/* B2B Company Form */}
                    {accountType === 'B2B' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Company Information */}
                            <div className="bg-white/5 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Company Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Company Name *</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={companyData.companyName}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        />
                                        {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Registration Number *</label>
                                        <input
                                            type="text"
                                            name="nationalIdNumber"
                                            value={companyData.nationalIdNumber}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        />
                                        {errors.nationalIdNumber && <p className="text-red-400 text-xs mt-1">{errors.nationalIdNumber}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Date of Incorporation *</label>
                                        <input
                                            type="date"
                                            name="dateOfIncorporation"
                                            value={companyData.dateOfIncorporation}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.dateOfIncorporation && <p className="text-red-400 text-xs mt-1">{errors.dateOfIncorporation}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Industry *</label>
                                        <select
                                            name="industry"
                                            value={companyData.industry}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        >
                                            <option value="">Select</option>
                                            {industries.map((i) => (
                                                <option key={i} value={i}>
                                                    {i}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.industry && <p className="text-red-400 text-xs mt-1">{errors.industry}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Country of Operations *</label>
                                        <select
                                            name="countryOfOperations"
                                            value={companyData.countryOfOperations}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        >
                                            <option value="">Select</option>
                                            {countries.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.countryOfOperations && <p className="text-red-400 text-xs mt-1">{errors.countryOfOperations}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Country of Domicile *</label>
                                        <select
                                            name="countryOfDomicile"
                                            value={companyData.countryOfDomicile}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        >
                                            <option value="">Select</option>
                                            {countries.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.countryOfDomicile && <p className="text-red-400 text-xs mt-1">{errors.countryOfDomicile}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Company Email *</label>
                                        <input
                                            type="email"
                                            name="companyEmail"
                                            value={companyData.companyEmail}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        />
                                        {errors.companyEmail && <p className="text-red-400 text-xs mt-1">{errors.companyEmail}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Company Phone *</label>
                                        <input
                                            type="tel"
                                            name="companyPhone"
                                            value={companyData.companyPhone}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        />
                                        {errors.companyPhone && <p className="text-red-400 text-xs mt-1">{errors.companyPhone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Branch *</label>
                                        <select
                                            name="branch"
                                            value={companyData.branch}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        >
                                            <option value="">Select Branch</option>
                                            {branches.map((b) => (
                                                <option key={b._id} value={b._id}>
                                                    {b.branchName}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.branch && <p className="text-red-400 text-xs mt-1">{errors.branch}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Company Address */}
                            <div className="bg-white/5 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Company Address</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-300 mb-1">Address *</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={companyData.address}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        />
                                        {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={companyData.city}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        />
                                        {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={companyData.state}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Postal Code *</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={companyData.postalCode}
                                            onChange={handleCompanyChange}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                        />
                                        {errors.postalCode && <p className="text-red-400 text-xs mt-1">{errors.postalCode}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {isSubmitting ? 'Submitting...' : 'Submit Company KYC'}
                            </button>
                        </form>
                    )}

                    {errors.submit && (
                        <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                            <p className="text-red-300">{errors.submit}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnhancedKycFormV2;
