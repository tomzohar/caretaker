import {Router} from 'express';
import {StatusCode} from "../../types";
import PatientsController from "./patients.controller";
import runInContext from "../../utils/run-in-context";

const router = Router();

router.post('/', runInContext(async ({req, res, context}) => {
    const patient = await PatientsController.createPatient(context.userId, req.body);
    res.status(StatusCode.CREATED).json({patient});
}));

router.get('/', runInContext(async ({res, context}) => {
    const patients = await PatientsController.getAllPatients(context.userId);
    res.status(StatusCode.OK).json({patients});
    return;
}));

router.get('/:id', runInContext(async ({req, res, context}) => {
    const {userId} = context;
    const patientId = Number(req.params['id']);
   const patient = await PatientsController.getById({userId, patientId});
   res.status(StatusCode.OK).json({patient});
}));

router.put('/:id', runInContext(async ({req, res, context}) => {
    const {userId} = context;
    const patientId = Number(req.params['id']);
    const patient = await PatientsController.updatePatient({userId, patientId}, req.body);
    res.status(StatusCode.OK).json({patient});
}));

router.patch('/:id', runInContext(async ({req, res, context}) => {
    const {userId} = context;
    const patientId = Number(req.params['id']);
    const patient = await PatientsController.updatePatient({userId, patientId}, req.body);
    res.status(StatusCode.OK).json({patient});
}));

router.delete('/:id', runInContext(async ({req, res}) => {
    const patientId = Number(req.params['id']);
    const isDeleted = await PatientsController.deletePatient(patientId);
    res.status(StatusCode.NO_CONTENT).json({success: isDeleted});
}));

export default router;
