import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import UserAvatar from '../components/UserAvatar';
import type { Profile } from '../types';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { fetchGroups } from '../redux/slices/groupsSlice';

const CreateGroup: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.auth.user);

    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Profile[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<Profile[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [recommendedResults, setRecommendedResults] = useState<Profile[]>([]);

    // 初始抓取推薦成員 (方案 1)
    React.useEffect(() => {
        const fetchRecommended = async () => {
            if (!user) return;

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .neq('id', user.id) // 排除自己
                .limit(10); // 抓多一點點，待會過濾掉已選取的

            if (data) {
                setRecommendedResults(data);
            }
        };
        fetchRecommended();
    }, [user]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .ilike('username', `%${query.trim()}%`)
            .limit(10);

        if (data && user) {
            // 過濾掉自己，以及已經選過的成員
            const selectedIds = selectedMembers.map(m => m.id);
            const filtered = data.filter(p => p.id !== user.id && !selectedIds.includes(p.id));
            setSearchResults(filtered);
        }
        setIsSearching(false);
    };

    const addMember = (profile: Profile) => {
        setSelectedMembers(prev => [...prev, profile]);
        setSearchResults(prev => prev.filter(p => p.id !== profile.id));
        setSearchQuery(''); // 清空搜尋框方便下次搜尋
    };

    const removeMember = (profileId: string) => {
        setSelectedMembers(prev => prev.filter(p => p.id !== profileId));
    };

    const handleCreateGroup = async () => {
        setError('');
        if (!groupName.trim()) {
            setError('請填寫群組名稱');
            return;
        }

        if (selectedMembers.length === 0) {
            setError('請至少加入一位成員才能建立分帳群組');
            return;
        }

        setLoading(true);
        if (!user) {
            setError('無法取得使用者資料，請重新登入');
            setLoading(false);
            return;
        }

        // 2. 建立新群組到 groups 表
        const { data: groupData, error: groupError } = await supabase
            .from('groups')
            .insert({
                name: groupName.trim(),
                created_by: user.id
            })
            .select() // 必須 .select() 才能拿回剛建立的群組 ID
            .single();

        if (groupError) {
            console.error('建立群組失敗:', groupError);
            setError('建立群組失敗，請稍後再試');
            setLoading(false);
            return;
        }

        // 3. 把使用者自己加進 group_members 表
        const { error: memberError } = await supabase
            .from('group_members')
            .insert({
                group_id: groupData.id,
                user_id: user.id
            });

        if (memberError) {
            console.error('加入群組成員失敗:', memberError);
            setError('加入群組成員時發生錯誤');
            setLoading(false);
            return;
        }

        // 4. 把選擇的好友也加進 group_members 表
        if (selectedMembers.length > 0) {
            const extraMembers = selectedMembers.map(m => ({
                group_id: groupData.id,
                user_id: m.id
            }));

            const { error: extraError } = await supabase
                .from('group_members')
                .insert(extraMembers);

            if (extraError) {
                console.error('加入好友失敗:', extraError);
                // 就算失敗我們重點是群組建了，暫不阻擋，但可以記 log
            }
        }

        // 5. 刷新 Redux groups 列表
        dispatch(fetchGroups());

        // 6. 全部成功後導回群組建立成功頁面
        setLoading(false);
        navigate(`/group-created/${groupData.id}`);
    };
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
            <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden max-w-md mx-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-center p-4 pb-2 justify-between">
                    <Link
                        to="/"
                        className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
                        建立新群組
                    </h2>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-4 mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Group Name Input */}
                <div className="flex flex-col gap-4 px-4 py-3">
                    <label className="flex flex-col w-full">
                        <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal pb-2">群組名稱 <span className="text-red-500">*</span></p>
                        <div className="relative group">
                            <input
                                className="w-full h-12 px-4 bg-white dark:bg-slate-800 rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-sm"
                                placeholder="輸入群組名稱 (例如: PayWe 管委會)..."
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                        </div>
                    </label>
                </div>

                {/* Invite Members */}
                <div className="px-4 pb-2 pt-6">
                    <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal pb-2">邀請成員 <span className="text-red-500">*</span></p>
                </div>

                <div className="px-4 py-3">
                    <div className="relative group w-full">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        </div>
                        <input
                            className="w-full h-12 pl-12 pr-10 bg-white dark:bg-slate-800 rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="搜尋成員"
                        />
                        {isSearching && (
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Friends List Container */}
                <div className="px-4 flex flex-col gap-3 flex-1 overflow-y-auto pb-4">


                    {/* 推薦成員 (方案 1) - 當搜尋框為空且未搜尋時顯示 */}
                    {searchQuery.trim() === '' && recommendedResults.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs font-bold text-slate-500 mb-2 px-1">推薦成員</p>
                            <div className="flex flex-col gap-2">
                                {recommendedResults
                                    .filter(r => !selectedMembers.find(m => m.id === r.id)) // 過濾已選取的
                                    .slice(0, 5) // 只顯示前 5 個
                                    .map(member => (
                                        <div key={member.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar src={member.avatar_url} username={member.username} size="lg" />
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-slate-100">{member.username || '未命名'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => addMember(member)}
                                                className="bg-primary/20 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-full font-bold text-sm hover:bg-primary transition-colors cursor-pointer"
                                            >
                                                加入
                                            </button>
                                        </div>
                                    ))}
                                {recommendedResults.filter(r => !selectedMembers.find(m => m.id === r.id)).length === 0 && (
                                    <p className="text-xs text-slate-400 px-1 italic">目前沒有更多推薦成員</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 已選擇名單 (如果有) */}
                    {selectedMembers.length > 0 && (
                        <div className="mb-2">
                            <p className="text-xs font-bold text-slate-500 mb-2 px-1">已選取 ({selectedMembers.length})</p>
                            <div className="flex flex-col gap-2">
                                {selectedMembers.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-3 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar src={member.avatar_url} username={member.username} size="md" />
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-slate-100">{member.username || '未命名'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeMember(member.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 搜尋結果 */}
                    {searchQuery.trim() !== '' && searchResults.length === 0 && !isSearching && (
                        <div className="text-center py-6 text-slate-500 text-sm">
                            找不到相關用戶，請嘗試其他名稱
                        </div>
                    )}

                    {searchResults.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-slate-500 mb-2 px-1">搜尋結果</p>
                            <div className="flex flex-col gap-2">
                                {searchResults.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar src={member.avatar_url} username={member.username} size="lg" />
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-slate-100">{member.username || '未命名'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => addMember(member)}
                                            className="bg-primary/20 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-full font-bold text-sm hover:bg-primary transition-colors cursor-pointer"
                                        >
                                            加入
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="mt-auto p-4 mb-4">
                    <button
                        onClick={handleCreateGroup}
                        disabled={loading}
                        className="w-full bg-primary text-background-dark py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all relative disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <>
                                <span>完成建立</span>
                                <span className="material-symbols-outlined">check_circle</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroup;
