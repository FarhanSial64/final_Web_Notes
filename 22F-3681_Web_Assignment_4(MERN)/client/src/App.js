import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Auth/Login';
import SignupPage from './pages/Auth/Signup';
import ResetPassword from './pages/Auth/ResetPassword';


import ClientHome from './pages/Client/ClientHome';
import MyProjects from './pages/Client/MyProjects';
import CreateProject from './pages/Client/CreateProject';
import ProjectDetail from './pages/Client/ProjectDetail';
import ClientNotifications from './pages/Client/ClientNotifications';

import ClientDashboardLayout from './Components/ClientSidebar/ClientDashboardLayout';

import FreelancerDashboardLayout from './Components/FreelancerSiedbar/FreelancerDashboardLayout';
import FreelancerHome from './pages/Freelancer/FreelancerHome';
import BidHistory from './pages/Freelancer/BidHistory';
import ActiveProjects from './pages//Freelancer/ActiveProjects';
import FreelancerNotifications from './pages/Freelancer/FreelancerNotifications';
import ProfileSettings from './pages/Freelancer/ProfileSettings';
import FindProject from './pages/Freelancer/FindProject';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected client dashboard layout */}
        <Route path="/client" element={<ClientDashboardLayout />}>
          <Route path="home" element={<ClientHome />} />
          <Route path="my-projects" element={<MyProjects />} />
          <Route path="create-project" element={<CreateProject />} />
          <Route path="project-detail" element={<ProjectDetail />} />
          <Route path="notifications" element={<ClientNotifications />} />
        </Route>

        {/* Protected freelancer dashboard layout */}
        <Route path="/freelancer" element={<FreelancerDashboardLayout />}>
          <Route path="home" element={<FreelancerHome />} />
          <Route path="bids" element={<BidHistory />} />
          <Route path="projects" element={<ActiveProjects />} />
          <Route path="notifications" element={<FreelancerNotifications />} />
          <Route path="profile-settings" element={<ProfileSettings />} />
          <Route path="find-project" element={<FindProject />} />
        </Route>
      </Routes>
    </Router>

  );
}

export default App;
