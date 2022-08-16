import {Router} from "express";

import Reservation from "../models/Reservation.model.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAdmin from "../middlewares/isAdmin.js";

const ReservationRouter = Router();

/**
 * A reservation can b created by owner or driver. In both cases driver phone number (guestUserPhone) is a required entry
 * This end point is public so a non logged in user can make a reservation
 */
ReservationRouter.post("/reservations", async (req, res) => {
    try{
        //check of all fields
        const allowedFields = ["vehicle", "owner", "guestUserPhone", "parkingLot"]
        const providedFields = Object.keys(req.body)
        const isValidOperation = providedFields.every(field => allowedFields.includes(field))
        if(!isValidOperation){
            return res.status(405).json({msg: "Operation not allowed"})
        }
        //auto increment ticket number
        //check to ensure logged in phone number has only one active reservaion at the moment
        const reservation = await Reservation.create(req.body)
        return res.status(201).json(reservation)

    }catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
} )


ReservationRouter.get("/reservations/:guestPhoneNumber", async (req, res) => {
    try{
        const reservation =  await Reservation.findOne({guestPhoneNumber: req.params.guestPhoneNumber, status: {"$ne": "CLOSED"} })
        if(!reservation){
            return res.status(404).json({msg: "Reservation not found"})
        }
        return res.status(200).json(reservation)
    }catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
})

ReservationRouter.get("/reservations/:reservationId", isAuthenticated, attachCurrentUser,  async (req, res) => {
    try{
        const reservation =  await Reservation.findOne({Id: req.params.reservationId})
        if(!reservation){
            return res.status(404).json({msg: "Reservation not found"})
        }
        return res.status(200).json(reservation)
    }catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
})

ReservationRouter.patch("/reservations/:guestPhoneNumber", async (req, res) => {
    try{
        
        const allowedUpdates = ["vehicle", "endedAt", "payBy", "status"]
        const requestedUpdates = Object.keys(req.body)
        const isValidOperation = requestedUpdates.every(update => allowedUpdates.includes(update))
        if((req.body.status && req.body.status !=="PAID") || (req.body.payBy && req.body.payBy !=="CARD" ) ){
            isValidOperation = false
        }
        if(!isValidOperation){
            return res.status(405).json({msg: "Operation not allowed"})
        }

        const reservation =  await Reservation.findOne({guestPhoneNumber: req.params.guestPhoneNumber, status: {"$ne": "CLOSED"} }).populate("parkingLot")

        if(!reservation){
            return res.status(404).json({msg: "Reservation not found"})
        }

        // add more validations??

        // generate paidCode if request.body.status = PAID and request.body.paidCode is undefined
        if(req.body.status && req.body.status === "PAID" && reservation.status === "OPEN"){
            req.body.paidCode = generatePaidCode()
        }

        // calculate price if request.body.endedAt is defined but reservation.endedAt is not defined
        if(req.body.endedAt  && !reservation.endedAt){
            const reservationDuration = new Date(reservation.createdAt) - new Date(req.body.endedAt)
            req.body.price = calculatePrice(reservation.parkingLot.pricing, reservationDuration)
        }

        reservation.forEach(update => reservation[update] = req.body[update])   
        
        await reservation.save()

        return res.status(200).json(reservation)
    }catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
})

/**
 * Only used to change status to closed
 */
ReservationRouter.patch("/reservations/:reservationId", async (req, res) => {
    try{
        
        const allowedUpdates = ["vehicle", "endedAt", "payBy", "status"]
        const requestedUpdates = Object.keys(req.body)
        const isValidOperation = requestedUpdates.every(update => allowedUpdates.includes(update))
        if((req.body.status && req.body.status ==="OPEN") || (req.body.payBy && req.body.payBy !=="CARD" ) ){
            isValidOperation = false
        }
        if(!isValidOperation){
            return res.status(405).json({msg: "Operation not allowed"})
        }

        const reservation =  await Reservation.findOne({_id: req.params.reservationId }).populate("parkingLot")

        if(!reservation){
            return res.status(404).json({msg: "Reservation not found"})
        }

        // generate paidCode if request.body.status = PAID and request.body.paidCode is undefined
        if(req.body.status && req.body.status === "PAID" && reservation.status === "OPEN"){
            req.body.paidCode = generatePaidCode()
        }

        // calculate price if request.body.endedAt is defined but reservation.endedAt is not defined
        if(req.body.endedAt  && !reservation.endedAt){
            const reservationDuration = new Date(reservation.createdAt) - new Date(req.body.endedAt)
            req.body.price = calculatePrice(reservation.parkingLot.pricing, reservationDuration)
        }

        reservation.forEach(update => reservation[update] = req.body[update])   
        
        await reservation.save()

        return res.status(200).json(reservation)
    }catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
})



ReservationRouter.get("/reservations/:reservationId", isAuthenticated, attachCurrentUser, isAdmin,  async (req, res) => {
    try{
        const reservations =  await Reservation.find()
        return res.status(200).json(reservations)
    }catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
})


const generatePaidCode = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let paidCode = ""
    var charactersLength = characters.length;
    
    for ( let i = 0; i < 5 ; i++ ) {
        paidCode += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return paidCode
}

const calculatePrice = (pricing, duration) => {
    return 100  // to be updated
}

export default ReservationRouter;