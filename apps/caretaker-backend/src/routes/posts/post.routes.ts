import Router from 'express';
import PostController from "./post.controller";
import {PostCreationFailed} from "./post.errors";
import {StatusCode} from "../../types";
import runInContext from "../../utils/run-in-context";

const router = Router();

router.post('/', runInContext(async ({req, res, context}) => {
    try {
        const post = await PostController.createPost(req.body, context.userId);
        res.status(201).json({post});
    } catch (e) {
        const error = e as PostCreationFailed
        res.status(400).json({error: error.message});
    }
}));

router.get('/', runInContext(async ({res, context}) => {
        const {userId} = context;
        const posts = await PostController.getAllPostsForUser(userId);
        res.status(200).json({posts});
    })
);

router.get('/:id', runInContext(async ({req, res, context}) => {
        try {
            const {userId} = context;
            const post = await PostController.getPost(Number(req.params.id), userId);
            res.status(StatusCode.OK).json({post});
        } catch (err) {
            const error = err as Error;
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({error: error.message});
        }
    })
);

router.put('/:id', runInContext(async ({req, res, context}) => {
        const {userId} = context;
        const post = await PostController.updatePost(Number(req.params.id), req.body, userId);
        res.status(200).json({post});
    })
);

router.delete('/:id', async (req, res) => {
    try {
        await PostController.deletePost(Number(req.params.id));
        res.status(204).json({deleted: true});
    } catch (e) {
        const error = e as Error;
        res.status(400).json({error: error.message});
    }
});

export default router;
