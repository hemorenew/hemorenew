/* eslint-disable @typescript-eslint/no-explicit-any */
import withSession from 'lib/session';
import authServiceFactory from 'services/authService';
import { databaseServiceFactory } from 'services/databaseService';

const dbService = databaseServiceFactory();
const authService = authServiceFactory();

export default withSession(async (req: any, res: any) => {
  const ERROR_CREDENTIALS = 'Invalid email or password  ';

  const method = req.method.toLowerCase();
  const { email, password } = req.body;
  if (method !== 'post') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const user = await dbService.getUser(email);
    const passwordMatches = await authService.validate(password, user.password);
    if (passwordMatches) {
      await saveSession(
        { idUser: user._id, type: user.type, name: user.name },
        req
      );
      res
        .status(200)
        .json({ idUser: user._id, type: user.type, name: user.name });
      return;
    }
  } catch (error: any) {
    console.log('validate: ', error.message);
  }
  res.status(403).json({ error: ERROR_CREDENTIALS });
});

async function saveSession(user: any, request: any) {
  const { idUser, type, name } = user;
  const sessionDuration = 4 * 60 * 60 * 1000;
  const sessionExpiry = Date.now() + sessionDuration;
  request.session.set('user', { idUser, type, name, sessionExpiry });
  await request.session.save({ maxAge: sessionDuration });
}
