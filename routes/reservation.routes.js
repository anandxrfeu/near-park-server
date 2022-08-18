import {Router} from "express";

import Reservation from "../models/Reservation.model.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAdmin from "../middlewares/isAdmin.js";

const reservationRouter = Router();

/**
 * A reservation can b created by owner or driver. In both cases driver phone number (guestUserPhone) is a required entry
 * This end point is public so a non logged in user can make a reservation
 */
reservationRouter.post("/reservations", async (req, res) => {
    try{
        //check of all fields
        const allowedFields = ["ticketNumber","vehicle", "owner", "guestUserPhone", "parkingLot"]
        const providedFields = Object.keys(req.body)
        const isValidOperation = providedFields.every(field => allowedFields.includes(field))
        if(!isValidOperation){
            return res.status(405).json({msg: "Operation not allowed"})
        }
        //auto increment ticket number
        const existingReservations =  await Reservation.find({guestUserPhone: req.body.guestUserPhone, status: {"$ne": "CLOSED"}  })
        if(existingReservations.length !== 0){
            return res.status(405).json({msg: "User has an active reservation"})
        }
        const reservation = await Reservation.create(req.body)
        return res.status(201).json(reservation)

    }catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
} )

reservationRouter.get("/reservations/guest/:guestUserPhone", async (req, res) => {
    try{
        const reservation =  await Reservation.findOne({guestUserPhone: req.params.guestUserPhone, status: {"$ne": "CLOSED"} })//.populate("parkingLot")
        await reservation.populate("parkingLot").execPopulate()
        if(!reservation){
            return res.status(404).json({msg: "Reservation not found"})
        }
        return res.status(200).json(reservation)
    }catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
})

reservationRouter.get("/reservations/:reservationId/", isAuthenticated, attachCurrentUser,  async (req, res) => {
    try{
        
        const reservation =  await Reservation.findOne({_id: req.params.reservationId})
        await reservation.populate("parkingLot").execPopulate()
        if(!reservation){
            return res.status(404).json({msg: "Reservation not found"})
        }
        return res.status(200).json(reservation)
    }catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
})

reservationRouter.patch("/reservations/guest/:guestUserPhone", async (req, res) => {
    try{
        
        const allowedUpdates = ["vehicle", "endedAt", "payBy", "status"]
        let requestedUpdates = Object.keys(req.body)
        const isValidOperation = requestedUpdates.every(update => allowedUpdates.includes(update))
        if((req.body.status && req.body.status !=="PAID") || (req.body.payBy && req.body.payBy !=="CARD" ) ){
            isValidOperation = false
        }
        if(!isValidOperation){
            return res.status(405).json({msg: "Operation not allowed"})
        }

        const reservation =  await Reservation.findOne({guestUserPhone: req.params.guestUserPhone, status: {"$ne": "CLOSED"} }).populate("parkingLot")

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

        requestedUpdates = Object.keys(req.body)
        requestedUpdates.forEach(update => reservation[update] = req.body[update])   
        
        await reservation.save()

        return res.status(200).json(reservation)
    }catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
})

reservationRouter.patch("/reservations/:reservationId", isAuthenticated, attachCurrentUser, async (req, res) => {
    try{
        
        const allowedUpdates = ["vehicle", "endedAt", "payBy", "status"]
        let requestedUpdates = Object.keys(req.body)
        let isValidOperation = requestedUpdates.every(update => allowedUpdates.includes(update))
        if((req.body.status && req.body.status ==="OPEN") || (req.body.payBy && req.body.payBy !=="CARD" ) ){
            isValidOperation = false
        }
        if(!isValidOperation){
            return res.status(405).json({msg: "Operation not allowed"})
        }

        const reservation =  await Reservation.findOne({_id: req.params.reservationId}).populate("parkingLot")

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
            const reservationDuration =  new Date(req.body.endedAt) - new Date(reservation.createdAt)
            req.body.price = calculatePrice(reservation.parkingLot.pricing, reservationDuration)
        }

        requestedUpdates = Object.keys(req.body)
        requestedUpdates.forEach(update => reservation[update] = req.body[update])   
        
        await reservation.save()

        return res.status(200).json(reservation)
    }catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
})

reservationRouter.get("/reservations/:reservationId", isAuthenticated, attachCurrentUser, isAdmin,  async (req, res) => {
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
    console.log("pricing ",pricing)
    console.log("duration ", duration)
    return 100  // to be updated
}

export default reservationRouter;