import { Router } from "express";
import SubscriptionPlan from "../models/SubscriptionPlan.model.js"
import isAuthenticated from '../middlewares/isAuthenticated.js'
import attachCurrentUser from '../middlewares/attachCurrentUser.js';
import isAdmin from '../middlewares/isAdmin.js'

const SubscriptionPlanRouter = Router();

SubscriptionPlanRouter.post("/subscriptionPlans", isAuthenticated, attachCurrentUser, isAdmin, async (req, res) => {
    try{
        console.log("subscription plans..")
        const subscriptonPlan = await SubscriptionPlan.create(req.body)
        return res.status(201).json(subscriptonPlan)
    } catch(err){
        console.log(err)
        return res.status(500).json({msg: "Interval server error"})
    }
})

SubscriptionPlanRouter.get("/subscriptionPlans", isAuthenticated, attachCurrentUser, isAdmin, async (req, res) => {
    try{
        console.log(req.query.active)
        console.log(typeof req.query.active)
        const subscriptonPlans = await SubscriptionPlan.find(req.query.active === "true" ?  {deletedAt: {$exists: false}} : {})
        return res.status(200).json(subscriptonPlans)
    } catch(err){
        console.log(err)
        return res.status(500).json({msg: "Interval server error"})
    }
})

SubscriptionPlanRouter.get("/subscriptionPlans/:planId", isAuthenticated, attachCurrentUser, isAdmin, async (req, res) => {
    try{

        const subscriptonPlan = await SubscriptionPlan.find({_id: req.params.planId})
        if(!subscriptonPlan) {
            return res.status(404).json({msg: "Subscription plan not found"})
        }
        return res.status(200).json(subscriptonPlan)
    } catch(err){
        console.log(err)
        return res.status(500).json({msg: "Interval server error"})
    }
})

SubscriptionPlanRouter.delete("/subscriptionPlans/:planId", isAuthenticated, attachCurrentUser, isAdmin, async (req, res) => {
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

export default SubscriptionPlanRouter;