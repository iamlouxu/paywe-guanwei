import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../supabase';
import type { Expense, Transaction, MemberBalance } from '../../types';

// ---- Types ----
type BalanceItem = {
  id: string;
  name: string;
  amount: number;
  avatar_url: string;
};

type ExpensesState = {
  list: Expense[];
  totalExpense: number;
  owesMe: BalanceItem[];
  iOwe: BalanceItem[];
  transactions: Transaction[];
  loading: boolean;
};

// ---- Helper ----

/** 計算最簡化結算交易 */
function calculateSettlement(balances: MemberBalance[]): Transaction[] {
  const debtors = balances
    .filter((m) => m.balance < -0.01)
    .map((m) => ({ ...m, balance: Math.abs(m.balance) }))
    .sort((a, b) => b.balance - a.balance);

  const creditors = balances
    .filter((m) => m.balance > 0.01)
    .sort((a, b) => b.balance - a.balance);

  const trans: Transaction[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const amount = Math.min(debtor.balance, creditor.balance);

    trans.push({ from: debtor, to: creditor, amount });

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance <= 0.01) dIdx++;
    if (creditor.balance <= 0.01) cIdx++;
  }
  return trans;
}

// ---- Thunks ----

/** 取得群組費用 + 計算餘額 */
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (groupId: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    // 1. 取得費用列表
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (expenseError) throw expenseError;

    let expenses: Expense[] = expenseData || [];
    const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // 2. 附加付款人名稱
    const payerIds = Array.from(new Set(expenses.map((e) => e.paid_by))).filter(Boolean);
    if (payerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', payerIds);

      expenses = expenses.map((exp) => ({
        ...exp,
        payer_name: profiles?.find((p) => p.id === exp.paid_by)?.username || '某人',
      }));
    }

    // 3. 計算使用者餘額
    let owesMe: BalanceItem[] = [];
    let iOwe: BalanceItem[] = [];

    if (user && expenses.length > 0) {
      const expenseIds = expenses.map(e => e.id);
      const { data: splits } = await supabase
        .from('expense_splits')
        .select('amount, expense_id, user_id')
        .in('expense_id', expenseIds);

      if (splits) {
        const userBalances: Record<string, number> = {};
        expenses.forEach((exp) => {
          const expSplits = splits.filter((s) => s.expense_id === exp.id);
          if (exp.paid_by === user.id) {
            expSplits.forEach((s) => {
              if (s.user_id !== user.id) {
                userBalances[s.user_id] = (userBalances[s.user_id] || 0) + Number(s.amount);
              }
            });
          } else {
            const mySplit = expSplits.find((s) => s.user_id === user.id);
            if (mySplit) {
              userBalances[exp.paid_by] = (userBalances[exp.paid_by] || 0) - Number(mySplit.amount);
            }
          }
        });

        const targetUserIds = Object.keys(userBalances).filter((id) => Math.abs(userBalances[id]) > 0.01);
        if (targetUserIds.length > 0) {
          const { data: targetProfiles } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', targetUserIds);

          targetUserIds.forEach((id) => {
            const amount = userBalances[id];
            const profile = targetProfiles?.find((p) => p.id === id);
            if (amount > 0.01) {
              owesMe.push({ id, name: profile?.username || '某人', amount, avatar_url: profile?.avatar_url || '' });
            } else if (amount < -0.01) {
              iOwe.push({ id, name: profile?.username || '某人', amount: Math.abs(amount), avatar_url: profile?.avatar_url || '' });
            }
          });
        }
      }
    }

    return { expenses, total, owesMe, iOwe };
  }
);

/** 計算結算交易 */
export const fetchSettlement = createAsyncThunk(
  'expenses/fetchSettlement',
  async (groupId: string) => {
    // 1. 取得群組成員
    const { data: memberData } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);

    if (!memberData || memberData.length === 0) return { transactions: [], total: 0 };

    const memberUserIds = memberData.map((m) => m.user_id).filter(Boolean);
    if (memberUserIds.length === 0) return { transactions: [], total: 0 };

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', memberUserIds);

    const memberBalances: Record<string, MemberBalance> = {};
    profilesData?.forEach((profile) => {
      memberBalances[profile.id] = {
        id: profile.id,
        username: profile.username || '未命名',
        avatar_url: profile.avatar_url || '',
        balance: 0,
      };
    });

    // 2. 取得費用 + splits
    const { data: expenseData } = await supabase
      .from('expenses')
      .select('*')
      .eq('group_id', groupId);

    let total = 0;

    if (expenseData && expenseData.length > 0) {
      total = expenseData.reduce((sum, exp) => sum + Number(exp.amount), 0);

      const expenseIds = expenseData.map(e => e.id);
      const { data: splitsData } = await supabase
        .from('expense_splits')
        .select('amount, expense_id, user_id')
        .in('expense_id', expenseIds);

      if (splitsData) {
        expenseData.forEach((exp: Expense) => {
          if (memberBalances[exp.paid_by]) {
            memberBalances[exp.paid_by].balance += Number(exp.amount);
          }
          const expSplits = splitsData.filter((s) => s.expense_id === exp.id);
          expSplits.forEach((s) => {
            if (memberBalances[s.user_id]) {
              memberBalances[s.user_id].balance -= Number(s.amount);
            }
          });
        });
      }
    }

    const memberList = Object.values(memberBalances);
    const transactions = calculateSettlement(memberList);

    return { transactions, total };
  }
);

