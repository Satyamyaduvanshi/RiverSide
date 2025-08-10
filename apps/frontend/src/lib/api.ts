import axios from 'axios';

//todo: cors error fix it 

export const api = axios.create({
  baseURL: 'http://localhost:3000/api/', // The URL of your API Gateway
  withCredentials: true, // This tells axios to send cookies with requests
});