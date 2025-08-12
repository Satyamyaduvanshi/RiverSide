import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

//todo: cors error fix i

export const api = axios.create({
  baseURL: 'http://localhost:3000/api/', // The URL of your API Gateway
  withCredentials: true, // This tells axios to send cookies with requests
});


api.interceptors.response.use(

  (response)=> response,
  
  async(error)=>{
    const originalRequest = error.config

    if(error.response.status == '401' && !originalRequest._retry){
      originalRequest._retry = true
    

    try {
      await api.post('/auth/refresh')
      return api(originalRequest)
    } catch (refreshError) {

      useAuthStore.getState().setUser(null);
      
      return Promise.reject(refreshError);
    }

  }

    return Promise.reject(error);
    
  },


)