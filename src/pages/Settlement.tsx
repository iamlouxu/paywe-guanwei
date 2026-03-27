import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import LoadingState from '../components/LoadingState';

// Helper for relative time
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

interface MemberBalance {
    id: string;
    username: string;
    avatar_url: string;
    balance: number;
}

interface Transaction {
    from: MemberBalance;
    to: MemberBalance;
    amount: number;
}

interface Expense {
    id: string;
    description: string;
    amount: number;
    paid_by: string;
    paid_by_username: string;
    created_at: string;
}

const Settlement: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
    const [totalGroupExpense, setTotalGroupExpense] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const calculateBalances = async () => {
            if (!groupId) return;
            setLoading(true);

            try {
                // 1. 取得當前使用者
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setCurrentUserId(user.id);
                }

                // 2. 獲取所有成員 user_ids
                const { data: memberData } = await supabase
                    .from('group_members')
                    .select('user_id')
                    .eq('group_id', groupId);

                if (!memberData || memberData.length === 0) {
                    setLoading(false);
                    return;
                }

                const memberUserIds = memberData.map((m: any) => m.user_id);
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url')
                    .in('id', memberUserIds);

                const initialBalances: Record<string, MemberBalance> = {};
                profilesData?.forEach((profile: any) => {
                    initialBalances[profile.id] = {
                        id: profile.id,
                        username: profile.username || '未命名',
                        avatar_url: profile.avatar_url || '',
                        balance: 0
                    };
                });

                // 3. 獲取所有花費與分配
                const { data: expenses } = await supabase
                    .from('expenses')
                    .select('id, description, amount, paid_by, created_at')
                    .eq('group_id', groupId)
                    .order('created_at', { ascending: false });

                if (expenses && expenses.length > 0) {
                    const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
                    setTotalGroupExpense(total);

                    const formattedExpenses = expenses.map(e => ({
                        ...e,
                        paid_by_username: initialBalances[e.paid_by]?.username || '未知'
                    }));
                    setAllExpenses(formattedExpenses);

                    const expenseIds = expenses.map(e => e.id);
                    const { data: splits } = await supabase
                        .from('expense_splits')
                        .select('expense_id, user_id, amount')
                        .in('expense_id', expenseIds);

                    // 計算每個人付了多少
                    expenses.forEach(exp => {
                        if (initialBalances[exp.paid_by]) {
                            initialBalances[exp.paid_by].balance += Number(exp.amount);
                        }
                    });

                    // 扣除每個人該付多少 (分攤)
                    splits?.forEach(split => {
                        if (initialBalances[split.user_id]) {
                            initialBalances[split.user_id].balance -= Number(split.amount);
                        }
                    });
                } else {
                    // 如果沒有帳務，跳回帳務明細
                    navigate(`/expense-record/${groupId}`);
                    return;
                }

                const balanceList = Object.values(initialBalances);

                // --- 債務結算演算法 (Debt Simplification) ---
                const debtors = balanceList.filter(m => m.balance < -0.01).sort((a, b) => a.balance - b.balance);
                const creditors = balanceList.filter(m => m.balance > 0.01).sort((a, b) => b.balance - a.balance);

                const newTransactions: Transaction[] = [];
                let dIdx = 0;
                let cIdx = 0;

                const dList = debtors.map(d => ({ ...d }));
                const cList = creditors.map(c => ({ ...c }));

                while (dIdx < dList.length && cIdx < cList.length) {
                    const debtor = dList[dIdx];
                    const creditor = cList[cIdx];
                    
                    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
                    
                    if (amount > 0.01) {
                        const originalDebtor = initialBalances[debtor.id];
                        const originalCreditor = initialBalances[creditor.id];
                        
                        newTransactions.push({
                            from: originalDebtor,
                            to: originalCreditor,
                            amount: amount
                        });
                    }
                    
                    debtor.balance += amount;
                    creditor.balance -= amount;
                    
                    if (Math.abs(debtor.balance) < 0.01) dIdx++;
                    if (creditor.balance < 0.01) cIdx++;
                }
                
                // Fetch group settle status
                const { data: groupData } = await supabase
                    .from('groups')
                    .select('is_settled')
                    .eq('id', groupId)
                    .single();
                
                const dbIsSettled = groupData?.is_settled || false;

                if (dbIsSettled) {
                    setTransactions([]);
                } else {
                    setTransactions(newTransactions);
                }
            } catch (error) {
                console.error('Error calculating balances:', error);
            } finally {
                setLoading(false);
            }
        };

        calculateBalances();
    }, [groupId, navigate]);

    if (loading) {
        return <LoadingState />;
    }

    const isSettled = transactions.length === 0;

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors duration-300 relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto">
            {/* Exactly mapping user's HTML for Header */}
            <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10">
                <div 
                    onClick={() => navigate(`/expense-record/${groupId}`)}
                    className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start cursor-pointer"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest">PayWe 管委</span>
                    <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">群組帳務明細</h2>
                </div>
                <div className="flex w-12 items-center justify-end cursor-pointer">
                    <span className="material-symbols-outlined text-2xl text-slate-900 dark:text-slate-100">more_horiz</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
                {/* Exactly mapping user's HTML for Banner */}
                {isSettled ? (
                    <div className="px-6 py-8 flex flex-col items-center justify-center bg-primary/10 mx-6 rounded-3xl mt-4 mb-8 shadow-sm border border-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <span className="material-symbols-outlined text-6xl rotate-12">check_circle</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">群組總消費</p>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">${totalGroupExpense.toLocaleString()}</h1>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-full border border-primary/30 shadow-sm backdrop-blur-sm">
                                <span className="material-symbols-outlined text-primary text-lg font-bold">verified</span>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">此群組每筆帳務已結清</p>
                            </div>
                            <p className="text-xs font-medium text-primary mt-1">主愛大家 ❤️</p>
                        </div>
                    </div>
                ) : (
                    <div className="px-6 py-8 flex flex-col items-center justify-center bg-amber-500/10 mx-6 rounded-3xl mt-4 mb-8 shadow-sm border border-amber-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10 text-amber-500">
                            <span className="material-symbols-outlined text-6xl rotate-12">pending</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">群組總消費</p>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">${totalGroupExpense.toLocaleString()}</h1>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-full border border-amber-500/30 shadow-sm backdrop-blur-sm">
                                <span className="material-symbols-outlined text-amber-500 text-lg font-bold">pending</span>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">尚有 {transactions.length} 筆待結轉帳</p>
                            </div>
                            <p className="text-xs font-medium text-amber-600 mt-1">趕緊揪大家還錢 🚀</p>
                        </div>
                    </div>
                )}

                <div className="px-6">
                    <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight pb-4">
                        {isSettled ? '帳務紀錄' : '最佳還款路徑方案'}
                    </h3>
                    
                    <div className="flex flex-col gap-4">
                        {isSettled ? (
                            /* User's HTML Card Structure for Expense History */
                            allExpenses.map((exp) => (
                                <div key={exp.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <p className="text-base font-bold text-slate-900 dark:text-slate-100">{exp.description}</p>
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">
                                                    <span className="material-symbols-outlined text-[12px]">check</span>已結清
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium text-slate-500">
                                                {exp.paid_by === currentUserId ? '你' : exp.paid_by_username}支付 • {formatRelativeTime(exp.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-base font-bold text-slate-900 dark:text-slate-100">${Number(exp.amount).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* Modified user's HTML Card Structure for Transactions */
                            transactions.map((tx, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <p className="text-base font-bold text-slate-900 dark:text-slate-100">{tx.from.username}</p>
                                                <span className="material-symbols-outlined text-slate-400 text-sm mx-1">arrow_forward</span>
                                                <p className="text-base font-bold text-slate-900 dark:text-slate-100">{tx.to.username}</p>
                                            </div>
                                            <p className="text-xs font-medium text-slate-500">
                                                {tx.from.id === currentUserId ? '你要付款' : (tx.to.id === currentUserId ? '你將收款' : '需轉帳')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <p className="text-base font-bold text-amber-500">${Math.round(tx.amount).toLocaleString()}</p>
                                        <button className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600">
                                            標記完成
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Exactly mapping user's HTML for Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pt-10">
                <div className="flex gap-3 pointer-events-auto items-center max-w-md mx-auto">
                    <button
                        disabled={isSettled}
                        className={`flex-1 font-bold py-4 rounded-2xl border ${
                            isSettled 
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-300 dark:border-slate-600 cursor-not-allowed'
                                : 'bg-primary text-slate-900 border-primary/20 cursor-pointer shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all'
                        }`}
                    >
                        {isSettled ? '該群組已結清' : '分享結算結果'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settlement;
