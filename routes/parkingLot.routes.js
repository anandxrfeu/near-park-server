import {Router} from "express";

import ParkingLot from "../models/ParkingLot.model.js";
import isAuthenticated from '../middlewares/isAuthenticated.js'
import attachCurrentUser from '../middlewares/attachCurrentUser.js';

const parkingLotRouter = Router();

parkingLotRouter.post("/parkingLots", isAuthenticated, attachCurrentUser, async (req, res) => {
    try{
        const parkingLot = await ParkingLot.create({
            ...req.body,
            user: req.currentUser._id
        })
        parkingLot.__v = undefined;
        parkingLot.createdAt = undefined;
        parkingLot.updatedAt = undefined;
        return res.status(201).json(parkingLot)

    }catch(err){
        console.log(err);
        return res.status(500).json({msg: "Internal server error."})
    }
} )

parkingLotRouter.get("/parkingLots", isAuthenticated, attachCurrentUser, async (req, res) => {
    try{
        const parkingLots = await ParkingLot.find({user: req.currentUser._id}, "-__v")
        return res.status(200).json(parkingLots)
    }catch(err){
        console.log(err);
        return res.status(500).json({msg: "Internal server error."})
    }
} )

parkingLotRouter.get("/parkingLots/:parkingLotId/pricing",  async (req, res) => {
    try{
        const parkingLot = await ParkingLot.findOne({_id: req.params.parkingLotId})
        if(!parkingLot){
            return res.status(404).json({ msg: "Parking lot not found."})
        }
        parkingLot.__v = undefined
        return res.status(200).json(parkingLot.pricing)
    }catch(err){
        console.log(err);
        return res.status(500).json({msg: "Internal server error."})
    }
} )

parkingLotRouter.get("/parkingLots/:parkingLotId", isAuthenticated, attachCurrentUser, async (req, res) => {
    try{
        const parkingLot = await ParkingLot.findOne({_id: req.params.parkingLotId, user: req.currentUser._id})
        if(!parkingLot){
            return res.status(404).json({ msg: "Parking lot not found."})
        }
        parkingLot.__v = undefined
        return res.status(200).json(parkingLot)
    }catch(err){
        console.log(err);
        return res.status(500).json({msg: "Internal server error."})
    }
} )

parkingLotRouter.patch("/parkingLots/:parkingLotId", isAuthenticated, attachCurrentUser, async (req, res) => {
    try{
        const allowedUpdates = ["name", "address", "pricing", "maxOccupancy"]
        const requestedUpdates = Object.keys(req.body)
        const isValidOperation = requestedUpdates.every(update => allowedUpdates.includes(update))
        if(!isValidOperation){
            return res.status(405).json({msg: "Operation not allowed"})
        }
        const parkingLot = await ParkingLot.findOne({_id: req.params.parkingLotId, user: req.currentUser._id})
        if(!parkingLot){
            return res.status(404).json({msg: "Parking lot not found"})
        }
        //TO DO
        // check if parking lot has an active reservation
        // use populate
        requestedUpdates.forEach(update => parkingLot[update] = req.body[update])
        await parkingLot.save()
        parkingLot.__v = undefined
        return res.status(200).json(parkingLot)
    }catch(err){
        console.log(err);
        return res.status(500).json({msg: "Internal server error."})
    }
} )

parkingLotRouter.delete("/parkingLots/:parkingLotId", isAuthenticated, attachCurrentUser, async (req, res) => {
    try{
         //TO DO
        // check if parking lot has an active reservation
        // use populat
        const parkingLot = await ParkingLot.findOneAndDelete({_id: req.params.parkingLotId, user: req.currentUser._id})
        if(!parkingLot){
            return res.status(404).json({ msg: "Parking lot not found."})
        }
        return res.status(204).json(parkingLot)
    }catch(err){
        console.log(err);
        return res.status(500).json({msg: "Internal server error."})
    }
} )

parkingLotRouter.get("/parkingLots/:parkingLotId/reservations", isAuthenticated, attachCurrentUser, async (req, res) => {
    try{
        const parkingLot = await ParkingLot.findOne({_id: req.params.parkingLotId, user: req.currentUser._id})
        await parkingLot.populate("reservations").execPopulate()
        return res.status(200).json(parkingLot.reservations)
    }catch(err){
        console.log(err);
        return res.status(500).json({msg: "Internal server error."})
    }
} )


export default parkingLotRouter;
