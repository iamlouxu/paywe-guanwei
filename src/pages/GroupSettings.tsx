import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { toast } from 'sonner';

const GroupSettings: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const fetchGroupInfo = async () => {
            if (!groupId) return;
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: groupData } = await supabase
                .from('groups')
                .select('name, created_by')
                .eq('id', groupId)
                .single();

            if (groupData) {
                setGroupName(groupData.name);
                setIsCreator(groupData.created_by === user.id);
            }
            setLoading(false);
        };

        fetchGroupInfo();
    }, [groupId]);

    const handleUpdateName = async () => {
        if (!groupId || !groupName.trim()) return;
        setSaving(true);
        const { error } = await supabase
            .from('groups')
            .update({ name: groupName })
            .eq('id', groupId);

        if (error) {
            toast.error('更新失敗: ' + error.message);
            setSaving(false);
        } else {
            toast.success('群組名稱已更新');
            navigate(`/expense-record/${groupId}`);
        }
    };

    const handleDeleteGroup = async () => {
        if (!groupId) return;

        setSaving(true);

        // Delete all expense_splits in this group's expenses first
        const { data: groupExpenses } = await supabase
            .from('expenses')
            .select('id')
            .eq('group_id', groupId);

        if (groupExpenses && groupExpenses.length > 0) {
            const expenseIds = groupExpenses.map(e => e.id);
            await supabase
                .from('expense_splits')
                .delete()
                .in('expense_id', expenseIds);
        }

        // Delete all expenses in this group
        await supabase.from('expenses').delete().eq('group_id', groupId);

        // Delete all group_members
        await supabase.from('group_members').delete().eq('group_id', groupId);

        // Finally delete the group itself
        const { error } = await supabase.from('groups').delete().eq('id', groupId);

        if (error) {
            toast.error('刪除失敗: ' + error.message);
            setSaving(false);
        } else {
            toast.success('已成功刪除群組');
            navigate('/');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                 <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
            <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-white dark:bg-slate-950">
                <div className="flex items-center p-4 justify-between border-b border-slate-100 dark:border-slate-800">
                    <button onClick={() => navigate(-1)} className="size-12 flex items-center justify-start text-slate-900 dark:text-slate-100">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-lg font-bold">群組設定</h2>
                    <div className="w-12"></div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
                    {/* Edit Group Name Section */}
                    <div className="flex flex-col gap-4">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">群組名稱</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="flex-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border-none px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="群組名稱"
                            />
                            <button
                                onClick={handleUpdateName}
                                disabled={saving}
                                className="bg-primary hover:bg-primary/90 text-slate-900 font-bold px-6 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving ? '...' : '儲存'}
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone - only for creator */}
                    {isCreator && (
                        <>
                            <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

                            <div className="flex flex-col gap-4">
                                <label className="text-sm font-bold text-red-500 uppercase tracking-widest px-1">危險區域</label>

                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={saving}
                                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border border-red-500/20 active:scale-95 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined">delete_forever</span>
                                    刪除群組
                                </button>

                                <p className="text-xs text-slate-400 text-center px-4 leading-relaxed">
                                    刪除群組後，所有帳務紀錄將一併移除且無法復原。只有群組創建者才能執行此操作。
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Custom Delete Modal Overlay */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-[320px] rounded-[32px] p-6 flex flex-col items-center text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-5 mt-2 border-4 border-white dark:border-slate-900 shadow-sm">
                            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: '"FILL" 1' }}>delete</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 leading-tight">確定要刪除群組嗎？</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed px-1">
                            這個動作無法復原。<br/>群組內的所有帳單都將被永久刪除。
                        </p>
                        
                        <div className="flex w-full gap-3">
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                disabled={saving}
                                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-colors active:scale-95"
                            >
                                取消
                            </button>
                            <button 
                                onClick={handleDeleteGroup} 
                                disabled={saving}
                                className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-colors shadow-md shadow-red-500/20 flex justify-center items-center active:scale-95 disabled:opacity-60"
                            >
                                {saving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : '確認刪除'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupSettings;
