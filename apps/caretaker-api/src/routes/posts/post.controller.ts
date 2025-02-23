import PostRecord from "../../entities/post/post.entity";
import PostRepository from "../../entities/post/post-repository";
import {PostCreationFailed, PostNotFoundError} from "./post.errors";
import {QueryFailedError} from "typeorm";
import UserController from "../user/user.controller";


export default class PostController {
    static async createPost(postDetails: Partial<PostRecord>, userId: number): Promise<PostRecord> {
        try {
            const user = await UserController.getById(userId);
            const post = await PostRepository.create(postDetails, user);
            await PostRepository.save(post);
            console.log(`User ${user.name} created a post about: ${post.content}`);
            return post;
        } catch (e) {
            throw new PostCreationFailed(e as QueryFailedError);
        }
    }

    static getAllPostsForUser(userId: number): Promise<PostRecord[]> {
        try {
            return PostRepository.findAll(userId);
        } catch (e) {
            const error = e as QueryFailedError;
            throw new PostNotFoundError(error);
        }
    }

    static async updatePost(id: number, body: Partial<PostRecord>, userId: number) {
        const post = await PostRepository.findById(id, userId);
        if (!post) {
            throw new PostNotFoundError(new Error(`Post with id ${id} not found`));
        }
        return PostRepository.update({...post, ...body});
    }

    static async deletePost(id: number) {
        await PostRepository.delete(id);
    }

    static async getPost(id: number, userId: number) {
        const post = await PostRepository.findById(id, userId);
        if (!post) {
            throw new PostNotFoundError(new Error(`Post with id ${id} not found`));
        }
        return post;

    }
}
