import React from 'react';

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
  handleNext 
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent ${
              errors.customerName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
          />
          {errors.customerName && (
            <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <select className="px-3 py-2 border border-r-0 rounded-l-lg border-gray-300 bg-gray-50">
              <option>+971</option>
              <option>+1</option>
              <option>+44</option>
              <option>+91</option>
            </select>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleInputChange}
              className={`flex-1 px-4 py-2 border rounded-r-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent ${
                errors.customerPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter phone number"
            />
          </div>
          {errors.customerPhone && (
            <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleInputChange}
            onBlur={() => checkEmailAvailability(formData.customerEmail)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent ${
              errors.customerEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
          />
          {errors.customerEmail && (
            <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            onBlur={() => checkUsernameAvailability(formData.userName)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent ${
              errors.userName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Choose a username"
          />
          {errors.userName && (
            <p className="text-red-500 text-xs mt-1">{errors.userName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent ${
              errors.country ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Country</option>
            <option value="UAE">United Arab Emirates</option>
            <option value="USA">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="India">India</option>
            <option value="Congo">Congo</option>
          </select>
          {errors.country && (
            <p className="text-red-500 text-xs mt-1">{errors.country}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="customerPassword"
              value={formData.customerPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent ${
                errors.customerPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Create a password"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
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

      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={handleNext}
          className="px-8 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941F] transition"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
};

export default Step1Form;
