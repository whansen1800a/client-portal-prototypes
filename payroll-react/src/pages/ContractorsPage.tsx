import React from 'react';
import GustoContractors from '../components/contractors/GustoContractors';
import { mockContractors } from '../mock/contractors';

export default function ContractorsPage() {
  return <GustoContractors initialContractors={mockContractors} />;
}
