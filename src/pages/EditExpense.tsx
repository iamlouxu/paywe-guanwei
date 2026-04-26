import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import LoadingState from '../components/LoadingState';
import PageLayout from '../components/PageLayout';
import ExpenseForm from '../components/ExpenseForm';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { fetchGroupMembers } from '../redux/slices/groupsSlice';
import { editExpense } from '../redux/slices/expensesSlice';

const EditExpense: React.FC = () => {
    const { groupId, expenseId } = useParams<{ groupId: string; expenseId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const reduxMembers = useAppSelector(state => state.groups.members);
    const loadingMembers = useAppSelector(state => state.groups.membersLoading);
    const members = reduxMembers.map(m => ({
        id: m.id,
        username: m.username || '未命名使用者',
        avatar_url: m.avatar_url ?? null,
    }));

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingExpense, setFetchingExpense] = useState(true);

    useEffect(() => {
        if (groupId) {
            dispatch(fetchGroupMembers(groupId));
        }
    }, [groupId, dispatch]);

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
            await dispatch(editExpense({
                expenseId,
                description,
                amount: parseFloat(amount),
                paidBy,
                selectedMembers,
            })).unwrap();

            toast.success('已成功更新花費！');
            navigate(`/expense-record/${groupId}`);
        } catch (err: any) {
            toast.error(`更新失敗: ${err.message || err}`);
        } finally {
            setLoading(false);
        }
    };

    if (loadingMembers || fetchingExpense || members.length === 0) return <LoadingState />;

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
