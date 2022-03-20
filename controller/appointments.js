const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');

//@desc     Get all appointments
//@route    Get /api/v1/appointments
//@access   Public
exports.getAppointments = async (req,res,next) => {
    let query;
    // General users can see only their appointment
    if (req.user.role !== 'admin') {
        query = Appointment.find({user:req.user.id}).populate({
            path: 'hospital',
            select: 'name province tel'
        });
    } else { // If you are an admin, you can see all
        if (req.params.hospitalId) {
            query=Appointment.find({hospital:req.params.hospitalId}).populate({
                path:'hospital',
                select: 'name province tel'
            });
        } else {
            query=Appointment.find().populate({
                path:'hospital',
                select: 'name province tel'
            });
        }
    }

    try {
        const appoinments = await query;
        res.status(200).json({
            success: true,
            count: appoinments.length,
            data: appoinments
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot find Appoinment"});
    }
};

//@desc     Get single appointments
//@route    Get /api/v1/appointments/:id
//@access   Public
exports.getAppointment = async (req,res,next) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'hospital',
            select: 'name description tel'
        });

        if (!appointment) {
            return res.status(404).json({success: false, message: `No appointment with the id of ${req.params.id}`});
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot find Appointment"})
    }
};

//@desc     Add appointments
//@route    POST /api/v1/hospitals/:hospitalId/appointments
//@access   Private
exports.addAppointment = async (req,res,next) => {
    try {
        req.body.hospital = req.params.hospitalId;
        const hospital = await Hospital.findById(req.params.hospitalId);

        if (!hospital) {
            return res.status(404).json({success: false, message: `No hospital with the id of ${req.params.hospitalId}`});
        }
        
        // Add user Id to req.body
        req.body.user = req.user.id;

        // Check for existed appointment
        const existedAppointments = await Appointment.find({user: req.user.id});

        // If the user is not an admin, they can only create 3 appointments
        if (existedAppointments.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({success: false, message: `The user with ID ${req.user.id} has already made 3 appointments`});
        }

        const appointment = await Appointment.create(req.body);

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot create Appointment"})
    }
};

//@desc     Update appointments
//@route    PUT /api/v1/hospitals/:id
//@access   Private
exports.updateAppointment = async (req,res,next) => {
    try {
        let appoinment = await Appointment.findById(req.params.id);

        if (!appoinment) {
            return res.status(404).json({success: false, message: `No appoinment with the id of ${req.params.id}`});
        }

        // Make sure user is the appointment owner
        if (appoinment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.params.id} is not authorize to update this appointment`});
        }

        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot update Appointment"})
    }
};

//@desc     Delete appointments
//@route    DELETE /api/v1/hospitals/:id
//@access   Private
exports.deleteAppointment = async (req,res,next) => {
    try {
        const appoinment = await Appointment.findById(req.params.id);

        if (!appoinment) {
            return res.status(404).json({success: false, message: `No appoinment with the id of ${req.params.id}`});
        }
        
        // Make sure user is the appointment owner
        if (appoinment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.params.id} is not authorize to delete this bootcamp`});
        }
        
        await appoinment.remove()

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot delete Appointment"})
    }
};