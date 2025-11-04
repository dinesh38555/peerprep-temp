import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SheetsPage from "./pages/SheetsPage";
import ProblemsPage from "./pages/ProblemsPage";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./components/dashboard"; // ← Import dashboard component

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} /> {/* ← Use dashboard directly */}
        <Route path="/sheets" element={<SheetsPage />} />
        <Route path="/problems/sheet/:sheet_id" element={<ProblemsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
