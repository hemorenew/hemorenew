/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unused-imports/no-unused-vars */
import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

const AuthContext = createContext({
  isLoggedIn: false,
  userData: {},
  userLoaded: false,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/auth/user');
        setIsLoggedIn(data.isLoggedIn);
        setUserData({
          type: data.type,
          idUser: data.idUser,
        });
        setUserLoaded(true);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, userData, userLoaded }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
