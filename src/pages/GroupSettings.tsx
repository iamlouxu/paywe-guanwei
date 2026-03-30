import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import ConfirmBottomSheet from '../components/ConfirmBottomSheet';
import LoadingState from '../components/LoadingState';

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

        // 呼叫特權函式，一次性刪除群組及所有相關資料（繞過 RLS）
        const { error } = await supabase.rpc('delete_group_cascade', {
            group_id_param: groupId,
        });

        if (error) {
            toast.error('刪除失敗: ' + error.message);
            setSaving(false);
        } else {
            toast.success('已成功刪除群組');
            navigate('/');
        }
    };

    if (loading) {
        return <LoadingState />;
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

            <ConfirmBottomSheet
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteGroup}
                loading={saving}
                title="確定要移除群組嗎？"
                description={`這個動作完全無法復原。\n群組內所有的帳務與分攤數據都將永久消失。`}
                confirmText="是的，我要刪除"
                cancelText="考慮一下"
            />
        </div>
    );
};

export default GroupSettings;
