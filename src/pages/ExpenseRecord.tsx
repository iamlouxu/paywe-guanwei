import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

interface Expense {
    id: string;
    description: string;
    amount: number;
    created_at: string;
    paid_by: string;
    payer_name?: string;
}

const ExpenseRecord: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [owesMe, setOwesMe] = useState<{ id: string; name: string; amount: number }[]>([]);
    const [iOwe, setIOwe] = useState<{ id: string; name: string; amount: number }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!groupId) return;

            // 1. 取得當前使用者ID
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }

            // 2. 獲取群組名稱 (目前不顯示，可省略或保留以供後續使用)
            await supabase
                .from('groups')
                .select('name')
                .eq('id', groupId)
                .single();

            // 3. 獲取花費明細
            const { data: expenseData, error: expenseError } = await supabase
                .from('expenses')
                .select('*')
                .eq('group_id', groupId)
                .order('created_at', { ascending: false });

            if (!expenseError && expenseData) {
                let currentExpenses = expenseData;

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

                // 5. 計算當前使用者的個人帳務餘額 (針對此群組)
                if (user) {
                    const expenseIds = expenseData.map(e => e.id);

                    if (expenseIds.length > 0) {
                        const { data: splits } = await supabase
                            .from('expense_splits')
                            .select('amount, expense_id, user_id')
                            .in('expense_id', expenseIds);

                        if (splits) {
                            // 建立一個紀錄「誰欠我」和「我欠誰」的字典
                            const balances: Record<string, number> = {};

                            currentExpenses.forEach((exp) => {
                                const expSplits = splits.filter((s) => s.expense_id === exp.id);

                                if (exp.paid_by === user.id) {
                                    // 我付的錢，把別人的分攤記為別人欠我 (正數)
                                    expSplits.forEach((s) => {
                                        if (s.user_id !== user.id) {
                                            balances[s.user_id] = (balances[s.user_id] || 0) + Number(s.amount);
                                        }
                                    });
                                } else {
                                    // 別人付的錢，把我的分攤記為我欠別人 (負數)
                                    const mySplit = expSplits.find((s) => s.user_id === user.id);
                                    if (mySplit) {
                                        balances[exp.paid_by] = (balances[exp.paid_by] || 0) - Number(mySplit.amount);
                                    }
                                }
                            });

                            // 將最終的淨餘額分類並取得對方名稱
                            const targetUserIds = Object.keys(balances).filter((id) => Math.abs(balances[id]) > 0.01);

                            let targetProfiles: any[] = [];
                            if (targetUserIds.length > 0) {
                                const { data } = await supabase
                                    .from('profiles')
                                    .select('id, username')
                                    .in('id', targetUserIds);
                                targetProfiles = data || [];
                            }

                            const newOwesMe: any[] = [];
                            const newIOwe: any[] = [];

                            targetUserIds.forEach((id) => {
                                const amount = balances[id];
                                const profile = targetProfiles.find((p) => p.id === id);
                                const name = profile?.username || '某人';

                                if (amount > 0.01) {
                                    newOwesMe.push({ id, name, amount });
                                } else if (amount < -0.01) {
                                    newIOwe.push({ id, name, amount: Math.abs(amount) });
                                }
                            });

                            setOwesMe(newOwesMe);
                            setIOwe(newIOwe);
                        }
                    }
                }
            }

            setLoading(false);
        };

        fetchData();
    }, [groupId]);

    const handleDeleteExpense = async (expenseId: string) => {
        if (!window.confirm('確定要刪除這筆花費嗎？這將會同步刪除所有分攤紀錄。')) {
            return;
        }
        setLoading(true);
        // 先刪除 expense_splits (如果有外鍵 on delete cascade 其實不用，但保險起見自己先切)
        const { error: splitError } = await supabase
            .from('expense_splits')
            .delete()
            .eq('expense_id', expenseId);

        if (splitError) {
            console.error('刪除分帳記錄失敗:', splitError);
            alert('刪除失敗');
            setLoading(false);
            return;
        }

        // 再刪除 expense
        const { error: expError } = await supabase
            .from('expenses')
            .delete()
            .eq('id', expenseId);

        if (expError) {
            console.error('刪除花費失敗:', expError);
            alert('刪除失敗');
        } else {
            // 從 UI 移除該項目
            setExpenses(prev => prev.filter(e => e.id !== expenseId));
        }
        setLoading(false);
    };

    // 計算總花費
    const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl">
                {/* Top App Bar */}
                <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10">
                    <Link
                        to="/"
                        className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </Link>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-semibold text-primary uppercase tracking-widest">PayWe 管委</span>
                        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">
                            群組帳務明細
                        </h2>
                    </div>
                    <Link
                        to={`/group-settings/${groupId}`}
                        className="flex w-12 items-center justify-end cursor-pointer text-slate-900 dark:text-slate-100"
                    >
                        <span className="material-symbols-outlined text-2xl">settings</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto pb-32">
                    {/* Summary Banner */}
                    <div className="px-6 py-6 flex flex-col items-center justify-center bg-primary/10 mx-6 rounded-3xl mt-4 mb-8 shadow-sm border border-primary/20">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">群組總消費</p>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">${totalExpense.toLocaleString()}</h1>

                        {loading ? (
                            <div className="h-8 w-32 bg-slate-900/10 animate-pulse rounded-full mt-1"></div>
                        ) : owesMe.length === 0 && iOwe.length === 0 ? (
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm mt-1">
                                <span className="material-symbols-outlined text-[16px] text-slate-500" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">您已與大家結清</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 mt-2 w-full">
                                {owesMe.map((item) => (
                                    <div key={`owes-me-${item.id}`} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <div className="size-2 rounded-full bg-primary"></div>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                            你需向 {item.name} 收款 <span className="text-primary">${Math.round(item.amount).toLocaleString()}</span>
                                        </p>
                                    </div>
                                ))}
                                {iOwe.map((item) => (
                                    <div key={`i-owe-${item.id}`} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <div className="size-2 rounded-full bg-primary"></div>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                            你需支付給 {item.name} <span className="text-primary">${Math.round(item.amount).toLocaleString()}</span>
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
                            {loading ? (
                                <div className="flex justify-center p-10">
                                    <span className="material-symbols-outlined animate-spin text-4xl text-primary block">progress_activity</span>
                                </div>
                            ) : expenses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-10 mt-2 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center shadow-sm">
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                                        <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>receipt_long</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">還沒有任何帳務紀錄</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                        這裡還空空的<br />趕快點擊下方 + 號新增第一筆花費吧！
                                    </p>
                                </div>
                            ) : (
                                expenses.map((item) => {
                                    const formattedDate = new Date(item.created_at).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
                                    const isMe = item.paid_by === currentUserId;
                                    const payerText = isMe ? '你支付' : `${item.payer_name || '某人'} 支付`;

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm group"
                                        >
                                            <div className="flex flex-col flex-1">
                                                <p className="text-base font-bold text-slate-900 dark:text-slate-100">{item.description}</p>
                                                <p className="text-xs font-medium text-slate-500">{payerText} • {formattedDate}</p>
                                            </div>
                                            <div className="flex flex-col items-end mr-3">
                                                <p className="text-base font-bold text-slate-900 dark:text-slate-100">${Number(item.amount).toLocaleString()}</p>
                                            </div>
                                            {/* 操作按鈕 - 只有自己付的才能編輯刪除 */}
                                            {isMe && (
                                                <div className="flex flex-col gap-1 items-center">
                                                    <button
                                                        onClick={() => navigate(`/edit-expense/${groupId}/${item.id}`)}
                                                        className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors shadow-sm cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteExpense(item.id)}
                                                        className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pt-10 max-w-md mx-auto w-full">
                    <div className="flex gap-3 pointer-events-auto items-center">
                        <Link to={`/settlement/${groupId}`} className="flex-1 text-center bg-primary text-slate-900 font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]">
                            結算清單
                        </Link>
                        <Link
                            to={`/add-expense/${groupId}`}
                            className="size-14 bg-primary text-slate-900 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center hover:bg-primary/90 transition-all active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-3xl font-bold">add</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseRecord;
