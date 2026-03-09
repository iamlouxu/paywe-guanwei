import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CreateGroup from "./pages/CreateGroup";
import ExpenseRecord from "./pages/ExpenseRecord";
import Settlement from "./pages/Settlement";
import Settings from "./pages/Settings";
import MyGroups from "./pages/MyGroups";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/expense-record" element={<ExpenseRecord />} />
        <Route path="/settlement" element={<Settlement />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/my-groups" element={<MyGroups />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
