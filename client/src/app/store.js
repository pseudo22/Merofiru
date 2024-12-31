import {configureStore} from '@reduxjs/toolkit' 
import userReducer from '../features/userSlice.js'; 
import topMatchesReducer from '../features/topMatchesSlice.js'
import friendsReducer from '../features/friendsSlice.js'

export const store = configureStore({
    reducer : {
        user : userReducer ,
        topMatches : topMatchesReducer,
        friends : friendsReducer
    }
})
