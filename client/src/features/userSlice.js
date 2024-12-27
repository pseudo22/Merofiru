import {createSlice} from '@reduxjs/toolkit'


const initialState = {
    token : null, 
    userId : null,
    userName : 'stranger'
}


const userSlice = createSlice({
    name : 'user',
    initialState,
    reducers : {
        setUser : (state , action) => {
            state.userName = action.payload.userName,
            state.userId = action.payload.userId
        },
        resetUser : (state) => {
            state.token = null,
            state.userId = null,
            state.userName = 'stranger'
        },
        setToken : (state, action) => {
            state.token = action.payload.token
        }
    }
})

export const {setUser , resetUser , setToken} = userSlice.actions
export default userSlice.reducer