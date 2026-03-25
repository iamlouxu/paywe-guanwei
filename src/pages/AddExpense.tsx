import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';

interface Member {
    id: string;
    username: string;
}

const AddExpense: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [members, setMembers] = useState<Member[]>([]);
    
    // 預設付錢的人是自己
    const [paidBy, setPaidBy] = useState<string>('');
    // 預設分攤的人是全部人
    const [splitUsers, setSplitUsers] = useState<string[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchMembersAndUser = async () => {
            if (!groupId) return;

            // 1. 取得當前使用者ID
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setPaidBy(user.id);
            }

            // 2. 獲取群組成員
            const { data: groupMembers } = await supabase
                .from('group_members')
                .select('user_id')
                .eq('group_id', groupId);

            if (groupMembers && groupMembers.length > 0) {
                const userIds = groupMembers.map((m) => m.user_id);
                
                // 3. 獲取成員的 Profile
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, username')
                    .in('id', userIds);

                if (profiles) {
                    const formatMembers = profiles.map(p => ({
                        id: p.id,
                        username: p.username || '未命名使用者'
                    }));
                    setMembers(formatMembers);
                    setSplitUsers(userIds); // 預設全選
                }
            }
            setLoading(false);
        };

        fetchMembersAndUser();
    }, [groupId]);

    const handleSplitCheck = (userId: string) => {
        setSplitUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        const numericAmount = Number(amount);
        if (!numericAmount || numericAmount <= 0) {
            setErrorMsg('請輸入大於 0 的有效金額');
            return;
        }
        if (!description.trim()) {
            setErrorMsg('請輸入花費項目');
            return;
        }
        if (splitUsers.length === 0) {
            setErrorMsg('請至少選擇一位分攤人');
            return;
        }

        setSubmitting(true);
        try {
            // 1. 新增主要花費紀錄
            const { data: expenseRecord, error: expenseError } = await supabase
                .from('expenses')
                .insert({
                    group_id: groupId,
                    paid_by: paidBy,
                    amount: numericAmount,
                    description: description.trim()
                })
                .select()
                .single();

            if (expenseError || !expenseRecord) {
                throw new Error(expenseError?.message || '建立花費失敗');
            }

            // 2. 計算平均分攤金額
            // 為了簡化 MVP，這裡我們先做最簡單的平分（會有小數點進位問題，實務上會有餘數分配機制，這裡暫不處理複雜情境）
            const splitAmount = Math.round((numericAmount / splitUsers.length) * 100) / 100;

            // 3. 新增分攤明細
            const splitsData = splitUsers.map(uid => ({
                expense_id: expenseRecord.id,
                user_id: uid,
                amount: splitAmount
            }));

            const { error: splitsError } = await supabase
                .from('expense_splits')
                .insert(splitsData);

            if (splitsError) {
                throw new Error(splitsError.message);
            }

            // 成功後返回帳務明細頁
            navigate(`/expense-record/${groupId}`);
        } catch (err: any) {
            setErrorMsg(err.message || '發生未知錯誤');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-center p-4 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-slate-100 dark:border-slate-800">
                    <Link
                        to={`/expense-record/${groupId}`}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </Link>
                    <h2 className="text-lg font-bold flex-1 text-center">新增一筆花費</h2>
                    <div className="w-10"></div>
                </div>

                {/* Form Area */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 overflow-y-auto">
                    
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-2">
                            <span className="material-symbols-outlined text-[20px]">error</span>
                            <p>{errorMsg}</p>
                        </div>
                    )}

                    {/* Amount Input */}
                    <div className="flex flex-col items-center justify-center mb-10 mt-4">
                        <p className="text-sm font-bold text-slate-500 mb-2">請輸入金額</p>
                        <div className="flex items-center justify-center gap-1 w-full relative">
                            <span className="text-3xl font-bold text-primary absolute left-10">$</span>
                            <input
                                type="number"
                                autoFocus
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                className="w-full text-center text-6xl font-black bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-700 p-0"
                            />
                        </div>
                    </div>

                    {/* Description Input */}
                    <div className="mb-6 gap-2 flex flex-col">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 px-1">項目名稱</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="例如：晚餐、計程車、電影票"
                            className="w-full h-14 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-900 dark:text-slate-100 shadow-sm"
                        />
                    </div>

                    {/* Paid By Selection */}
                    <div className="mb-6 gap-2 flex flex-col">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 px-1">誰付的錢？</label>
                        <div className="relative">
                            <select
                                value={paidBy}
                                onChange={(e) => setPaidBy(e.target.value)}
                                className="w-full h-14 px-4 pr-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-900 dark:text-slate-100 shadow-sm appearance-none"
                            >
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>{m.username}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_content</span>
                        </div>
                    </div>

                    {/* Split Between */}
                    <div className="mb-10 gap-3 flex flex-col">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">誰要一起平分？</label>
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">{splitUsers.length} 人參與</span>
                        </div>
                        <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            {members.map((m, index) => {
                                const isChecked = splitUsers.includes(m.id);
                                return (
                                    <label 
                                        key={m.id} 
                                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${index !== members.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-slate-500">person</span>
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-slate-100">{m.username}</span>
                                        </div>
                                        <div className={`size-6 rounded-md border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                                            {isChecked && <span className="material-symbols-outlined text-[16px] text-white font-bold">check</span>}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={isChecked} 
                                            onChange={() => handleSplitCheck(m.id)}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Padding */}
                    <div className="h-24"></div>
                    
                    {/* Fixed Submit Button */}
                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pt-10 max-w-md mx-auto pointer-events-none">
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className={`w-full bg-primary text-slate-900 font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all pointer-events-auto ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 active:scale-[0.98]'}`}
                        >
                            {submitting ? (
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined font-bold">check</span>
                                    <span>確認新增 (${amount ? Number(amount).toLocaleString() : 0})</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExpense;
