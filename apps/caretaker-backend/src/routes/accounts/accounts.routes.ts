import { Router } from 'express';
import runInContext from '../../utils/run-in-context';
import { AccountsController } from './accounts.controller';
import {
  AccountCreationFailedError,
  AccountNotFoundError,
} from '../../entities/errors/account-entitiy-errors';
import { UserAlreadyAssignedToAccountError, UserNotFoundError } from '../user/user.erros';
import { StatusCode } from '../../types';

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

router.post(
  '/join/:id',
  runInContext(async ({ req, res, context }) => {
    try {
      const { userId } = context;
      const accountId = Number(req.params.id);
      
      const account = await AccountsController.joinAccount(accountId, userId);
      res.status(StatusCode.OK).json({ account });
    } catch (err) {
      console.log(err);
      if (err instanceof AccountNotFoundError || err instanceof UserAlreadyAssignedToAccountError || err instanceof UserNotFoundError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  })
);

router.get(
  '/search',
  runInContext(async ({ req, res }) => {
    try {
      const { name } = req.query;
      if (!name || typeof name !== 'string') {
        res.status(StatusCode.BAD_REQUEST).json({ error: 'Account name is required' });
        return;
      }
      
      const account = await AccountsController.findAccountByName(name);
      res.status(StatusCode.OK).json({ 
        account: account ? {
          id: account.id,
          name: account.name,
          slug: account.slug,
          usersCount: account.users?.length || 0
        } : null
      });
    } catch (err) {
      console.log(err);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  })
);

router.get(
  '/:id',
  runInContext(async ({ req, res }) => {
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
