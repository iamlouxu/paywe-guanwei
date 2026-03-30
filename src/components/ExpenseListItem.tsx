import React from 'react';
import { ActionMenu, ActionMenuItem } from './ActionMenu';
import { Pencil, Trash2 } from 'lucide-react';
import { formatRelativeTime, formatCurrency } from '../utils/formatters';
import type { Expense } from '../types';

type ExpenseListItemProps = {
    expense: Expense;
    isMe: boolean;
    isGroupSettled: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
};

const ExpenseListItem: React.FC<ExpenseListItemProps> = ({
    expense,
    isMe,
    isGroupSettled,
    onEdit,
    onDelete
}) => {
    // 使用 optional chaining 與 fallback 來確保安全性
    const payerName = expense.payer_name || '某人';
    const payerText = isMe ? '你支付' : `${payerName} 支付`;

    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm group">
            <div className="flex flex-col flex-1 min-w-0">
                <p className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{expense.description}</p>
                <p className="text-xs font-medium text-slate-500">{payerText} • {formatRelativeTime(expense.created_at)}</p>
            </div>
            <div className="flex flex-col items-end shrink-0 ml-3">
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">${formatCurrency(expense.amount)}</p>
            </div>
            <div className="w-10 flex justify-center shrink-0 ml-1">
                {isMe && !isGroupSettled && (
                    <ActionMenu>
                        {onEdit && (
                            <ActionMenuItem 
                                icon={<Pencil size={16} />} 
                                label="編輯紀錄" 
                                onClick={onEdit} 
                            />
                        )}
                        {onDelete && (
                            <ActionMenuItem 
                                icon={<Trash2 size={16} />} 
                                label="刪除這筆" 
                                variant="danger" 
                                onClick={onDelete} 
                            />
                        )}
                    </ActionMenu>
                )}
            </div>
        </div>
    );
};

export default ExpenseListItem;
