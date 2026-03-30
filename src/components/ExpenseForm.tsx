import React from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import type { Profile } from '../types';
import { Check } from 'lucide-react';

type ExpenseFormProps = {
    title: string;
    description: string;
    setDescription: (v: string) => void;
    amount: string;
    setAmount: (v: string) => void;
    paidBy: string;
    setPaidBy: (v: string) => void;
    members: Profile[];
    selectedMembers: string[];
    setSelectedMembers: (v: string[] | ((prev: string[]) => string[])) => void;
    onSubmit: () => void;
    loading: boolean;
    submitText: string;
    backPath: string;
};

const ExpenseForm: React.FC<ExpenseFormProps> = ({
    title,
    description,
    setDescription,
    amount,
    setAmount,
    paidBy,
    setPaidBy,
    members,
    selectedMembers,
    setSelectedMembers,
    onSubmit,
    loading,
    submitText,
    backPath
}) => {
    const handleToggleMember = (id: string) => {
        setSelectedMembers(prev => 
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedMembers.length === members.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(members.map(m => m.id));
        }
    };

    return (
        <div className="flex-1 overflow-y-auto pb-32 no-scrollbar px-6 space-y-8 pt-4">
            <div className="flex items-center justify-between mb-2">
                <Link to={backPath} className="text-slate-900 dark:text-slate-100 size-12 flex items-center justify-start transition-transform active:scale-95">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </Link>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold">{title}</h2>
                <div className="w-12"></div>
            </div>

            {/* Description Input */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">消費描述</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">description</span>
                    </div>
                    <input 
                        type="text" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="例如：午餐、家樂福採買..."
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-slate-100 font-bold focus:border-primary focus:ring-0 transition-all outline-none shadow-sm"
                    />
                </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">消費金額</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">payments</span>
                    </div>
                    <input 
                        type="number" 
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-slate-100 font-bold focus:border-primary focus:ring-0 transition-all outline-none shadow-sm text-2xl"
                    />
                </div>
            </div>

            {/* Paid By Selector */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">付款人</label>
                <div className="grid grid-cols-2 gap-3">
                    {members.map((member) => (
                        <button
                            key={`payer-${member.id}`}
                            onClick={() => setPaidBy(member.id)}
                            className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                                paidBy === member.id 
                                ? 'bg-primary/10 border-primary text-slate-900 dark:text-slate-100 shadow-md shadow-primary/10' 
                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-slate-200'
                            }`}
                        >
                            <UserAvatar src={member.avatar_url} username={member.username} size="sm" />
                            <span className="text-sm font-bold truncate">{member.username}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Split With Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">分攤成員</label>
                    <button 
                        onClick={handleSelectAll}
                        className="text-xs font-bold text-primary hover:underline transition-all"
                    >
                        {selectedMembers.length === members.length ? '取消全選' : '全選全部'}
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {members.map((member) => {
                        const isSelected = selectedMembers.includes(member.id);
                        return (
                            <button
                                key={`split-${member.id}`}
                                onClick={() => handleToggleMember(member.id)}
                                className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                                    isSelected 
                                    ? 'bg-white dark:bg-slate-800 border-primary shadow-md' 
                                    : 'bg-slate-50/50 dark:bg-slate-900/50 border-transparent text-slate-400'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <UserAvatar 
                                        src={member.avatar_url} 
                                        username={member.username} 
                                        size="sm" 
                                        className={isSelected ? '' : 'opacity-40 grayscale'} 
                                    />
                                    <span className={`text-sm font-bold truncate ${isSelected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                                        {member.username}
                                    </span>
                                </div>
                                {isSelected && (
                                    <div className="bg-primary size-5 rounded-full flex items-center justify-center">
                                        <Check className="text-slate-900" size={12} strokeWidth={4} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pt-10 max-w-md mx-auto w-full z-20">
                <button 
                    onClick={onSubmit}
                    disabled={loading || !description || !amount || parseFloat(amount) <= 0 || selectedMembers.length === 0}
                    className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                        loading || !description || !amount || parseFloat(amount) <= 0 || selectedMembers.length === 0
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border-2 border-slate-100 dark:border-slate-700'
                        : 'bg-primary text-slate-900 hover:bg-primary/90 shadow-primary/20'
                    }`}
                >
                    {loading ? (
                        <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                    ) : (
                        <><span className="material-symbols-outlined">save</span>{submitText}</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ExpenseForm;
