import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import LoadingState from '../components/LoadingState';

const GroupCreated: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroupInfo = async () => {
            if (!groupId) return;
            setLoading(true);
            const { data } = await supabase
                .from('groups')
                .select('name')
                .eq('id', groupId)
                .single();

            if (data) {
                setGroupName(data.name);
            }
            setLoading(false);
        };

        fetchGroupInfo();
    }, [groupId]);

    if (loading) {
        return <LoadingState />;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
            <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden max-w-md mx-auto shadow-2xl p-6">
                <div className="flex-1 flex flex-col justify-center items-center w-full mt-12">
                    <div className="size-28 rounded-full bg-primary/20 flex items-center justify-center mb-6 shadow-inner shadow-primary/30 border-2 border-primary/30 animate-success-pop">
                        <Check className="text-primary" size={64} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8 tracking-tight text-center">群組建立成功！</h1>

                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 w-full p-8 flex flex-col items-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 tracking-widest uppercase">群組名稱</p>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{groupName}</h2>
                    </div>
                </div>

                <div className="w-full mt-auto pb-6 pt-12 flex flex-col gap-4">
                    <button
                        onClick={() => navigate(`/add-expense/${groupId}`)}
                        className="w-full bg-primary text-background-dark h-14 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-[#26d67e] transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        <span>立即新增支出</span>
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 h-14 rounded-xl font-bold text-lg shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined">home</span>
                        <span>先回首頁</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupCreated;
