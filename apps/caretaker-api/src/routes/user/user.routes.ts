import {Router} from 'express';
import UserController from "./user.controller";
import {StatusCode} from "../../types";
import runInContext from "../../utils/run-in-context";

const router = Router();

router.get('/', async (req, res) => {
    try {
        const users = await UserController.getAll();
        res.status(StatusCode.OK).json({users});
    } catch (err) {
        res.status(StatusCode.NOT_FOUND).json({error: (<Error>err).message});
    }
});

router.get('/me', runInContext(async ({res, context}) => {
    const user = await UserController.getById(context.userId);
    res.status(StatusCode.OK).json({user});
}));

router.get('/:id', async (req, res) => {
    try {
        console.log(req.params);
        const user = await UserController.getById(Number(req.params['id']))
        res.status(StatusCode.OK).json({user});
    } catch (err) {
        res.status(StatusCode.NOT_FOUND).json({error: (<Error>err).message});
    }
});

router.get('/:id/posts', async (req, res) => {
    try {
        const user = await UserController.getUserPosts(Number(req.params['id']));
        res.status(StatusCode.OK).json({user});
    } catch (err) {
        res.status(StatusCode.NOT_FOUND).json({error: (<Error>err).message});
    }
});

router.get('/:id/patients', async (req, res) => {
    try {
        const user = await UserController.getUserPatients(Number(req.params['id']));
        res.status(StatusCode.OK).json({user});
    } catch (err) {
        res.status(StatusCode.NOT_FOUND).json({error: (<Error>err).message});
    }
});


router.post('/', async (req, res) => {
    try {
        const user = await UserController.createUser(req.body);
        res.status(201).json({user});
    } catch (error) {
        console.log(error);
        res.status(400).json({error: (<Error>error).message});
    }
});

router.put('/:id', async (req, res) => {
    try {
        const user = await UserController.updateUser(Number(req.params['id']), req.body);
        res.status(StatusCode.OK).json({user});
    } catch (error) {
        console.log(error);
        res.status(StatusCode.BAD_REQUEST).json({error: (<Error>error).message});
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await UserController.deleteUser(Number(req.params['id']));
        res.status(StatusCode.NO_CONTENT).send(true);
    } catch (error) {
        console.log(error);
        res.status(StatusCode.BAD_REQUEST).json({error: (<Error>error).message});
    }
});


export default router;
