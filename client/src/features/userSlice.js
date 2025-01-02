import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  userId: null,
  userName: 'stranger',
  profile : null,
  bio : '',
  isOnline : false,
  selectedGenres : [],
  blockedUsers : [],
  pendingRequests : [],
  toBeConfirmed : [],
  pendingRequestsCount : 0,
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
      state.blockedUsers = [];
      state.pendingRequests = [];
      state.toBeConfirmed = [];
      state.pendingRequestsCount = 0;
      state.bio = '';
      state.profile = null;
      state.isOnline = false;
    },
    setToken: (state, action) => {
      state.token = action.payload.token;
    },
    setUserGenres: (state, action) => {
      state.selectedGenres = action.payload.selectedGenres;
    },
    setToBeConfirmed: (state, action) => {
      state.toBeConfirmed = action.payload.toBeConfirmed;
    },
    setBlockedUsers: (state, action) => {
      state.blockedUsers = action.payload.blockedUsers;
    },

    setPendingRequests: (state, action) => {
      state.pendingRequests = action.payload.pendingRequests;
      state.pendingRequestsCount = action.payload.pendingRequests?.length;
    },

  },
});

export const { setUser, clearUser, setToken, setUserGenres , setToBeConfirmed , setBlockedUsers , setPendingRequests } = userSlice.actions;

export default userSlice.reducer;
