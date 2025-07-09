import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Points to our backend container
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;