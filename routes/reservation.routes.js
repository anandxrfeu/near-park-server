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
        const allowedFields = ["vehicle", "owner", "guestUserPhone", "parkingLot"]
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
        const ticketNumber = generatePaidCode()
        console.log("ticketNumber", ticketNumber)
        const reservation = await Reservation.create({...req.body, ticket: ticketNumber})
        reservation.__v = undefined
        return res.status(201).json(reservation)

    }catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
} )

reservationRouter.get("/reservations/guest/:guestUserPhone", async (req, res) => {
    try{
        const reservation =  await Reservation.findOne({guestUserPhone: req.params.guestUserPhone, status: {"$ne": "CLOSED"} }, "-__v")//.populate("parkingLot")
        if(!reservation){
            return res.status(404).json({msg: "Reservation not found"})
        }
        await reservation.populate("parkingLot").execPopulate()
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
            req.body.price = calculatePrice(reservation.parkingLot.pricing, reservation.createdAt, req.body.endedAt)
        }

        requestedUpdates = Object.keys(req.body)
        requestedUpdates.forEach(update => reservation[update] = req.body[update])

        await reservation.save()
        reservation.__v = undefined
        return res.status(200).json(reservation)
    }catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
})

reservationRouter.patch("/reservations/:reservationId", isAuthenticated, attachCurrentUser, async (req, res) => {
    try{

        const allowedUpdates = ["vehicle", "endedAt", "payBy", "status", "guestUserPhone"]
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
            req.body.price = calculatePrice(reservation.parkingLot.pricing, reservation.createdAt, req.body.endedAt)
        }

        requestedUpdates = Object.keys(req.body)
        requestedUpdates.forEach(update => reservation[update] = req.body[update])
        reservation.__v = undefined
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


const calculatePrice = (pricing, start, end) => {
    console.log(pricing, start, end)
    const startDate = new Date(start)
    const endDate = new Date(end)
    let price = 0
    const durationInHours = Math.ceil((endDate.valueOf() - startDate.valueOf())/3600000)
    if(durationInHours >= 24){
        price = parseInt(pricing.twentyFourHourPrice) + (durationInHours - 24)*parseInt(pricing.oneHourAdditionalPrice)
    } else if (durationInHours >= 8 ){
        price = parseInt(pricing.eightHourPrice) + (durationInHours - 8)*parseInt(pricing.oneHourAdditionalPrice)
    }else{
        price = parseInt(pricing.oneHourPrice) + (durationInHours - 1)*parseInt(pricing.oneHourAdditionalPrice)
    }
    console.log("price > ",price)
    return price
}



export default reservationRouter;
