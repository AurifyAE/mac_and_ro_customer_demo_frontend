import React from 'react';

interface FormData {
  idNumber: string;
  identityFront: File | null;
  identityBack: File | null;
}

interface Step3FormProps {
  formData: FormData;
  errors: Record<string, string>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'identityFront' | 'identityBack') => void;
  frontPreview: string | null;
  backPreview: string | null;
  handlePrevious: () => void;
  loading: boolean;
}

const Step3Form: React.FC<Step3FormProps> = ({ 
  formData, 
  errors, 
  handleInputChange,
  handleFileUpload,
  frontPreview,
  backPreview,
  handlePrevious,
  loading 
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Identity Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent ${
              errors.idNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your ID/Passport number"
          />
          {errors.idNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Identity Document - Front <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#D4AF37] transition">
            {frontPreview ? (
              <div className="relative">
                <img src={frontPreview} alt="Front ID" className="max-h-40 mx-auto" />
                <button
                  type="button"
                  onClick={() => {
                    // Clear the file input
                    const input = document.getElementById('identityFront') as HTMLInputElement;
                    if (input) input.value = '';
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'identityFront')}
                  className="hidden"
                  id="identityFront"
                />
                <label htmlFor="identityFront" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</span>
                </label>
              </>
            )}
          </div>
          {errors.identityFront && (
            <p className="text-red-500 text-xs mt-1">{errors.identityFront}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Identity Document - Back <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#D4AF37] transition">
            {backPreview ? (
              <div className="relative">
                <img src={backPreview} alt="Back ID" className="max-h-40 mx-auto" />
                <button
                  type="button"
                  onClick={() => {
                    // Clear the file input
                    const input = document.getElementById('identityBack') as HTMLInputElement;
                    if (input) input.value = '';
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'identityBack')}
                  className="hidden"
                  id="identityBack"
                />
                <label htmlFor="identityBack" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</span>
                </label>
              </>
            )}
          </div>
          {errors.identityBack && (
            <p className="text-red-500 text-xs mt-1">{errors.identityBack}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handlePrevious}
          className="px-8 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition"
        >
          ← Previous
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-3 font-semibold rounded-lg transition ${
            loading 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-[#D4AF37] text-black hover:bg-[#B8941F]'
          }`}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
    </div>
  );
};

export default Step3Form;
