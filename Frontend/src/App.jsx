import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Donations from './pages/Donations';
import CategoryDetail from './pages/CategoryDetail';
import DonationSuccess from './pages/DonationSuccess';
import About from './pages/About';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/donations/:slug" element={<CategoryDetail />} />
        <Route path="/donation-success" element={<DonationSuccess />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  );
}
