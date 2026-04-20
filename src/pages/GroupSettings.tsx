import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ConfirmBottomSheet from '../components/ConfirmBottomSheet';
import LoadingState from '../components/LoadingState';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { fetchGroupById, updateGroupName, deleteGroup } from '../redux/slices/groupsSlice';

const GroupSettings: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const user = useAppSelector(state => state.auth.user);
    const { currentGroup, loading: groupLoading } = useAppSelector(state => state.groups);

    const [groupName, setGroupName] = useState('');
    const [saving, setSaving] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (groupId) {
            dispatch(fetchGroupById(groupId));
        }
    }, [groupId, dispatch]);

    // 當 currentGroup 載入完成後，同步到本地狀態
    useEffect(() => {
        if (currentGroup && user) {
            setGroupName(currentGroup.name);
            // GroupData 有 owner_id，但原始碼用 created_by，這裡用 owner_id
            setIsCreator((currentGroup as any).created_by === user.id || currentGroup.owner_id === user.id);
        }
    }, [currentGroup, user]);

    const handleUpdateName = async () => {
        if (!groupId || !groupName.trim()) return;
        setSaving(true);
        try {
            await dispatch(updateGroupName({ groupId, name: groupName })).unwrap();
            toast.success('群組名稱已更新');
            navigate(`/expense-record/${groupId}`);
        } catch (error: any) {
            toast.error('更新失敗: ' + (error.message || error));
            setSaving(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (!groupId) return;
        setSaving(true);
        try {
            await dispatch(deleteGroup(groupId)).unwrap();
            toast.success('已成功刪除群組');
            navigate('/');
        } catch (error: any) {
            toast.error('刪除失敗: ' + (error.message || error));
            setSaving(false);
        }
    };

    if (groupLoading) {
        return <LoadingState />;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
            <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-white dark:bg-slate-950">
                <div className="flex items-center p-4 justify-between border-b border-slate-100 dark:border-slate-800">
                    <button onClick={() => navigate(-1)} className="size-12 flex items-center justify-start text-slate-900 dark:text-slate-100 cursor-pointer">
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
                                className="bg-primary hover:bg-primary/90 text-slate-900 font-bold px-6 rounded-2xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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
                                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border border-red-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
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
