/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const userServiceFactory = () => {
  function login(email: any, password: any) {
    return axios
      .post(`/api/auth/auth`, { email, password })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.log('Error:', error);
        throw error;
      });
  }
  return { login };
};

export default userServiceFactory;
