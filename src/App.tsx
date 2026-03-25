import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";
import type { Session } from "@supabase/supabase-js";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CreateGroup from "./pages/CreateGroup";
import ExpenseRecord from "./pages/ExpenseRecord";
import Settlement from "./pages/Settlement";
import Settings from "./pages/Settings";
import MyGroups from "./pages/MyGroups";
import AddExpense from "./pages/AddExpense";
import EditExpense from "./pages/EditExpense";
import GroupSettings from "./pages/GroupSettings";

// 保護路由：沒登入就跳到 /login
function ProtectedRoute({ session, children }: { session: Session | null; children: ReactNode }) {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 取得目前的 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 監聽登入/登出事件，即時更新 session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 載入中時先顯示空白，避免閃爍
  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute session={session}><Home /></ProtectedRoute>} />
        <Route path="/create-group" element={<ProtectedRoute session={session}><CreateGroup /></ProtectedRoute>} />
        <Route path="/expense-record/:groupId" element={<ProtectedRoute session={session}><ExpenseRecord /></ProtectedRoute>} />
        <Route path="/add-expense/:groupId" element={<ProtectedRoute session={session}><AddExpense /></ProtectedRoute>} />
        <Route path="/edit-expense/:groupId/:expenseId" element={<ProtectedRoute session={session}><EditExpense /></ProtectedRoute>} />
        <Route path="/settlement/:groupId" element={<ProtectedRoute session={session}><Settlement /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute session={session}><Settings /></ProtectedRoute>} />
        <Route path="/my-groups" element={<ProtectedRoute session={session}><MyGroups /></ProtectedRoute>} />
        <Route path="/group-settings/:groupId" element={<ProtectedRoute session={session}><GroupSettings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
