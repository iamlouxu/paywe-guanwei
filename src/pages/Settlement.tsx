import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import LoadingState from '../components/LoadingState';
import UserAvatar from '../components/UserAvatar';
import PageLayout from '../components/PageLayout';
import SummaryBanner from '../components/SummaryBanner';
import { formatCurrency } from '../utils/formatters';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { fetchGroupById } from '../redux/slices/groupsSlice';
import { fetchSettlement } from '../redux/slices/expensesSlice';

const Settlement: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const dispatch = useAppDispatch();

    const { currentGroup: group, loading: groupLoading } = useAppSelector(state => state.groups);
    const { transactions, totalExpense, loading } = useAppSelector(state => state.expenses);

    useEffect(() => {
        if (groupId) {
            dispatch(fetchGroupById(groupId));
            dispatch(fetchSettlement(groupId));
        }
    }, [groupId, dispatch]);

    if (groupLoading || loading) return <LoadingState />;

    const isGroupSettled = group?.is_settled || false;

    const bannerStatus = (
        <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-full border border-primary/30 shadow-sm backdrop-blur-sm mt-1">
            <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {transactions.length === 0 ? '目前沒有待處理帳務' : `共需進行 ${transactions.length} 筆轉帳`}
            </p>
        </div>
    );

    const header = (
        <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10">
            <Link to={`/group/${groupId}`} className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start cursor-pointer transition-transform active:scale-95">
                <span className="material-symbols-outlined text-2xl font-bold">arrow_back</span>
            </Link>
            <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">PayWe 管委</span>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">結算清單</h2>
            </div>
            <div className="w-12"></div>
        </div>
    );

    return (
        <PageLayout header={header}>
            <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
                <SummaryBanner 
                    title="群組總花費" 
                    amount={totalExpense} 
                    statusContent={bannerStatus}
                />

                <div className="px-6 space-y-6">
                    {transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-white/50 dark:bg-slate-800/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-700 shadow-inner">
                            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
                            </div>
                            <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-3 tracking-tight">太棒了！帳務已清空</h4>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-[240px] leading-relaxed">
                                目前沒有任何未結清的款項<br />
                                大家都是好室友/好旅伴 ❤️
                            </p>
                            {isGroupSettled && (
                                <div className="mt-8 bg-primary/10 border border-primary/20 px-6 py-4 rounded-2xl">
                                    <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">此群組已永久結清 ✅</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2 px-1">
                                <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">轉帳指引</h3>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                    Simplification Active
                                </div>
                            </div>
                            
                            <div className="grid gap-4">
                                {transactions.map((trans, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md group">
                                        <div className="p-5 flex items-center justify-between relative">
                                            {/* From User */}
                                            <div className="flex flex-col items-center gap-2 flex-1 z-10">
                                                <UserAvatar src={trans.from.avatar_url} username={trans.from.username} size="md" />
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{trans.from.username}</p>
                                            </div>

                                            {/* Transfer Amount */}
                                            <div className="flex flex-col items-center gap-1 flex-1 z-10 px-2">
                                                <div className="text-slate-300 dark:text-slate-600 mb-[-8px] group-hover:text-primary/40 transition-colors">
                                                    <span className="material-symbols-outlined text-3xl font-light">trending_flat</span>
                                                </div>
                                                <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                                    <p className="text-sm font-black text-primary">${formatCurrency(trans.amount)}</p>
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Transfer to</p>
                                            </div>

                                            {/* To User */}
                                            <div className="flex flex-col items-center gap-2 flex-1 z-10">
                                                <UserAvatar src={trans.to.avatar_url} username={trans.to.username} size="md" />
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{trans.to.username}</p>
                                            </div>
                                            
                                            {/* Background Decoration */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => toast.info('結清動作請回到明細頁面執行錄')}
                                className="w-full py-4 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-xl active:scale-95 transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">info</span>
                                如何結清群組？
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default Settlement;