/** 新增費用 */
export const addExpense = createAsyncThunk(
  'expenses/addExpense',
  async (payload: {
    groupId: string;
    paidBy: string;
    amount: number;
    description: string;
    splitUsers: string[];
  }) => {
    const { groupId, paidBy, amount, description, splitUsers } = payload;

    // 1. 新增主要費用紀錄
    const { data: expenseRecord, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        group_id: groupId,
        paid_by: paidBy,
        amount,
        description: description.trim(),
      })
      .select()
      .single();

    if (expenseError || !expenseRecord) {
      throw new Error(expenseError?.message || '建立花費失敗');
    }

    // 2. 計算平均分攤金額
    const splitAmount = Math.round((amount / splitUsers.length) * 100) / 100;

    // 3. 新增分攤明細
    const splitsData = splitUsers.map(uid => ({
      expense_id: expenseRecord.id,
      user_id: uid,
      amount: splitAmount,
    }));

    const { error: splitsError } = await supabase
      .from('expense_splits')
      .insert(splitsData);

    if (splitsError) {
      throw new Error(splitsError.message);
    }

    return expenseRecord;
  }
);

/** 編輯費用 */
export const editExpense = createAsyncThunk(
  'expenses/editExpense',
  async (payload: {
    expenseId: string;
    description: string;
    amount: number;
    paidBy: string;
    selectedMembers: string[];
  }) => {
    const { expenseId, description, amount, paidBy, selectedMembers } = payload;

    // 1. 更新費用
    const { error: expenseError } = await supabase
      .from('expenses')
      .update({ description, amount, paid_by: paidBy })
      .eq('id', expenseId);

    if (expenseError) throw expenseError;

    // 2. 重新建立 splits
    const { error: deleteError } = await supabase
      .from('expense_splits')
      .delete()
      .eq('expense_id', expenseId);

    if (deleteError) throw deleteError;

    const splitAmount = amount / selectedMembers.length;
    const splits = selectedMembers.map(userId => ({
      expense_id: expenseId,
      user_id: userId,
      amount: splitAmount,
    }));

    const { error: splitError } = await supabase
      .from('expense_splits')
      .insert(splits);

    if (splitError) throw splitError;

    return { expenseId, description, amount, paidBy };
  }
);

/** 刪除費用 */
export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (expenseId: string) => {
    await supabase.from('expense_splits').delete().eq('expense_id', expenseId);
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (error) throw error;
    return expenseId;
  }
);

// ---- Slice ----

const initialState: ExpensesState = {
  list: [],
  totalExpense: 0,
  owesMe: [],
  iOwe: [],
  transactions: [],
  loading: true,
};

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearExpenses(state) {
      state.list = [];
      state.totalExpense = 0;
      state.owesMe = [];
      state.iOwe = [];
      state.transactions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchExpenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.list = action.payload.expenses;
        state.totalExpense = action.payload.total;
        state.owesMe = action.payload.owesMe;
        state.iOwe = action.payload.iOwe;
        state.loading = false;
      })
      .addCase(fetchExpenses.rejected, (state) => {
        state.loading = false;
      })
      // fetchSettlement
      .addCase(fetchSettlement.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSettlement.fulfilled, (state, action) => {
        state.transactions = action.payload.transactions;
        state.totalExpense = action.payload.total;
        state.loading = false;
      })
      .addCase(fetchSettlement.rejected, (state) => {
        state.loading = false;
      })
      // deleteExpense
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.list = state.list.filter(e => e.id !== action.payload);
        state.totalExpense = state.list.reduce((sum, e) => sum + Number(e.amount), 0);
      });
  },
});

export const { clearExpenses } = expensesSlice.actions;
export default expensesSlice.reducer;
