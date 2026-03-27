import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import ConfirmBottomSheet from '../components/ConfirmBottomSheet';
import { ActionMenu, ActionMenuItem } from '../components/ActionMenu';
import LoadingState from '../components/LoadingState';
import UserAvatar from '../components/UserAvatar';

// Helper for relative time (e.g. 剛剛, 昨天, 10月12日)
function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMins < 60) return '剛剛';
    if (diffHours < 24 && now.getDate() === date.getDate()) return '今天';
    if (diffDays === 1 || (diffHours < 48 && now.getDate() !== date.getDate())) return '昨天';
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

interface Expense {
    id: string;
    description: string;
    amount: number;
    created_at: string;
    paid_by: string;
    payer_name?: string;
}

interface MemberBalance {
    id: string;
    username: string;
    avatar_url: string;
    balance: number;
}



const ExpenseRecord: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    
    // Core Data
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [totalExpense, setTotalExpense] = useState(0);

    // Normal View Data
    const [owesMe, setOwesMe] = useState<{ id: string; name: string; amount: number; avatar_url: string }[]>([]);
    const [iOwe, setIOwe] = useState<{ id: string; name: string; amount: number; avatar_url: string }[]>([]);
    
    // Settlement Data
    const [isGroupSettled, setIsGroupSettled] = useState(false);
    const [settlingGroup, setSettlingGroup] = useState(false);

    // Modals
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSettleModal, setShowSettleModal] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!groupId) return;

            // 1. 取得當前使用者ID
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }

            // Fetch group settle status
            const { data: groupData } = await supabase
                .from('groups')
                .select('is_settled')
                .eq('id', groupId)
                .single();
            if (groupData) {
                setIsGroupSettled(groupData.is_settled);
            }

            // 2. 獲取所有成員 user_ids
            const { data: memberData } = await supabase
                .from('group_members')
                .select('user_id')
                .eq('group_id', groupId);

            const initialBalances: Record<string, MemberBalance> = {};
            if (memberData && memberData.length > 0) {
                const memberUserIds = memberData.map((m: any) => m.user_id);
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url')
                    .in('id', memberUserIds);

                profilesData?.forEach((profile: any) => {
                    initialBalances[profile.id] = {
                        id: profile.id,
                        username: profile.username || '未命名',
                        avatar_url: profile.avatar_url || '',
                        balance: 0
                    };
                });
            }

            // 3. 獲取花費明細
            const { data: expenseData, error: expenseError } = await supabase
                .from('expenses')
                .select('*')
                .eq('group_id', groupId)
                .order('created_at', { ascending: false });

            if (!expenseError && expenseData) {
                let currentExpenses = expenseData;

                // Set total expense
                const total = expenseData.reduce((sum, exp) => sum + Number(exp.amount), 0);
                setTotalExpense(total);

                // 4. 根據 paid_by 獲取 profiles 的名稱
                const payerIds = Array.from(new Set(expenseData.map((e) => e.paid_by)));
                if (payerIds.length > 0) {
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, username')
                        .in('id', payerIds);

                    currentExpenses = expenseData.map((exp) => {
                        const profile = profiles?.find((p) => p.id === exp.paid_by);
                        return {
                            ...exp,
                            payer_name: profile ? profile.username : '某人',
                        };
                    });
                    setExpenses(currentExpenses);
                } else {
                    setExpenses(expenseData);
                }

                // 5. 計算拆帳資訊
                const expenseIds = expenseData.map(e => e.id);
                if (expenseIds.length > 0) {
                    const { data: splits } = await supabase
                        .from('expense_splits')
                        .select('amount, expense_id, user_id')
                        .in('expense_id', expenseIds);

                    if (splits) {
                        // --- A. 計算「誰欠我 / 我欠誰」(User specific) ---
                        if (user) {
                            const userBalances: Record<string, number> = {};
                            currentExpenses.forEach((exp) => {
                                const expSplits = splits.filter((s) => s.expense_id === exp.id);
                                if (exp.paid_by === user.id) {
                                    expSplits.forEach((s) => {
                                        if (s.user_id !== user.id) {
                                            userBalances[s.user_id] = (userBalances[s.user_id] || 0) + Number(s.amount);
                                        }
                                    });
                                } else {
                                    const mySplit = expSplits.find((s) => s.user_id === user.id);
                                    if (mySplit) {
                                        userBalances[exp.paid_by] = (userBalances[exp.paid_by] || 0) - Number(mySplit.amount);
                                    }
                                }
                            });

                            const targetUserIds = Object.keys(userBalances).filter((id) => Math.abs(userBalances[id]) > 0.01);
                            let targetProfiles: any[] = [];
                            if (targetUserIds.length > 0) {
                                const { data } = await supabase
                                    .from('profiles')
                                    .select('id, username, avatar_url')
                                    .in('id', targetUserIds);
                                targetProfiles = data || [];
                            }

                            const newOwesMe: any[] = [];
                            const newIOwe: any[] = [];
                            targetUserIds.forEach((id) => {
                                const amount = userBalances[id];
                                const profile = targetProfiles.find((p) => p.id === id);
                                const name = profile?.username || '某人';
                                const avatar_url = profile?.avatar_url || '';
                                if (amount > 0.01) newOwesMe.push({ id, name, amount, avatar_url });
                                else if (amount < -0.01) newIOwe.push({ id, name, amount: Math.abs(amount), avatar_url });
                            });
                            setOwesMe(newOwesMe);
                            setIOwe(newIOwe);
                        }

                        // --- B. 手動計算是否已結平 ---
                        // (雖然現在主要靠 isGroupSettled 旗標，但這裡保留計算邏輯以備不時之需)
                        // ... (此處省略部分計算，因為主要判斷點已改為 isGroupSettled)
                    }
                }
            }

            setLoading(false);
        };

        fetchData();
    }, [groupId]);

    if (loading) return <LoadingState />;

    const handleSettleGroup = async () => {
        if (!groupId) {
            console.error('[handleSettleGroup] groupId is missing!');
            return;
        }
        console.log('[handleSettleGroup] Attempting to settle groupId:', groupId);
        setSettlingGroup(true);
        const { data, error } = await supabase
            .from('groups')
            .update({ is_settled: true })
            .eq('id', groupId)
            .select();
        
        console.log('[handleSettleGroup] result data:', data);
        console.log('[handleSettleGroup] result error:', error);
        
        if (error) {
            toast.error(`結清群組失敗: ${error.message}`);
        } else if (!data || data.length === 0) {
            toast.error('結清失敗：RLS 政策可能阻擋了更新，請檢查 Supabase 政策');
        } else {
            toast.success('群組已永久結清！');
            setIsGroupSettled(true);
            setShowSettleModal(false); // 關閉確認對話框
        }
        setSettlingGroup(false);
    };

    const handleDeleteExpense = async () => {
        if (!expenseToDelete) return;
        setDeleting(true);
        const { error: splitError } = await supabase.from('expense_splits').delete().eq('expense_id', expenseToDelete);
        if (splitError) {
            toast.error('刪除失敗');
            setDeleting(false);
            return;
        }
        const { error: expError } = await supabase.from('expenses').delete().eq('id', expenseToDelete);
        if (expError) toast.error('刪除失敗');
        else {
            toast.success('已刪除帳務紀錄');
            setExpenses(prev => prev.filter(e => e.id !== expenseToDelete));
            setShowDeleteModal(false);
            setExpenseToDelete(null);
            // Re-trigger load if necessary next time
        }
        setDeleting(false);
    };

    // --- RENDER 1: Removed Separate Settlement View ---
    // (We now settle directly from the main view to keep things simple and avoid extra navigation)
    
    // --- RENDER 2: Expense Record Normal View (帳務明細畫面) ---
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl">
                {/* Top App Bar */}
                <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10">
                    <Link to="/" className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start cursor-pointer">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </Link>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-semibold text-primary uppercase tracking-widest">PayWe 管委</span>
                        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">群組帳務明細</h2>
                    </div>
                    <Link to={`/group-settings/${groupId}`} className="flex w-12 items-center justify-end cursor-pointer text-slate-900 dark:text-slate-100">
                        <span className="material-symbols-outlined text-2xl">settings</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
                    {/* Summary Banner */}
                    <div className="px-6 py-6 flex flex-col items-center justify-center bg-primary/10 mx-6 rounded-3xl mt-4 mb-8 shadow-sm border border-primary/20">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">群組總消費</p>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">${totalExpense.toLocaleString()}</h1>

                        {isGroupSettled ? (
                            <div className="flex flex-col items-center gap-2 mt-2 w-full">
                                <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-full border border-primary/30 shadow-sm backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-primary text-lg font-bold">verified</span>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">此群組每筆帳務已結清</p>
                                </div>
                                <p className="text-xs font-medium text-primary mt-1">主愛大家 ❤️</p>
                            </div>
                        ) : expenses.length === 0 ? (
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm mt-1">
                                <span className="material-symbols-outlined text-[16px] text-slate-500">receipt_long</span>
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">目前尚無花費</p>
                            </div>
                        ) : owesMe.length === 0 && iOwe.length === 0 ? (
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm mt-1">
                                <span className="material-symbols-outlined text-[16px] text-slate-500" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">您已與大家結清</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 mt-2 w-full">
                                {owesMe.map((item) => (
                                    <div key={`owes-me-${item.id}`} className="flex items-center gap-3 bg-white dark:bg-slate-800 pl-2 pr-4 py-2 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm transition-transform active:scale-95">
                                        <UserAvatar src={item.avatar_url} username={item.name} size="sm" />
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                            {item.name} 欠你 <span className="text-primary">${Math.round(item.amount).toLocaleString()}</span>
                                        </p>
                                    </div>
                                ))}
                                {iOwe.map((item) => (
                                    <div key={`i-owe-${item.id}`} className="flex items-center gap-3 bg-white dark:bg-slate-800 pl-2 pr-4 py-2 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm transition-transform active:scale-95">
                                        <UserAvatar src={item.avatar_url} username={item.name} size="sm" />
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                            你欠 {item.name} <span className="text-primary">${Math.round(item.amount).toLocaleString()}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Expense List */}
                    <div className="px-6">
                        <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight pb-4">帳務紀錄</h3>
                        <div className="flex flex-col gap-4">
                            {expenses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                    <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">目前沒有任何帳單</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[220px] leading-relaxed">
                                        點擊下方的新增按鈕<br/>開始記錄群組的第一筆花費吧！
                                    </p>
                                </div>
                            ) : (
                                expenses.map((item) => {
                                    const isMe = item.paid_by === currentUserId;
                                    const payerText = isMe ? '你支付' : `${item.payer_name || '某人'} 支付`;

                                    return (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm group">
                                            <div className="flex flex-col flex-1">
                                                <p className="text-base font-bold text-slate-900 dark:text-slate-100">{item.description}</p>
                                                <p className="text-xs font-medium text-slate-500">{payerText} • {formatRelativeTime(item.created_at)}</p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <p className="text-base font-bold text-slate-900 dark:text-slate-100">${Number(item.amount).toLocaleString()}</p>
                                            </div>
                                            <div className="w-10 flex justify-center shrink-0 ml-2">
                                                {isMe && !isGroupSettled && (
                                                    <ActionMenu>
                                                        <ActionMenuItem icon={<Pencil size={16} />} label="編輯紀錄" onClick={() => navigate(`/edit-expense/${groupId}/${item.id}`)} />
                                                        <ActionMenuItem icon={<Trash2 size={16} />} label="刪除這筆" variant="danger" onClick={() => { setExpenseToDelete(item.id); setShowDeleteModal(true); }} />
                                                    </ActionMenu>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Action Bar for Normal View */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pt-10 max-w-md mx-auto w-full">
                    {isGroupSettled ? (
                        <div className="flex gap-3 pointer-events-auto items-center w-full">
                            <button disabled className="w-full text-center bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold py-4 rounded-2xl border border-slate-300 dark:border-slate-600 cursor-not-allowed transition-all">
                                該群組已結清
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3 pointer-events-auto items-center">
                            {expenses.length > 0 ? (
                                <button 
                                    onClick={() => setShowSettleModal(true)} 
                                    disabled={settlingGroup}
                                    className={`flex-1 text-center font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2 ${
                                        settlingGroup 
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-primary text-slate-900 shadow-primary/20 hover:bg-primary/90'
                                    }`}
                                >
                                    {settlingGroup ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                                            正在結算...
                                        </>
                                    ) : '結算清單'}
                                </button>
                            ) : (
                                <button onClick={() => toast.error('目前沒有帳務紀錄，無法結算')} className="flex-1 text-center bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-bold py-4 rounded-2xl cursor-not-allowed transition-all">
                                    結算清單
                                </button>
                            )}
                            <Link to={`/add-expense/${groupId}`} className="size-14 bg-primary text-slate-900 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center hover:bg-primary/90 transition-all active:scale-[0.98]">
                                <span className="material-symbols-outlined text-3xl font-bold">add</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmBottomSheet
                isOpen={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setExpenseToDelete(null); }}
                onConfirm={handleDeleteExpense}
                loading={deleting}
                title="確定要刪除花費嗎？"
                description={`這個動作完全無法復原。\n這將會同步刪除所有人的分攤紀錄。`}
                confirmText="是的，我要刪除"
                cancelText="考慮一下"
            />

            <ConfirmBottomSheet
                isOpen={showSettleModal}
                onClose={() => setShowSettleModal(false)}
                onConfirm={handleSettleGroup}
                loading={settlingGroup}
                variant="success"
                title="確定要結清群組嗎？"
                description={`結清後，所有帳務將無法再被編輯或刪除，且無法再次新增帳務。\n這通常代表大家已經完成轉帳還款囉！`}
                confirmText="是的，確認結清"
                cancelText="再檢查一下"
            />
        </div>
    );
};

export default ExpenseRecord;
