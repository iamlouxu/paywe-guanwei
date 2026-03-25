import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabase';

interface MemberBalance {
    id: string;
    username: string;
    avatar_url: string;
    balance: number; // 正數代表別人欠他，負數代表他欠別人
}

const Settlement: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const [groupName, setGroupName] = useState('載入中...');
    const [memberBalances, setMemberBalances] = useState<MemberBalance[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserBalance, setCurrentUserBalance] = useState({ owe: 0, get: 0 });

    // Default avatar
    const defaultAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHgf4ZSTbfx30JuEq6fJ2cfKn69_NExuDWSHrVAKZ7EfcCI7nCaZYT8Z4D-qLx4kffBNPTHRcbGGVyPoikJyM_eGHNr7cGU0Frs0Er1it8GKhnew55mkFlAH87uinZCMkULcwHYgsOmN6Vqedk6VrBdcNL2DURQUQ5eqJpmUhm2-8reDbQFGohegnlUlyc7M6_fIOhDXlOH6EZMSYKyXpKfHvgekiju09S8yc4AyFLgYlw2ZurR4mUUYB9f2KNIT3oBPvFNEPKwg';

    useEffect(() => {
        const calculateBalances = async () => {
            if (!groupId) return;
            setLoading(true);

            // 1. 取得當前使用者
            const { data: { user } } = await supabase.auth.getUser();

            // 2. 獲取群組名稱
            const { data: groupData } = await supabase
                .from('groups')
                .select('name')
                .eq('id', groupId)
                .single();

            if (groupData) {
                setGroupName(groupData.name);
            }

            // 3. 獲取所有成員 profiles
            const { data: memberData } = await supabase
                .from('group_members')
                .select('user_id, profiles(id, username, avatar_url)')
                .eq('group_id', groupId);

            if (!memberData) return;

            const initialBalances: Record<string, MemberBalance> = {};
            memberData.forEach((m: any) => {
                const profile = m.profiles;
                initialBalances[profile.id] = {
                    id: profile.id,
                    username: profile.username || '未命名',
                    avatar_url: profile.avatar_url || defaultAvatar,
                    balance: 0
                };
            });

            // 4. 獲取所有花費與分細
            const { data: expenses } = await supabase
                .from('expenses')
                .select('id, amount, paid_by')
                .eq('group_id', groupId);

            if (expenses && expenses.length > 0) {
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
            }

            const balanceList = Object.values(initialBalances);
            setMemberBalances(balanceList);

            // 計算目前使用者的收支
            if (user) {
                const myData = initialBalances[user.id];
                if (myData) {
                    setCurrentUserBalance({
                        owe: myData.balance < 0 ? Math.abs(myData.balance) : 0,
                        get: myData.balance > 0 ? myData.balance : 0
                    });
                }
            }

            setLoading(false);
        };

        calculateBalances();
    }, [groupId]);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col justify-center max-w-md mx-auto shadow-2xl relative">
            <div className="absolute inset-0 flex flex-col h-full w-full">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
                    <div className="flex items-center p-4 justify-between">
                        <Link
                            to="/"
                            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">
                                arrow_back
                            </span>
                        </Link>
                        <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">
                            結算與餘額狀態
                        </h1>
                        <div className="flex w-10 items-center justify-end">
                            <button className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-transparent hover:bg-primary/10 transition-colors">
                                <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">
                                    history
                                </span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto pb-24">
                    {/* Mascot Summary Card */}
                    <div className="p-4">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-6 border border-primary/20">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                                        {groupName}
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                        目前整體的收支平衡摘要，所有帳務一目了然。
                                    </p>
                                    <div className="mt-4 flex gap-2">
                                        <span className="px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full text-xs font-semibold text-primary">
                                            已更新至今日
                                        </span>
                                    </div>
                                </div>
                                <div className="relative size-24 shrink-0 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl"></div>
                                    {/* Mascot Placeholder Illustration */}
                                    <div
                                        className="relative z-10 w-full h-full bg-contain bg-center bg-no-repeat"
                                        data-alt="A cute friendly mascot holding a calculator and a coin"
                                        style={{
                                            backgroundImage:
                                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBn2MeE0VTM4kDXhLhi1qOKMqxb3xLiDYV7wV9m8jGm4KMrdZqlAj9LCRYTAmoYMZG21Lhea74XZzyC_8dzjYSvX8clzg2skkYeKQr_iDJTC3P_fppPUUqGm0WOjhT_c5D5pW0wV3eZ6XfE76jaA4w573zjU8ZZSzyR4mn8vaz1JciLhQ_JTre5MTWqEp1IJouXMVvcSloTBT2j4NH3R-5QTJ5K43oMb09DaoNcUHbPTZG7vax1ORrnOYi7EmuhmG2TtjiGFf_XXw")',
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Tabs */}
                    <div className="px-4">
                        <div className="flex border-b border-slate-200 dark:border-slate-800">
                            <button className="flex-1 flex flex-col items-center justify-center border-b-4 border-primary text-slate-900 dark:text-slate-100 pb-3 pt-2 transition-all">
                                <span className="text-sm font-bold text-red-500">待付款</span>
                                <span className="text-xs text-slate-400 font-medium">${currentUserBalance.owe.toLocaleString()}</span>
                            </button>
                            <button className="flex-1 flex flex-col items-center justify-center border-b-4 border-transparent text-slate-500 dark:text-slate-400 pb-3 pt-2 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold text-green-500">待收款</span>
                                <span className="text-xs text-slate-400 font-medium">${currentUserBalance.get.toLocaleString()}</span>
                            </button>
                        </div>
                    </div>

                    {/* Settlement List Section */}
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold leading-tight">結算清單</h2>
                            <button className="text-primary text-sm font-semibold flex items-center gap-1">
                                查看報表{' '}
                                <span className="material-symbols-outlined text-sm">
                                    chevron_right
                                </span>
                            </button>
                        </div>
                        {/* List Items or Empty State */}
                        <div className="space-y-3">
                            {loading ? (
                                <div className="flex justify-center p-10">
                                    <span className="material-symbols-outlined animate-spin text-4xl text-primary block">progress_activity</span>
                                </div>
                            ) : memberBalances.every(m => Math.abs(m.balance) < 0.01) ? (
                                <div className="flex flex-col items-center justify-center p-10 mt-2 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center shadow-sm">
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                                        <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>account_balance_wallet</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">皆已結清！</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                        目前沒有需要結算的帳務。<br />大家互不相欠～
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {memberBalances
                                        .filter(m => Math.abs(m.balance) > 0.01)
                                        .sort((a, b) => b.balance - a.balance)
                                        .map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="size-12 rounded-full bg-cover bg-center border-2 border-primary/20"
                                                        style={{ backgroundImage: `url('${member.avatar_url}')` }}
                                                    ></div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-slate-100">{member.username}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {member.balance > 0 ? '應收金額' : '應付金額'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-lg font-black ${member.balance > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {member.balance > 0 ? '+' : ''}${Math.abs(Math.round(member.balance)).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detailed Action */}
                    <div className="p-4">
                        <button className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined">payments</span>
                            發起一鍵結算
                        </button>
                    </div>
                </main>

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] mx-auto max-w-md w-full">
                    <div className="flex items-center justify-around h-16 w-full">
                        <Link
                            to="/"
                            className="flex flex-col items-center gap-1 text-slate-400"
                        >
                            <span className="material-symbols-outlined">home</span>
                            <span className="text-[10px] font-medium">首頁</span>
                        </Link>
                        <a className="flex flex-col items-center gap-1 text-slate-400" href="#">
                            <span className="material-symbols-outlined">receipt_long</span>
                            <span className="text-[10px] font-medium">帳單</span>
                        </a>
                        <Link
                            to={`/settlement/${groupId}`}
                            className="flex flex-col items-center gap-1 text-primary"
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                account_balance_wallet
                            </span>
                            <span className="text-[10px] font-bold">結算</span>
                        </Link>
                        <a className="flex flex-col items-center gap-1 text-slate-400" href="#">
                            <span className="material-symbols-outlined">settings</span>
                            <span className="text-[10px] font-medium">設定</span>
                        </a>
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default Settlement;
