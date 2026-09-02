import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Donations from './pages/Donations';
import CategoryDetail from './pages/CategoryDetail';
import DonationStatus from './pages/DonationStatus';
import DonationSuccess from './pages/DonationSuccess';
import DonationFailed from './pages/DonationFailed';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import TermsAndConditions from './pages/TermsAndConditions';
import RefundsAndCancellations from './pages/RefundsAndCancellations';

export default function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/donations/:slug" element={<CategoryDetail />} />
        <Route path="/donation-status" element={<DonationStatus />} />
        <Route path="/donation-success" element={<DonationSuccess />} />
        <Route path="/donation-failed" element={<DonationFailed />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/refunds-and-cancellations" element={<RefundsAndCancellations />} />
      </Routes>
    </Layout>
  );
}
