import {Router} from 'express';

const router = Router();

router.get('/', (req, res, next) => {
    res.status(200).json({ healthy: true, message: 'Hello there' });
    return next();
});

export default router;
