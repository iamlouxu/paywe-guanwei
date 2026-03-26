import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import LoadingState from '../components/LoadingState';
import BottomNav from '../components/BottomNav';

interface GroupData {
    id: string;
    name: string;
    created_at: string;
    expenses?: { amount: number }[];
}

const Home: React.FC = () => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [groups, setGroups] = useState<GroupData[]>([]);
    const [loading, setLoading] = useState(true);
    const [totals, setTotals] = useState<{ net: number }>({ net: 0 });

    const hasData = groups.length > 0;

    useEffect(() => {
        const fetchAvatar = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // 1. Fetch Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .eq('id', user.id)
                    .single();

                if (profile && profile.avatar_url) {
                    setAvatarUrl(profile.avatar_url);
                }

                // 2. Fetch Groups
                const { data: myGroups, error: groupError } = await supabase
                    .from('groups')
                    .select(`
                        id, name, created_at,
                        expenses ( amount, id, paid_by )
                    `)
                    .order('created_at', { ascending: false });

                if (!groupError && myGroups) {
                    setGroups(myGroups as any);

                    // 3. Calculate Global Totals (correctly separated)
                    // Step A: Get all expenses I paid
                    const { data: myPaidExpenses } = await supabase
                        .from('expenses')
                        .select('id, amount')
                        .eq('paid_by', user.id);

                    const myPaidExpenseIds = myPaidExpenses?.map(e => e.id) || [];

                    // Step B: "待收" = splits in MY expenses that belong to OTHER people
                    let othersOweMeTotal = 0;
                    if (myPaidExpenseIds.length > 0) {
                        const { data: othersInMyExpenses } = await supabase
                            .from('expense_splits')
                            .select('amount')
                            .in('expense_id', myPaidExpenseIds)
                            .neq('user_id', user.id);

                        othersOweMeTotal = othersInMyExpenses?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;
                    }

                    // Step C: "待付" = MY splits in expenses I did NOT pay
                    const { data: myAllSplits } = await supabase
                        .from('expense_splits')
                        .select('amount, expense_id')
                        .eq('user_id', user.id);

                    const iOweTotal = myAllSplits
                        ?.filter(s => !myPaidExpenseIds.includes(s.expense_id))
                        .reduce((sum, s) => sum + Number(s.amount), 0) || 0;

                    setTotals({ net: othersOweMeTotal - iOweTotal });
                }
            }
            setLoading(false);
        };

        fetchAvatar();
    }, []);

    if (loading) {
        return <LoadingState />;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl">
                {/* Header Section */}
                <div className="flex items-center bg-background-light dark:bg-background-dark p-4 justify-between">
                    <div className="w-12"></div>
                    <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight text-center">
                        PayWe 管委
                    </h2>
                    <div className="flex w-12 items-center justify-end">
                        <Link
                            to="/settings"
                            className="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-primary/20 text-slate-900 dark:text-slate-100 hover:bg-primary/30 transition-colors overflow-hidden border-2 border-transparent hover:border-primary"
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined">person</span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col gap-6 p-4 pb-24">
                    {/* Quick Action / Summary Section */}
                    <div className="rounded-2xl bg-primary p-6 text-slate-900 shadow-xl shadow-primary/20">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-1">
                                {loading ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="h-4 w-24 bg-slate-900/10 animate-pulse rounded"></div>
                                        <div className="h-8 w-32 bg-slate-900/20 animate-pulse rounded"></div>
                                    </div>
                                ) : totals.net === 0 ? (
                                    <>
                                        <p className="text-[11px] font-black uppercase tracking-wider opacity-60">所有群組總結算</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                                            <p className="text-2xl font-black">已結清</p>
                                        </div>
                                    </>
                                ) : totals.net > 0 ? (
                                    <>
                                        <p className="text-[11px] font-black uppercase tracking-wider opacity-60">所有群組總待收</p>
                                        <p className="text-3xl font-black text-slate-900">${Math.round(totals.net).toLocaleString()}</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-[11px] font-black uppercase tracking-wider opacity-60">所有群組總待付</p>
                                        <p className="text-3xl font-black text-slate-900">${Math.round(Math.abs(totals.net)).toLocaleString()}</p>
                                    </>
                                )}
                            </div>
                            <Link
                                to="/create-group"
                                className="bg-slate-900 text-white rounded-full px-4 py-2 text-sm font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shrink-0"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                建立群組
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">進行中的群組</h3>
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                            {hasData ? `${groups.length} 個活躍中` : '0 個活躍'}
                        </span>
                    </div>

                    {/* Group Cards / Empty State */}
                    <div className="flex flex-col gap-4">
                        {loading ? (
                            <div className="flex justify-center p-10">
                                <span className="material-symbols-outlined animate-spin text-4xl text-primary block">progress_activity</span>
                            </div>
                        ) : !hasData ? (
                            <div className="flex flex-col items-center justify-center p-10 mt-2 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center shadow-sm">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                                    <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>diversity_3</span>
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">還沒有任何群組</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                    建立你的第一個分帳群組<br />把複雜的帳務交給我們吧！
                                </p>
                                <Link
                                    to="/create-group"
                                    className="bg-primary hover:bg-primary/90 text-slate-900 font-bold py-3.5 px-6 rounded-full transition-all shadow-lg shadow-primary/30 flex items-center gap-2 transform hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                    建立第一個群組
                                </Link>
                            </div>
                        ) : (
                            groups.map((group) => {
                                const formattedDate = new Date(group.created_at).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
                                // 計算這個群組裡的所有花費加總
                                const groupTotal = group.expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

                                return (
                                    <Link
                                        key={group.id}
                                        to={`/expense-record/${group.id}`}
                                        className="flex flex-col gap-4 rounded-xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow block text-left"
                                    >
                                        <div className="flex gap-4">
                                            <div className="flex flex-1 flex-col justify-center">
                                                <p className="text-base font-bold text-center">{group.name}</p>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                                                    {formattedDate} • 建立
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4">
                                            <div className="flex flex-col">
                                                <p className="text-xs text-slate-400">群組總花費</p>
                                                <p className="text-lg font-bold text-primary">${groupTotal.toLocaleString()}</p>
                                            </div>
                                            <button className="flex items-center justify-center rounded-full h-10 px-6 bg-primary text-slate-900 text-sm font-bold gap-1 cursor-pointer">
                                                <span>查看詳情</span>
                                                <span className="material-symbols-outlined text-lg block">chevron_right</span>
                                            </button>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Bottom Navigation Bar */}
                <BottomNav />
            </div>
        </div>
    );
};

export default Home;
