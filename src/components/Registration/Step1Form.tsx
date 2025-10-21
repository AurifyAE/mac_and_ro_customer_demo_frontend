import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../../styles/phoneInput.css';
import { sortedCountries } from '../../data/countries';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

interface FormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  userName: string;
  country: string;
  customerPassword: string;
  confirmPassword: string;
}

interface Errors {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  userName?: string;
  country?: string;
  customerPassword?: string;
  confirmPassword?: string;
}

interface Step1FormProps {
  formData: FormData;
  errors: Errors;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  passwordStrength: number;
  checkEmailAvailability: (email: string) => void;
  checkUsernameAvailability: (username: string) => void;
  handleNext: () => void;
  handlePhoneChange?: (value: string, country: any) => void;
}

const Step1Form: React.FC<Step1FormProps> = ({ 
  formData, 
  errors, 
  handleInputChange, 
  showPassword, 
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordStrength,
  checkEmailAvailability,
  checkUsernameAvailability,
  handleNext,
  handlePhoneChange 
}) => {
  const [phoneError, setPhoneError] = useState<string>('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('ae');

  // Validate phone number when it changes
  const validatePhone = (value: string, country: any) => {
    if (!value) {
      setPhoneError('Phone number is required');
      return false;
    }
    
    try {
      const phoneWithPlus = value.startsWith('+') ? value : `+${value}`;
      const isValid = isValidPhoneNumber(phoneWithPlus);
      
      if (!isValid) {
        setPhoneError('Please enter a valid phone number');
        return false;
      }
      
      setPhoneError('');
      return true;
    } catch (error) {
      setPhoneError('Please enter a valid phone number');
      return false;
    }
  };

  const handlePhoneInputChange = (value: string, country: any) => {
    // Call the parent handler if provided
    if (handlePhoneChange) {
      handlePhoneChange(value, country);
    } else {
      // Fallback to using the regular input change handler
      const event = {
        target: {
          name: 'customerPhone',
          value: value,
          type: 'tel'
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(event);
    }
    
    // Validate the phone number
    validatePhone(value, country);
    setSelectedCountryCode(country.countryCode);
  };
  return (
    <div className="space-y-6">
      {/* Mobile Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Full Name - Full width on mobile */}
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all ${
              errors.customerName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
          />
          {errors.customerName && (
            <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
          )}
        </div>

        {/* Phone Number with International Input */}
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <PhoneInput
            country={selectedCountryCode}
            value={formData.customerPhone}
            onChange={handlePhoneInputChange}
            enableSearch={true}
            searchPlaceholder="Search countries..."
            containerClass="phone-input-container"
            inputClass={`!w-full !h-[42px] md:!h-[44px] !text-sm md:!text-base !border !rounded-lg !pl-12 focus:!ring-2 focus:!ring-[#D4AF37] focus:!border-transparent ${
              phoneError || errors.customerPhone ? '!border-red-500' : '!border-gray-300'
            }`}
            buttonClass="!border !border-r-0 !rounded-l-lg !bg-gray-50 hover:!bg-gray-100"
            dropdownClass="!max-h-60 !overflow-y-auto"
            searchClass="!px-3 !py-2 !text-sm"
            placeholder="Enter phone number"
            preferredCountries={['ae', 'us', 'gb', 'in', 'sa', 'qa', 'kw', 'om', 'bh', 'eg']}
            enableAreaCodes={false}
            countryCodeEditable={false}
            inputProps={{
              name: 'customerPhone',
              required: true,
              autoComplete: 'tel'
            }}
          />
          {(phoneError || errors.customerPhone) && (
            <p className="text-red-500 text-xs mt-1">{phoneError || errors.customerPhone}</p>
          )}
        </div>

        {/* Email Address */}
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleInputChange}
            onBlur={() => checkEmailAvailability(formData.customerEmail)}
            className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all ${
              errors.customerEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
            autoComplete="email"
          />
          {errors.customerEmail && (
            <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>
          )}
        </div>

        {/* Username */}
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            onBlur={() => checkUsernameAvailability(formData.userName)}
            className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all ${
              errors.userName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Choose a username"
            autoComplete="username"
          />
          {errors.userName && (
            <p className="text-red-500 text-xs mt-1">{errors.userName}</p>
          )}
        </div>

        {/* Country Selector with All Countries */}
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent bg-white transition-all ${
              errors.country ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Country</option>
            <optgroup label="Popular Countries">
              <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
              <option value="United States">🇺🇸 United States</option>
              <option value="United Kingdom">🇬🇧 United Kingdom</option>
              <option value="India">🇮🇳 India</option>
              <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
              <option value="Qatar">🇶🇦 Qatar</option>
              <option value="Kuwait">🇰🇼 Kuwait</option>
              <option value="Oman">🇴🇲 Oman</option>
              <option value="Bahrain">🇧🇭 Bahrain</option>
              <option value="Egypt">🇪🇬 Egypt</option>
            </optgroup>
            <optgroup label="All Countries">
              {sortedCountries.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.flag} {country.name}
                </option>
              ))}
            </optgroup>
          </select>
          {errors.country && (
            <p className="text-red-500 text-xs mt-1">{errors.country}</p>
          )}
        </div>

        {/* Password */}
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="customerPassword"
              value={formData.customerPassword}
              onChange={handleInputChange}
              className={`w-full px-3 md:px-4 py-2 md:py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all ${
                errors.customerPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Create a password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {formData.customerPassword && (
            <div className="mt-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i <= passwordStrength / 25 
                        ? passwordStrength <= 25 ? 'bg-red-500' 
                        : passwordStrength <= 50 ? 'bg-yellow-500'
                        : passwordStrength <= 75 ? 'bg-blue-500'
                        : 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs mt-1 text-gray-600">
                {passwordStrength <= 25 ? 'Weak' : 
                 passwordStrength <= 50 ? 'Fair' :
                 passwordStrength <= 75 ? 'Good' : 'Strong'} password
              </p>
            </div>
          )}
          {errors.customerPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.customerPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-3 md:px-4 py-2 md:py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      {/* Mobile Responsive Button */}
      <div className="flex justify-center md:justify-end mt-6 md:mt-8">
        <button
          type="button"
          onClick={handleNext}
          className="w-full md:w-auto px-6 md:px-8 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941F] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
};

export default Step1Form;
