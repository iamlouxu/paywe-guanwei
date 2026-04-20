import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { supabase } from "./supabase";
import { useAppSelector, useAppDispatch } from "./redux/hooks";
import { setUser, setAuthLoading, fetchUserProfile } from "./redux/slices/authSlice";
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
import GroupCreated from "./pages/GroupCreated";

// 保護路由：沒登入就跳到 /login
function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAppSelector(state => state.auth.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 取得目前的 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setUser(session?.user ?? null));
      dispatch(setAuthLoading(false));
      if (session?.user) {
        dispatch(fetchUserProfile());
      }
      setLoading(false);
    });

    // 監聽登入/登出事件，即時更新 session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setUser(session?.user ?? null));
      if (session?.user) {
        dispatch(fetchUserProfile());
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  // 載入中時先顯示空白，避免閃爍
  if (loading) return null;

  return (
    <Router>
      {/* Toaster for notifications */}
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
        <Route path="/expense-record/:groupId" element={<ProtectedRoute><ExpenseRecord /></ProtectedRoute>} />
        <Route path="/add-expense/:groupId" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
        <Route path="/edit-expense/:groupId/:expenseId" element={<ProtectedRoute><EditExpense /></ProtectedRoute>} />
        <Route path="/settlement/:groupId" element={<ProtectedRoute><Settlement /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/my-groups" element={<ProtectedRoute><MyGroups /></ProtectedRoute>} />
        <Route path="/group-settings/:groupId" element={<ProtectedRoute><GroupSettings /></ProtectedRoute>} />
        <Route path="/group-created/:groupId" element={<ProtectedRoute><GroupCreated /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

