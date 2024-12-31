import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  userId: null,
  userName: 'stranger',
  profile : null,
  bio : '',
  isOnline : false,
  topMatches : [],
  selectedGenres : [],

};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.userId = action.payload.userId;
      state.userName = action.payload.userName;
      state.genreList = action.payload.genreList;
      state.bio = action.payload.bio;
      state.profile = action.payload.profile;
      state.isOnline = action.payload.online;
    },
    clearUser: (state) => {
      state.userId = null;
      state.userName = 'stranger';
      state.selectedGenres = [];
      state.topMatches = [];
      state.bio = '';
      state.profile = null;
      state.isOnline = false
    },
    setToken: (state, action) => {
      state.token = action.payload.token;
    },
    setUserGenres: (state, action) => {
      state.selectedGenres = action.payload.selectedGenres;
    },
    settopMatches: (state, action) => {
      state.topMatches = action.payload.topMatches;
    },
  },
});

export const { setUser, clearUser, setToken, setUserGenres } = userSlice.actions;

export default userSlice.reducer;
