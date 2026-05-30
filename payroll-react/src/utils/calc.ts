import { EmployeeCompensation } from '../types/gusto';

const SALARY_ANNUAL = 95000;
const PAY_PERIODS = 26;

export function calcEmployeeGross(emp: EmployeeCompensation): number {
  let base = 0;
  if (emp.flsa_status === 'exempt') {
    base = SALARY_ANNUAL / PAY_PERIODS;
  } else {
    const reg = (emp.regular_hours ?? 0) * (emp.hourly_rate ?? 0);
    const ot = (emp.overtime_hours ?? 0) * (emp.hourly_rate ?? 0) * 1.5;
    const dot = (emp.double_overtime_hours ?? 0) * (emp.hourly_rate ?? 0) * 2;
    base = reg + ot + dot;
  }
  const extras = emp.fixed_compensations.reduce((sum, fc) => sum + fc.amount, 0);
  return base + extras;
}

export function calcTotals(employees: EmployeeCompensation[]) {
  const grossTotal = employees.reduce((s, e) => s + calcEmployeeGross(e), 0);
  const taxRate = 0.2743;
  const taxes = grossTotal * taxRate;
  const net = grossTotal - taxes;
  return { grossTotal, taxes, net };
}
