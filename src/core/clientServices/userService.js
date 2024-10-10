import axios from 'axios';

const userServiceFactory = () => {
  function login(email, password) {
    return axios.post(`/api/auth/auth`, { email, password });
  }

  return { login };
};

module.exports = {
  userServiceFactory,
};
