import { Router, Response } from 'express';
import SignupController from './signup.controller';
import UserController from '../user/user.controller';
import SessionService from '../../services/session.service';
import { UserNotFoundError } from '../user/user.erros';

const router = Router();

router.post('/email', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserController.findByEmail(email);
    if (user) {
      throw new Error('Email already exists');
    }

    const token = await SignupController.getUserSignupToken({
      email,
      password,
    });
    res.status(200).json({ token });
  } catch (err) {
    const token = await SignupController.getUserSignupToken({
      email,
      password,
    });
    if (err instanceof UserNotFoundError) {
      return res.status(200).json({ token });
    }
    res.status(400).json({ error: (<Error>err).message });
  }
});

router.post('/complete', async (req, res: Response) => {
  const { token, name } = req.body;
  try {
    const { user, token: sessionToken } = await SignupController.completeSignupProcess({
      token,
      name,
    });
    // const sessionToken = await SessionService.createSession(user.id as number);
    res.cookie('sessionToken', sessionToken, { httpOnly: true });
    res.status(201).json({ user, token: sessionToken });
  } catch (err) {
    res.status(400).json({ error: (<Error>err).message });
  }
});

export default router;
