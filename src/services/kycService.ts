import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface IndividualKYCData {
  custId: string;
  customerName: string;
  customerEmail: string;
  customerContact: string;
  bankAccountNumber: string;
  dateOfBirth: string;
  nationality: string;
  residence: string;
  sourceOfIncome: string;
  idNumber: string;
  branch: string;
  type: string;
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
  sourceOfWealth?: {
    evidenced: string[];
    OtherEvidenced?: string;
  };
  sourceOfFunds?: {
    evidenced: string[];
    OtherEvidenced?: string;
  };
  products?: string[];
}

export interface CompanyKYCData {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  dateOfIncorporation?: string;
  countryOfOperations?: string;
  countryOfDomicile?: string;
  nationalIdNumber: string;
  expiryDate?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isdCode?: string;
  phoneNumber?: string;
  email?: string;
  products?: string[];
  companyShareholders?: Array<{
    entityType: 'individual' | 'company';
    onboard?: boolean;
    name: string;
    dob?: string;
    dateOfAppointment?: string;
    dateOfTermination?: string;
    shares?: string;
    countryOfResidence?: string;
    nationality?: string;
    idNumber?: string;
    idExpiry?: string;
    passportExpiry?: string;
    passportNumber?: string;
  }>;
  authorisedPersons?: Array<{
    entityType: 'individual' | 'company';
    name: string;
    countryOfResidence?: string;
    nationality?: string;
  }>;
  companyDirectors?: Array<{
    entityType: 'individual' | 'company';
    name: string;
  }>;
  companyExecutiveManagement?: Array<{
    entityType: 'individual' | 'company';
    name: string;
  }>;
  branch: string;
  createdBy: string;
}

export interface KYCStatus {
  idenfoId?: number;
  idenfoStatus?: string;
  idenfoRiskRating?: string;
  idenfoNameScreeningStatus?: string;
  idenfoScreeningHits?: {
    sanctionHit: boolean;
    pepHit: boolean;
    enforcementHit: boolean;
    blackListHit: boolean;
  };
  kycSummary?: {
    documentationVerificationRating: string;
    documentationVerification: boolean;
    nameScreening: {
      sanctionHit: boolean;
      pepHit: boolean;
      enforcementHit: boolean;
      blackListHit: boolean;
    };
    riskRating: string;
    riskLevel: string;
  };
}

class KYCService {
  // Submit Individual KYC
  async submitIndividualKYC(data: FormData): Promise<any> {
    try {
      const response = await axios.post(`${backendUrl}/api/user/kyc`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit KYC');
    }
  }

  // Submit Company KYC
  async submitCompanyKYC(data: FormData): Promise<any> {
    try {
      const response = await axios.post(`${backendUrl}/api/user/company-kyc`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit company KYC');
    }
  }

  // Get KYC Status from Idenfo
  async getKYCStatus(kycId: string): Promise<KYCStatus> {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/kyc/idenfo-status/${kycId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get KYC status');
    }
  }

  // Get Company KYC Status from Idenfo
  async getCompanyKYCStatus(companyKycId: string): Promise<KYCStatus> {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/company-kyc/idenfo-status/${companyKycId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get company KYC status');
    }
  }

  // Get customer with Idenfo risk rating
  async getCustomerWithRiskRating(customerId: string): Promise<any> {
    try {
      const response = await axios.get(`${backendUrl}/api/user/customers/${customerId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get customer data');
    }
  }
}

export default new KYCService();
