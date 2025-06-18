// Services/CrewService.ts
import axios from 'axios';

export const fetchCrewInfo = async (company_id: string, token: string) => {
  const response = await axios.get('http://localhost:8000/crew-info', {
    params: { company_id },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


export const registerCrew = async (email: string, password: string) => {
  const res = await fetch('http://localhost:8000/crew/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error('クルー登録に失敗しました');
  }

  return res.json();
};