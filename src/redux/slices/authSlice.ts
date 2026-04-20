import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../supabase';
import type { User } from '@supabase/supabase-js';

// ---- Types ----
type ProfileData = {
  username: string | null;
  avatar_url: string | null;
  email: string;
};

type AuthState = {
  user: User | null;
  profile: ProfileData | null;
  loading: boolean;
};

// ---- Thunks ----

/** 取得目前使用者的 profile（avatar_url, username, email） */
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('avatar_url, username')
      .eq('id', user.id)
      .single();

    return {
      username: profileData?.username ?? null,
      avatar_url: profileData?.avatar_url ?? null,
      email: user.email ?? '',
    };
  }
);

/** 更新使用者名稱 */
export const updateUsername = createAsyncThunk(
  'auth/updateUsername',
  async (newUsername: string, { getState }) => {
    const state = getState() as { auth: AuthState };
    const user = state.auth.user;
    if (!user) throw new Error('User not found');

    const { error } = await supabase
      .from('profiles')
      .update({ username: newUsername.trim() })
      .eq('id', user.id);

    if (error) throw error;
    return newUsername.trim();
  }
);

/** 更新使用者頭像 */
export const updateAvatar = createAsyncThunk(
  'auth/updateAvatar',
  async (file: File, { getState }) => {
    const state = getState() as { auth: AuthState };
    const user = state.auth.user;
    if (!user) throw new Error('User not logged in');

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}.${fileExt}`;

    // 上傳圖片
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // 取得公開網址
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    // 更新 profiles.avatar_url
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return publicUrl;
  }
);

// ---- Slice ----

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.profile = null;
    },
    setAuthLoading(state, action) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateUsername.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.username = action.payload;
        }
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.avatar_url = action.payload;
        }
      });
  },
});

export const { setUser, clearAuth, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
