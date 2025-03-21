import {Router} from 'express';
import PostController from "../posts/post.controller";
import runInContext from "../../utils/run-in-context";

const router = Router();

router.get('/', runInContext(async ({res, context}) => {
    try {
        const {userId} = context;
        const posts = await PostController.getAllPostsForUser(userId);
        res.status(200).json({items: posts});
    } catch (err) {
        const error = err as Error;
        res.status(400).json({error: error.message});
    }
}));

export default router;
