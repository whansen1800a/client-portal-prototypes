import React from 'react';
import GustoRunPayroll from '../components/run-payroll/GustoRunPayroll';
import { mockPayroll } from '../mock/payroll';

export default function RunPayrollPage() {
  return <GustoRunPayroll initialPayroll={mockPayroll} />;
}
