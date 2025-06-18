import axios from 'axios';

export const login = async (email: string, password: string) => {
  const response = await axios.post('http://localhost:8000/login', {
    email,
    password
  });
  return response.data;
};

export const registerCrew = async (email: string, password: string) => {
  const response = await axios.post('http://localhost:8000/crew/register', {
    email,
    password,
  });
  return response.data;
};