import {Router} from 'express';
import {LoginController} from "./login.controller";
import {UserError} from "../user/user.erros";

const router = Router();

router.post('/email', async (req, res) => {
    try {
        const {email, password} = req.body;
        const result = await LoginController.login(email, password);
        res.status(200).json(result);
    } catch (e) {
        console.log(e);

        if (e instanceof UserError) {
            res.status(e.status).json({error: e.message});
            return;
        }

        res.status(500).send();
    }
});

export default router;
