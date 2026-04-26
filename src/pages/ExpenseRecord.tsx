import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ConfirmBottomSheet from '../components/ConfirmBottomSheet';
import LoadingState from '../components/LoadingState';
import UserAvatar from '../components/UserAvatar';
import PageLayout from '../components/PageLayout';
import SummaryBanner from '../components/SummaryBanner';
import ExpenseListItem from '../components/ExpenseListItem';
import { formatCurrency } from '../utils/formatters';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { fetchGroupById, settleGroup } from '../redux/slices/groupsSlice';
import { fetchExpenses, deleteExpense } from '../redux/slices/expensesSlice';

const ExpenseRecord: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const user = useAppSelector(state => state.auth.user);
    const { currentGroup: group, loading: groupLoading } = useAppSelector(state => state.groups);
    const { list: expenses, totalExpense, owesMe, iOwe, loading: loadingExpenses } = useAppSelector(state => state.expenses);

    const [settlingGroup, setSettlingGroup] = useState(false);

    // Modals
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSettleModal, setShowSettleModal] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (groupId) {
            dispatch(fetchGroupById(groupId));
            dispatch(fetchExpenses(groupId));
        }
    }, [groupId, dispatch]);

    const handleSettleGroup = async () => {
        if (!groupId) return;
        setSettlingGroup(true);
        try {
            await dispatch(settleGroup(groupId)).unwrap();
            toast.success('群組已永久結清！');
            setShowSettleModal(false);
        } catch (error: any) {
            toast.error(`結清群組失敗: ${error.message || error}`);
        }
        setSettlingGroup(false);
    };

    const handleDeleteExpense = async () => {
        if (!expenseToDelete) return;
        setDeleting(true);
        try {
            await dispatch(deleteExpense(expenseToDelete)).unwrap();
            toast.success('已刪除帳務紀錄');
            setShowDeleteModal(false);
            setExpenseToDelete(null);
        } catch (err: any) {
            toast.error(`刪除失敗: ${err.message || err}`);
        } finally {
            setDeleting(false);
        }
    };

    if (groupLoading) return <LoadingState />;

    const isGroupSettled = group?.is_settled || false;

    const bannerStatus = (
        <>
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
                                {item.name} 欠你 <span className="text-primary">${formatCurrency(item.amount)}</span>
                            </p>
                        </div>
                    ))}
                    {iOwe.map((item) => (
                        <div key={`i-owe-${item.id}`} className="flex items-center gap-3 bg-white dark:bg-slate-800 pl-2 pr-4 py-2 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm transition-transform active:scale-95">
                            <UserAvatar src={item.avatar_url} username={item.name} size="sm" />
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                你欠 {item.name} <span className="text-primary">${formatCurrency(item.amount)}</span>
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    const header = (
        <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10">
            <Link to="/" className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start cursor-pointer transition-transform active:scale-95">
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </Link>
            <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">PayWe 管委</span>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">群組帳務明細</h2>
            </div>
            <Link to={`/group-settings/${groupId}`} className="flex w-12 items-center justify-end cursor-pointer text-slate-900 dark:text-slate-100 transition-transform active:scale-95">
                <span className="material-symbols-outlined text-2xl">settings</span>
            </Link>
        </div>
    );

    return (
        <PageLayout header={header}>
            <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
                <SummaryBanner 
                    title="群組總消費" 
                    amount={totalExpense} 
                    statusContent={bannerStatus}
                />

                <div className="px-6">
                    <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight pb-4">帳務紀錄</h3>
                    <div className="flex flex-col gap-4">
                        {loadingExpenses ? (
                            <div className="flex justify-center py-10">
                                <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                            </div>
                        ) : expenses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">目前沒有任何帳單</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[220px] leading-relaxed">
                                    點擊下方的新增按鈕<br/>開始記錄群組的第一筆花費吧！
                                </p>
                            </div>
                        ) : (
                            expenses.map((item) => (
                                <ExpenseListItem 
                                    key={item.id}
                                    expense={item}
                                    isMe={item.paid_by === user?.id}
                                    isGroupSettled={isGroupSettled}
                                    onEdit={() => navigate(`/edit-expense/${groupId}/${item.id}`)}
                                    onDelete={() => { setExpenseToDelete(item.id); setShowDeleteModal(true); }}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pt-10 max-w-md mx-auto w-full">
                {isGroupSettled ? (
                    <div className="flex gap-3 pointer-events-auto items-center w-full">
                        <button disabled className="w-full text-center bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold py-4 rounded-2xl border border-slate-300 dark:border-slate-600 cursor-not-allowed transition-all">
                            該群組已結清
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-3 pointer-events-auto items-center">
                        <button 
                            onClick={() => expenses.length > 0 ? setShowSettleModal(true) : toast.error('目前沒有帳務紀錄，無法結算')} 
                            disabled={settlingGroup || expenses.length === 0}
                            className={`flex-1 text-center font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer ${
                                settlingGroup || expenses.length === 0
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-primary text-slate-900 shadow-primary/20 hover:bg-primary/90'
                            }`}
                        >
                            {settlingGroup ? (
                                <><span className="material-symbols-outlined animate-spin text-lg">refresh</span>正在結算...</>
                            ) : '結算清單'}
                        </button>
                        <Link to={`/add-expense/${groupId}`} className="size-14 bg-primary text-slate-900 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center hover:bg-primary/90 transition-all active:scale-[0.98] cursor-pointer">
                            <span className="material-symbols-outlined text-3xl font-bold">add</span>
                        </Link>
                    </div>
                )}
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
        </PageLayout>
    );
};

export default ExpenseRecord;
