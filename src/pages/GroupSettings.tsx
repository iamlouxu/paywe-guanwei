import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const GroupSettings: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
            alert('更新失敗: ' + error.message);
        } else {
            alert('群組名稱已更新');
        }
        setSaving(false);
    };

    const handleLeaveGroup = async () => {
        if (!groupId) return;
        if (!window.confirm('確定要退出此群組嗎？退出後你將無法再看到此群組的帳務。')) return;

        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('group_members')
            .delete()
            .eq('group_id', groupId)
            .eq('user_id', user.id);

        if (error) {
            alert('退出失敗: ' + error.message);
        } else {
            navigate('/');
        }
        setSaving(false);
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

                    <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

                    {/* Danger Zone */}
                    <div className="flex flex-col gap-4">
                        <label className="text-sm font-bold text-red-500 uppercase tracking-widest px-1">危險區域</label>
                        
                        <button
                            onClick={handleLeaveGroup}
                            disabled={saving}
                            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border border-red-500/20 active:scale-95 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            退出群組
                        </button>

                        <p className="text-xs text-slate-400 text-center px-4 leading-relaxed">
                            退出群組後，你將無法再查看到任何相關的帳務資訊。如果您是群組創建者且群組還有其他成員，建議先轉讓管理權限（目前尚未開放）。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupSettings;
