import { Router } from "express";
import SubscriptionPlan from "../models/SubscriptionPlan.model.js"
import isAuthenticated from '../middlewares/isAuthenticated.js'
import attachCurrentUser from '../middlewares/attachCurrentUser.js';
import isAdmin from '../middlewares/isAdmin.js'

const subscriptionPlanRouter = Router();

subscriptionPlanRouter.post("/subscriptionPlans", isAuthenticated, attachCurrentUser, isAdmin, async (req, res) => {
    try{
        const subscriptonPlan = await SubscriptionPlan.create(req.body)
        subscriptonPlan.__v = undefined
        return res.status(201).json(subscriptonPlan)
    } catch(err){
        console.log(err)
        return res.status(500).json({msg: "Interval server error"})
    }
})

subscriptionPlanRouter.get("/subscriptionPlans", async (req, res) => {
    try{
        const subscriptonPlans = await SubscriptionPlan.find(req.query.active === "true" ?  {deletedAt: {$exists: false}} : {}, "-__v")
        return res.status(200).json(subscriptonPlans)
    } catch(err){
        console.log(err)
        return res.status(500).json({msg: "Interval server error"})
    }
})

subscriptionPlanRouter.get("/subscriptionPlans/:planId", isAuthenticated, attachCurrentUser, isAdmin, async (req, res) => {
    try{

        const subscriptonPlan = await SubscriptionPlan.findOne({_id: req.params.planId})
        if(!subscriptonPlan) {
            return res.status(404).json({msg: "Subscription plan not found"})
        }
        subscriptonPlan.__v = undefined
        return res.status(200).json(subscriptonPlan)
    } catch(err){
        console.log(err)
        return res.status(500).json({msg: "Interval server error"})
    }
})

subscriptionPlanRouter.patch("/subscriptionPlans/:planId", isAuthenticated, attachCurrentUser, isAdmin, async (req, res) => {
    try{
        const allowedUpdates = ["benefits", "pricePerTransaction", "pricePerMonth", "callToAction"]
        const requestedUpdates = Object.keys(req.body)
        const isValidOperation = requestedUpdates.every( update => allowedUpdates.includes(update))

        if(!isValidOperation){
            return res.status(405).json({msg: "Operation not allowed"})
        }
        const subscriptionPlan = await SubscriptionPlan.findOneAndUpdate({_id: req.params.planId, deletedAt: {$exists: false}} , req.body, {new: true})
        if(!subscriptionPlan){
            return res.status(405).json({msg: "Operation not allowed"})
        }
        subscriptionPlan.__v = undefined
        return res.status(200).json(subscriptionPlan)
    } catch(err){
        console.log(err)
        return res.status(500).json({msg: "Interval server error"})
    }
})

subscriptionPlanRouter.delete("/subscriptionPlans/:planId", isAuthenticated, attachCurrentUser, isAdmin, async (req, res) => {
    try{

        const subscriptonPlan = await SubscriptionPlan.findOneAndUpdate({_id: req.params.planId}, {deletedAt: new Date()}, {new: true})
        if(!subscriptonPlan) {
            return res.status(404).json({msg: "Subscription plan not found"})
        }
        return res.status(204).json(subscriptonPlan)
    } catch(err){
        console.log(err)
        return res.status(500).json({msg: "Interval server error"})
    }
})

export default subscriptionPlanRouter;