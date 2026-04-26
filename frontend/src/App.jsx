import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './page/Login';
import Register from './page/Register';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Redirect from root to login for now */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
