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
        const parkingLots = await ParkingLot.find({user: req.currentUser._id})
        return res.status(200).json(parkingLots)
    }catch(err){
        console.log(err);
        return res.status(500).json({msg: "Internal server error."})
    }
} )

parkingLotRouter.get("/parkingLots/:parkingLotId", isAuthenticated, attachCurrentUser, async (req, res) => {
    try{
        const parkingLot = await ParkingLot.findOne({_id: req.params.parkingLotId})
        if(!parkingLot){
            res.status(404).json({ msg: "Parking lot not found."})
        }
        return res.status(200).json(parkingLot)
    }catch(err){
        console.log(err);
        return res.status(500).json({msg: "Internal server error."})
    }
} )




export default parkingLotRouter;