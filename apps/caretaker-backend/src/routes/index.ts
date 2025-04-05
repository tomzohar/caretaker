import {Router} from 'express';
import AccountRoutes from './accounts/accounts.routes';
import HealthRoutes from "./health/health.routes";
import UserRoutes from "./user/user.routes";
import LoginRoutes from "./login/login.routes";
import SignupRoutes from "./signup/signup.routes";
import FeedRoutes from "./feed/feed.routes";
import PostRouter from "./posts/post.routes";
import PatientsRoutes from "./patients/patients.routes";
import InviteRoutes from "./invite/invite.routes";

import {authenticationMiddleware} from "./middleware";

const router = Router();

// Root route
router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Caretaker API',
        version: '1.0.0',
        status: 'running'
    });
});

router.use('/health', HealthRoutes);
router.use('/signup', SignupRoutes);
router.use('/login', LoginRoutes);

// Authenticated routes
router.use('/users', authenticationMiddleware, UserRoutes);
router.use('/feed', authenticationMiddleware, FeedRoutes);
router.use('/posts', authenticationMiddleware, PostRouter);
router.use('/patients', authenticationMiddleware, PatientsRoutes);
router.use('/accounts', authenticationMiddleware, AccountRoutes);
router.use('/invite', authenticationMiddleware, InviteRoutes);

export default router;

