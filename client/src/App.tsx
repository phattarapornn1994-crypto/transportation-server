import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CustomerMaster from './pages/CustomerMaster';
import VehicleMaster from './pages/VehicleMaster';
import PlanCreate from './pages/PlanCreate';
import PlanResults from './pages/PlanResults';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<CustomerMaster />} />
          <Route path="/vehicles" element={<VehicleMaster />} />
          <Route path="/plans/create" element={<PlanCreate />} />
          <Route path="/plans/:id/results" element={<PlanResults />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

