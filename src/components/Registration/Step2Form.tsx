import React from 'react';

interface Branch {
  _id: string;
  branchName: string;
  branchCode: string;
  country: string;
}

interface FormData {
  dateOfBirth: string;
  bankAccountNumber: string;
  residence: string;
  branch: string;
  sourceOfIncome: string;
  type: string;
}

interface Step2FormProps {
  formData: FormData;
  errors: Record<string, string>;
  branches: Branch[];
  branchesLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handlePrevious: () => void;
  handleNext: () => void;
  onRetryBranches?: () => void;
}

const Step2Form: React.FC<Step2FormProps> = ({ 
  formData, 
  errors, 
  branches,
  branchesLoading,
  handleInputChange,
  handlePrevious,
  handleNext,
  onRetryBranches
}) => {
  console.log('Step2Form received branches:', branches);
  console.log('Branches length:', branches?.length);
  console.log('Branches loading:', branchesLoading);
  
  return (
    <div className="space-y-6">
      {/* Mobile Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Date of Birth */}
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent ${
              errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dateOfBirth && (
            <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Account Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="bankAccountNumber"
            value={formData.bankAccountNumber}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent ${
              errors.bankAccountNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter bank account number"
          />
          {errors.bankAccountNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.bankAccountNumber}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Residence Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="residence"
            value={formData.residence}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent ${
              errors.residence ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your full residence address"
          />
          {errors.residence && (
            <p className="text-red-500 text-xs mt-1">{errors.residence}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branch <span className="text-red-500">*</span>
          </label>
          <select
            name="branch"
            value={formData.branch}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent ${
              errors.branch ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Branch</option>
            {branchesLoading ? (
              <option value="" disabled>Loading branches...</option>
            ) : branches && branches.length > 0 ? (
              branches.map((branch: Branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.branchName} - {branch.country}
                </option>
              ))
            ) : (
              <option value="" disabled>No branches available</option>
            )}
          </select>
          {errors.branch && (
            <p className="text-red-500 text-xs mt-1">{errors.branch}</p>
          )}
          {!branchesLoading && branches.length === 0 && onRetryBranches && (
            <button
              type="button"
              onClick={onRetryBranches}
              className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry Loading Branches
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source of Income <span className="text-red-500">*</span>
          </label>
          <select
            name="sourceOfIncome"
            value={formData.sourceOfIncome}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent ${
              errors.sourceOfIncome ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Source</option>
            <option value="Employment">Employment</option>
            <option value="Business">Business</option>
            <option value="Investment">Investment</option>
            <option value="Retirement">Retirement</option>
            <option value="Other">Other</option>
          </select>
          {errors.sourceOfIncome && (
            <p className="text-red-500 text-xs mt-1">{errors.sourceOfIncome}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Type <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="B2B"
                checked={formData.type === 'B2B'}
                onChange={handleInputChange}
                className="mr-2 text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span>B2B</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="B2C"
                checked={formData.type === 'B2C'}
                onChange={handleInputChange}
                className="mr-2 text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span>B2C</span>
            </label>
          </div>
        </div>
      </div>

      {/* Mobile Responsive Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 md:mt-8">
        <button
          type="button"
          onClick={handlePrevious}
          className="w-full sm:w-auto px-6 md:px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="w-full sm:w-auto px-6 md:px-8 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941F] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
};

export default Step2Form;
