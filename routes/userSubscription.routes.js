import { Router } from "express";
import UserSubscription from "../models/UserSubscription.model.js";
import isAuthenticated from '../middlewares/isAuthenticated.js'
import attachCurrentUser from '../middlewares/attachCurrentUser.js';

const userSubscriptionRouter = Router();

userSubscriptionRouter.post("/userSubscriptions", isAuthenticated, attachCurrentUser, async (req, res) => {
    try{
        const existingUserSubscriptions = await UserSubscription.find({user: req.currentUser._id, status: "ACTIVE"})
        if(existingUserSubscriptions.length !== 0){
            return res.status(405).json({msg: "User has active subscription"})
        }
        const userSubscription = await UserSubscription.create(req.body)
        return res.status(201).json(userSubscription)
    }catch(err){
        console.log(err)
        return res.status(500).json({msg : "Internal server error"})
    }
} )

userSubscriptionRouter.patch("/userSubscriptions/:id", isAuthenticated, attachCurrentUser, async (req, res) => {
    try{
        const isValidOperation = req.body.status !== undefined && ["ACTIVE", "INACTIVE"].includes(req.body.status)
        if(!isValidOperation){
            return res.status(405).json({msg : "Operation not allowed"})
        }
        const userSubscription = await UserSubscription.findOneAndUpdate({_id:id}, req.body, {new: true})
        if(!userSubscription){
            return res.status(404).json({msg: "UserSubscription not found"})
        }
        return res.status(200).json(userSubscription)
    }catch(err){
        console.log(err)
        return res.status(500).json({msg : "Internal server error"})
    }
} )

// get subscription for a user is in userRouter


export default userSubscriptionRouter;