import { Router } from 'express';
import runInContext from '../../utils/run-in-context';
import { InviteController } from './invite.controller';

const router = Router();

router.post(
  '/',
  runInContext(async ({ req, res, context }) => {
    try {
      const { userId } = context;
      const { emails } = req.body;

      if (!Array.isArray(emails) || emails.length === 0) {
        res.status(400).json({ error: 'Please provide at least one email address' });
        return;
      }

      await InviteController.createInvitations(emails, userId);
      res.status(200).json({ message: 'Invitations sent successfully' });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
);

export default router; 