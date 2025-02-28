import axios from 'axios';

const api = axios.create({
  baseURL: 'https://kyclogin.twmresearchalert.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;