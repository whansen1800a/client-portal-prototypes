import React from 'react';
import GustoCompanyDetails from '../components/company/GustoCompanyDetails';
import { mockCompanySteps } from '../mock/company';

export default function CompanyDetailsPage() {
  return <GustoCompanyDetails initialSteps={mockCompanySteps} />;
}
