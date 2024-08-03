import Auth from '../authentication/authentication';

export default class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.header('Authorization') || '';
    const [type, credentials] = authHeader.split(' ');

    if (type !== 'Basic' || !credentials) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decodedCredentials = Buffer.from(credentials, 'base64').toString();
    const [email, password] = decodedCredentials.split(':');

    const user = await Auth.verifyCredentials(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = await Auth.generateToken(user._id.toString());
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await Auth.getUserIdByToken(token);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await Auth.deleteUserToken(token);
    return res.status(204).send();
  }
}
