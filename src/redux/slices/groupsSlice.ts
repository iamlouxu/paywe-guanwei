import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../supabase';
import type { GroupData, Profile } from '../../types';

// ---- Types ----
type GroupsState = {
  list: GroupData[];
  currentGroup: GroupData | null;
  members: Profile[];
  totals: { net: number };
  loading: boolean;
  membersLoading: boolean;
};

// ---- Thunks ----

/** 取得所有群組列表 + 計算全域淨額 */
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { groups: [], net: 0 };

    const { data: myGroups, error: groupError } = await supabase
      .from('groups')
      .select(`
        id, name, created_at, is_settled,
        expenses ( amount, id, paid_by )
      `)
      .order('created_at', { ascending: false });

    if (groupError || !myGroups) return { groups: [], net: 0 };

    // 計算全域淨額 (只算未結清群組)
    const activeGroupIds = (myGroups as any[])
      .filter(g => !g.is_settled)
      .map(g => g.id);

    let othersOweMeTotal = 0;
    let iOweTotal = 0;

    if (activeGroupIds.length > 0) {
      // 取得我付錢的費用
      const { data: myPaidExpenses } = await supabase
        .from('expenses')
        .select('id, amount')
        .eq('paid_by', user.id)
        .in('group_id', activeGroupIds);

      const myPaidExpenseIds = myPaidExpenses?.map(e => e.id) || [];

      // 「待收」= 我付錢的費用中，別人應付的部分
      if (myPaidExpenseIds.length > 0) {
        const { data: othersInMyExpenses } = await supabase
          .from('expense_splits')
          .select('amount')
          .in('expense_id', myPaidExpenseIds)
          .neq('user_id', user.id);

        othersOweMeTotal = othersInMyExpenses?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;
      }

      // 「待付」= 我在別人付的費用中應付的部分
      const { data: myAllSplits } = await supabase
        .from('expense_splits')
        .select('amount, expense_id, expenses!inner(group_id)')
        .eq('user_id', user.id)
        .in('expenses.group_id', activeGroupIds);

      iOweTotal = myAllSplits
        ?.filter(s => !myPaidExpenseIds.includes(s.expense_id))
        .reduce((sum, s) => sum + Number(s.amount), 0) || 0;
    }

    return { groups: myGroups as any[], net: othersOweMeTotal - iOweTotal };
  }
);

/** 取得單一群組 */
export const fetchGroupById = createAsyncThunk(
  'groups/fetchGroupById',
  async (groupId: string) => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error) throw error;
    return data as GroupData;
  }
);

/** 取得群組成員 */
export const fetchGroupMembers = createAsyncThunk(
  'groups/fetchGroupMembers',
  async (groupId: string) => {
    const { data: groupMembers, error: groupError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);

    if (groupError) throw groupError;

    if (groupMembers && groupMembers.length > 0) {
      // 過濾掉可能為 null 或 undefined 的值，以及字串 "undefined"，以免 Supabase .in() 發生 400 Bad Request
      const userIds = groupMembers.map((m) => m.user_id).filter(id => id && id !== 'undefined');
      
      if (userIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profileError) throw profileError;

      if (profiles) {
        return profiles.map(p => ({
          id: p.id,
          username: p.username,
          avatar_url: p.avatar_url,
        })) as Profile[];
      }
    }

    return [] as Profile[];
  }
);

/** 結清群組 */
export const settleGroup = createAsyncThunk(
  'groups/settleGroup',
  async (groupId: string) => {
    const { error } = await supabase
      .from('groups')
      .update({ is_settled: true })
      .eq('id', groupId)
      .select();

    if (error) throw error;
    return groupId;
  }
);

/** 更新群組名稱 */
export const updateGroupName = createAsyncThunk(
  'groups/updateGroupName',
  async ({ groupId, name }: { groupId: string; name: string }) => {
    const { error } = await supabase
      .from('groups')
      .update({ name })
      .eq('id', groupId);

    if (error) throw error;
    return { groupId, name };
  }
);

/** 刪除群組 */
export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (groupId: string) => {
    const { error } = await supabase.rpc('delete_group_cascade', {
      group_id_param: groupId,
    });

    if (error) throw error;
    return groupId;
  }
);

// ---- Slice ----

const initialState: GroupsState = {
  list: [],
  currentGroup: null,
  members: [],
  totals: { net: 0 },
  loading: true,
  membersLoading: true,
};

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearCurrentGroup(state) {
      state.currentGroup = null;
      state.members = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchGroups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.list = action.payload.groups;
        state.totals = { net: action.payload.net };
        state.loading = false;
      })
      .addCase(fetchGroups.rejected, (state) => {
        state.loading = false;
      })
      // fetchGroupById
      .addCase(fetchGroupById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.currentGroup = action.payload;
        state.loading = false;
      })
      .addCase(fetchGroupById.rejected, (state) => {
        state.loading = false;
      })
      // fetchGroupMembers
      .addCase(fetchGroupMembers.pending, (state) => {
        state.membersLoading = true;
      })
      .addCase(fetchGroupMembers.fulfilled, (state, action) => {
        state.members = action.payload;
        state.membersLoading = false;
      })
      .addCase(fetchGroupMembers.rejected, (state) => {
        state.membersLoading = false;
      })
      // settleGroup
      .addCase(settleGroup.fulfilled, (state, action) => {
        if (state.currentGroup && state.currentGroup.id === action.payload) {
          state.currentGroup.is_settled = true;
        }
        const group = state.list.find(g => g.id === action.payload);
        if (group) {
          group.is_settled = true;
        }
      })
      // updateGroupName
      .addCase(updateGroupName.fulfilled, (state, action) => {
        const { groupId, name } = action.payload;
        if (state.currentGroup && state.currentGroup.id === groupId) {
          state.currentGroup.name = name;
        }
        const group = state.list.find(g => g.id === groupId);
        if (group) {
          group.name = name;
        }
      })
      // deleteGroup
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.list = state.list.filter(g => g.id !== action.payload);
        if (state.currentGroup?.id === action.payload) {
          state.currentGroup = null;
        }
      });
  },
});

export const { clearCurrentGroup } = groupsSlice.actions;
export default groupsSlice.reducer;
