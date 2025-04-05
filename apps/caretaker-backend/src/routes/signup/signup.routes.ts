import { Router, Response } from 'express';
import SignupController from './signup.controller';
import UserController from '../user/user.controller';
import { UserNotFoundError } from '../user/user.erros';

const router = Router();

// Handle preflight requests
router.options('/email', (req, res) => {
  res.status(200).end();
});

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
    res.status(400).json({ error: (err as Error).message });
  }
});

router.options('/complete', (req, res) => {
  res.status(200).end();
});

router.post('/complete', async (req, res: Response) => {
  const { token, name } = req.body;
  try {
    const { user, token: sessionToken } = await SignupController.completeSignupProcess({
      token,
      name,
    });
    res.cookie('sessionToken', sessionToken, { 
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });
    res.status(201).json({ user, token: sessionToken });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
