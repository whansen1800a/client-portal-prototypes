import React from 'react';
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import PayrollShell from './components/shell/PayrollShell';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import ContractorsPage from './pages/ContractorsPage';
import RunPayrollPage from './pages/RunPayrollPage';

export default function App() {
  return (
    <Router>
      <PayrollShell>
        <Switch>
          <Route path="/company" component={CompanyDetailsPage} />
          <Route path="/contractors" component={ContractorsPage} />
          <Route path="/run-payroll" component={RunPayrollPage} />
          <Redirect from="/" to="/company" />
        </Switch>
      </PayrollShell>
    </Router>
  );
}
