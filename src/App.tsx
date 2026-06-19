import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Survey from "@/pages/Survey";
import Matching from "@/pages/Matching";
import Recommendation from "@/pages/Recommendation";
import Layout from "@/components/Layout";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/survey" replace />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/matching" element={<Matching />} />
          <Route path="/recommendation" element={<Recommendation />} />
        </Routes>
      </Layout>
    </Router>
  );
}
