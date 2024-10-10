import axios from 'axios';
import { User } from 'core/interface/type';

export function databaseServiceFactory() {
  const getUser = async (_email: string): Promise<User> => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_URL}/api/user/user`
      );
      const data: User = response.data;
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  return { getUser };
}
