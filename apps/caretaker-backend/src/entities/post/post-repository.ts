import {AppDataSource} from "../../config/database";
import PostRecord from "./post.entity";
import { UserRecord } from '../user/user.entity';
import {FindOptionsSelect, FindOptionsWhere} from "typeorm";

const getPostSelectOptions = (withUser?: boolean): FindOptionsSelect<PostRecord> => ({
    id: true,
    content: true,
    createdAt: true,
    updatedAt: true,
    ...(withUser ? {
        user: {
            id: true,
            name: true,
            email: true
        }
    } : {})
});

const getPostWhereOptions = (userId?: number, id?: number): FindOptionsWhere<PostRecord> => ({
    id,
    user: {
        id: userId
    }
});

export default class PostRepository {

    static findAll(userId: number): Promise<PostRecord[]> {
        const repo = AppDataSource.getRepository(PostRecord);
        return repo.find({
            where: getPostWhereOptions(userId),
            relations: {
                user: false,
            }
        });
    }

    static findById(id: number, userId?: number): Promise<PostRecord | null> {
        const repo = AppDataSource.getRepository(PostRecord);
        return repo.findOne({
            where: getPostWhereOptions(userId, id),
            select: getPostSelectOptions(true),
            relations: {
                user: true
            }
        });
    }

    static create(postDetails: Partial<PostRecord>, user: UserRecord): Promise<PostRecord> {
        const repo = AppDataSource.getRepository(PostRecord);
        const post = repo.create({
            ...postDetails,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
        return repo.save(post);
    }

    static async update(postDetails: Partial<PostRecord>): Promise<PostRecord> {
        const repo = AppDataSource.getRepository(PostRecord);
        const existingRecord = await PostRepository.findById(postDetails.id as number);

        if (!existingRecord) {
            throw new Error(`Post with id ${postDetails.id} not found`);
        }

        return repo.save(Object.assign(existingRecord, postDetails));
    }

    static async delete(id: number): Promise<void> {
        const repo = AppDataSource.getRepository(PostRecord);
        const existingRecord = await repo.findOneBy({id});

        if (!existingRecord) {
            throw new Error(`Post with id ${id} not found`);
        }

        await repo.delete({id});
    }

    static save(post: PostRecord): Promise<PostRecord> {
        return AppDataSource.getRepository(PostRecord).save(post);
    }
}
