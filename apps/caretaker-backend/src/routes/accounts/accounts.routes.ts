import { Router } from 'express';
import runInContext from '../../utils/run-in-context';
import { AccountsController } from './accounts.controller';
import {
  AccountCreationFailedError,
  AccountNotFoundError,
} from '../../entities/errors/account-entitiy-errors';

const router = Router();

router.post(
  '/',
  runInContext(async ({ req, res, context }) => {
    try {
      const { userId } = context;
      const accountName = req.body.name;
      const slug = await AccountsController.generateSlug(accountName);
      const account = await AccountsController.createAccount({ ...req.body, slug }, userId);
      res.status(200).json({ account });
    } catch (err) {
      console.log(err);
      if (err instanceof AccountCreationFailedError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
);

router.get(
  '/:id',
  runInContext(async ({ req, res, context }) => {
    try {
      const accountId = Number(req.params.id);
      const account = await AccountsController.getAccountById(accountId);
      res.status(200).json({ account });
    } catch (err) {
      console.log(err);
      if (err instanceof AccountNotFoundError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
);

export default router;
