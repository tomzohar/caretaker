import PatientRecord from "./patient.entity";
import {AppDataSource} from "../../config/database";
import {DeleteResult, FindOptionsSelect, FindOptionsWhere, Repository} from "typeorm";
import {PatientNotFoundError} from "./patient.errors";
import {StaticClassError} from "../errors";

const getPatientSelectOptions = (): FindOptionsSelect<PatientRecord> => ({
    id: true,
    firstName: true,
    lastName: true,
    status: true,
    guardian: {
        id: true,
        name: true,
        email: true
    }
});

const getPatientWhereOptions = ({id, userId}: {
    id?: number,
    userId?: number
} = {}): FindOptionsWhere<PatientRecord> => ({
    ...(id ? {id} : {}),
    ...(userId ? {guardian: {id: userId}} : {}),
});

export default class PatientRepository {

    constructor() {
        throw new StaticClassError(this.constructor.name);
    }

    public static createPatient(patientDetails: Partial<PatientRecord>): Promise<PatientRecord> {
        const repo = PatientRepository.getRepository();
        const patient = repo.create(patientDetails);
        return repo.save(patient);
    }

    public static async findById(id: number, userId?: number): Promise<PatientRecord | null> {
        const repo = PatientRepository.getRepository();
        return repo.findOne({
            where: getPatientWhereOptions({id, userId}),
            select: getPatientSelectOptions(),
            relations: {
                guardian: Boolean(userId),
            }
        });
    }

    public static async updatePatient(id: number, patientDetails: Partial<PatientRecord>): Promise<PatientRecord> {
        const patientRecord = await PatientRepository.findById(id);
        if (!patientRecord) {
            throw new PatientNotFoundError(id);
        }
        const repo = PatientRepository.getRepository();
        repo.merge(patientRecord, patientDetails);
        return repo.save(patientRecord);
    }

    static findAll(userId: number): Promise<PatientRecord[]> {
        const repo = PatientRepository.getRepository();
        return repo.find({
            where: getPatientWhereOptions({userId}),
            select: getPatientSelectOptions()
        });
    }

    private static getRepository(): Repository<PatientRecord> {
        return AppDataSource.getRepository(PatientRecord);
    }

    static async deletePatient(patientId: number): Promise<DeleteResult> {
        const repo = PatientRepository.getRepository();
        return repo.delete({ id: patientId });
    }
}
