import * as bcrypt from 'bcryptjs';
import { AuthServiceProps } from 'core/interface/type';

const authServiceFactory = (): AuthServiceProps => {
  const validate = async (
    password: string,
    dbPassword: string
  ): Promise<boolean> => {
    return await bcrypt.compare(password, dbPassword);
  };
  return { validate };
};

export default authServiceFactory;
