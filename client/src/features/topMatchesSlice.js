import { createSlice } from '@reduxjs/toolkit';

const initialTopMatchesState = {
  topMatches: [],
};

const topMatchesSlice = createSlice({
  name: 'topMatches',
  initialState: initialTopMatchesState,
  reducers: {
    setTopMatches(state, action) {
      state.topMatches = action.payload.topMatches;
    },
    clearTopMatches(state) {
      state.topMatches = [];
    },
  },
});

export const {
  setTopMatches,
  clearTopMatches,
} = topMatchesSlice.actions;

export default topMatchesSlice.reducer;
