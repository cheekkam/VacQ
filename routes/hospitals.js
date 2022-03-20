const express = require('express');
const {getHospitals, getHospital, createHospital, updateHospital, deleteHospital, getVacCenters} = require('../controller/hospitals');
const {protect, authorize} = require('../middleware/auth')

// Include other resource routers
const appointmentRouter = require('./appointments');

const router = express.Router();

// Re-route into other resource routers
router.use('/:hospitalId/appointments/', appointmentRouter); 

router.route('/vacCenters').get(getVacCenters);

router.route('/').get(getHospitals).post(protect, authorize('admin'), createHospital)
router.route('/:id').get(getHospital).put(protect, authorize('admin'), updateHospital).delete(protect, authorize('admin'), deleteHospital);

module.exports=router