import {createSlice , createAsyncThunk} from '@reduxjs/toolkit'

  

const userSlice = createSlice({
    name : 'user',
    initialState : {
        userId : null,
        userName : 'stranger',
        token : null,
        onLine : false
    },
    reducers : {
        setUser : (state , action) => {
            state.userId = action.payload.userId
            state.userName = action.payload.userName
            state.onLine = true
        },
        resetUser : (state)=>{
            state.userId = null
            state.userName = 'stranger'
            state.token = null
            state.onLine = false
        },
        setToken : (state, action) =>{
            state.token = action.payload.token
        }
    },
    });


export const {setUser ,resetUser , setToken} = userSlice.actions
export default userSlice.reducer 