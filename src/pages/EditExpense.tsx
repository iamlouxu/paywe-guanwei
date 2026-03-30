import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import LoadingState from '../components/LoadingState';
import PageLayout from '../components/PageLayout';
import ExpenseForm from '../components/ExpenseForm';
import { useGroupMembers } from '../hooks/useGroupMembers';

const EditExpense: React.FC = () => {
    const { groupId, expenseId } = useParams<{ groupId: string; expenseId: string }>();
    const navigate = useNavigate();
    const { members, loading: loadingMembers } = useGroupMembers(groupId);

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingExpense, setFetchingExpense] = useState(true);

    useEffect(() => {
        const fetchExpenseData = async () => {
            if (!expenseId) return;
            setFetchingExpense(true);
            try {
                const { data: expense, error: expError } = await supabase
                    .from('expenses')
                    .select('*')
                    .eq('id', expenseId)
                    .single();

                if (expError) throw expError;
                if (expense) {
                    setDescription(expense.description);
                    setAmount(expense.amount.toString());
                    setPaidBy(expense.paid_by);

                    const { data: splits, error: splitError } = await supabase
                        .from('expense_splits')
                        .select('user_id')
                        .eq('expense_id', expenseId);

                    if (splitError) throw splitError;
                    if (splits) {
                        setSelectedMembers(splits.map((s) => s.user_id));
                    }
                }
            } catch (err: any) {
                toast.error(`獲取帳務資料失敗: ${err.message}`);
                navigate(`/group/${groupId}`);
            } finally {
                setFetchingExpense(false);
            }
        };

        fetchExpenseData();
    }, [expenseId, groupId, navigate]);

    const handleEditExpense = async () => {
        if (!expenseId || !groupId || !description || !amount || selectedMembers.length === 0) {
            toast.error('請填寫完整資訊');
            return;
        }

        setLoading(true);
        try {
            const numAmount = parseFloat(amount);
            
            // 1. Update expense
            const { error: expenseError } = await supabase
                .from('expenses')
                .update({
                    description,
                    amount: numAmount,
                    paid_by: paidBy
                })
                .eq('id', expenseId);

            if (expenseError) throw expenseError;

            // 2. Refresh splits (delete and insert)
            const { error: deleteError } = await supabase
                .from('expense_splits')
                .delete()
                .eq('expense_id', expenseId);

            if (deleteError) throw deleteError;

            const splitAmount = numAmount / selectedMembers.length;
            const splits = selectedMembers.map(userId => ({
                expense_id: expenseId,
                user_id: userId,
                amount: splitAmount
            }));

            const { error: splitError } = await supabase
                .from('expense_splits')
                .insert(splits);

            if (splitError) throw splitError;

            toast.success('已成功更新花費！');
            navigate(`/group/${groupId}`);
        } catch (err: any) {
            toast.error(`更新失敗: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loadingMembers || fetchingExpense) return <LoadingState />;

    return (
        <PageLayout>
            <ExpenseForm 
                title="編輯花費"
                description={description}
                setDescription={setDescription}
                amount={amount}
                setAmount={setAmount}
                paidBy={paidBy}
                setPaidBy={setPaidBy}
                members={members}
                selectedMembers={selectedMembers}
                setSelectedMembers={setSelectedMembers}
                onSubmit={handleEditExpense}
                loading={loading}
                submitText="更新花費紀錄"
                backPath={`/group/${groupId}`}
            />
        </PageLayout>
    );
};

export default EditExpense;
