import { InternalServerError, StaticClassError } from '../../entities/errors';
import PatientRepository from '../../entities/patient/patient-repository';
import PatientRecord from '../../entities/patient/patient.entity';
import {
  PatientCreateFailedError,
  PatientNotFoundError,
} from '../../entities/patient/patient.errors';
import UserController from '../user/user.controller';

export default class PatientsController {
  constructor() {
    throw new StaticClassError(this.constructor.name);
  }

  public static async createPatient(
    userId: number,
    patientDetails: Partial<PatientRecord>
  ) {
    try {
      const user = await UserController.getById(userId);
      const patient = await PatientRepository.createPatient(
        Object.assign(patientDetails, {
          guardian: user,
        })
      );
      return patient;
    } catch (error) {
      throw new PatientCreateFailedError(error as Error);
    }
  }

  public static async getAllPatients(userId: number): Promise<PatientRecord[]> {
    try {
      const patients = await PatientRepository.findAll(userId);
      return patients;
    } catch {
      throw new InternalServerError();
    }
  }

  static async getById({
    userId,
    patientId,
  }: {
    userId: number;
    patientId: number;
  }): Promise<PatientRecord> {
    const patient = await PatientRepository.findById(patientId, userId);
    if (!patient) {
      throw new PatientNotFoundError(patientId);
    }
    return patient;
  }

  static async updatePatient(
    {
      patientId,
      userId,
    }: {
      userId: number;
      patientId: number;
    },
    patientDetails: Partial<PatientRecord>
  ): Promise<PatientRecord> {
    const patient = await PatientRepository.findById(patientId, userId);
    if (!patient) {
      throw new PatientNotFoundError(patientId);
    }
    const updatedValue = Object.assign(patient, patientDetails);
    await PatientRepository.updatePatient(patientId, updatedValue);
    return updatedValue;
  }

  static async deletePatient(patientId: number) {
    const { affected } = await PatientRepository.deletePatient(patientId);
    return affected === 1;
  }
}
