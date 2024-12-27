import axios from 'axios'
import { getToken } from './firebaseConfig'

const ApiClient = axios.create({
    baseURL : import.meta.env.VITE_BACKEND_URL,
    headers : {
        'Content-Type' : 'application/json'
    }
})

ApiClient.interceptors.request.use(
    async(request) => {
        const token = await getToken()
        
        if (token){
            request.headers['Authorization'] = `Bearer ${token}`
        }
        return request
    } , (err) => {
        return Promise.reject('did not got token')
    }
)
export { ApiClient }