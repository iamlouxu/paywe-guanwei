import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import BottomNav from '../components/BottomNav';

type GroupData = {
    id: string;
    name: string;
    created_at: string;
    member_count: number;
    total_expense: number;
    is_settled: boolean;
};

const MyGroups: React.FC = () => {
    const [groups, setGroups] = useState<GroupData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchGroups = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: myGroups, error } = await supabase
                    .from('groups')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && myGroups) {
                    setGroups(myGroups);
                }
            }
            setLoading(false);
        };

        fetchGroups();
    }, []);

    const hasData = groups.length > 0;
    const filteredGroups = groups.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl">
                {/* Sidebar Overlay (hidden by default) */}
                <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm hidden"></div>

                {/* Main */}
                <main className="flex-1 p-6 pb-32 relative w-full">
                    <header className="flex items-center justify-between mb-6">
                        <div className="size-12"></div>
                        <div className="text-center">
                            <h1 className="text-lg font-bold">我的群組</h1>
                        </div>
                        <div className="size-12"></div>
                    </header>

                    {/* Search */}
                    <div className="mb-6 relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        </div>
                        <input
                            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-800 rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-sm"
                            placeholder="搜尋群組..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Group List */}
                    <div className="flex flex-col gap-3">
                        {loading ? (
                            <div className="flex justify-center p-10">
                                <span className="material-symbols-outlined animate-spin text-4xl text-primary block">progress_activity</span>
                            </div>
                        ) : !hasData ? (
                            <div className="flex flex-col items-center justify-center p-10 mt-2 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center shadow-sm">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                                    <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>diversity_3</span>
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">這裡還空空的</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                    你目前還沒有加入任何群組<br />快去建立一個開始記帳吧！
                                </p>
                            </div>
                        ) : filteredGroups.length === 0 && searchQuery ? (
                            <div className="text-center py-6 text-slate-500 text-sm">
                                找不到相關群組
                            </div>
                        ) : (
                            filteredGroups.map((g) => (
                                <Link
                                    key={g.id}
                                    to={`/expense-record/${g.id}`}
                                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-all text-left group hover:border-primary/30 block cursor-pointer"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{g.name}</h3>
                                            {g.is_settled && (
                                                <span className="text-emerald-500 text-[11px] font-bold flex items-center gap-1.5 shrink-0">
                                                    <span className="material-symbols-outlined text-[14px]">verified</span>已結清
                                                </span>
                                            )}
                                        </div>

                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </main>

                {/* Bottom Navigation */}
                <BottomNav />

                {/* FAB */}
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none z-30">
                    <div className="relative h-0">
                        <Link
                            to="/create-group"
                            className="pointer-events-auto absolute right-6 bottom-0 flex size-14 items-center justify-center rounded-2xl bg-primary text-slate-900 shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                        >
                            <span className="material-symbols-outlined font-bold text-[28px]">add</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyGroups;
