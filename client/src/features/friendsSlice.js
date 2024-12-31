import { createSlice } from "@reduxjs/toolkit";

const initialFriendsState = {
    friends: [],
  };
  
  const friendsSlice = createSlice({
    name: 'friends',
    initialState: initialFriendsState,
    reducers: {
      setFriends(state, action) {
        state.friends = action.payload.friends;
      },
      clearFriends(state) {
        state.friends = [];
      },
    },
  });
  
  export const { setFriends, clearFriends } = friendsSlice.actions;
  export default friendsSlice.reducer;
  