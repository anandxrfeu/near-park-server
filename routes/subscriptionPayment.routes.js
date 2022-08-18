import { Router } from "express";
import isAuthenticated from '../middlewares/isAuthenticated.js'
import attachCurrentUser from '../middlewares/attachCurrentUser.js';
import isAdmin from '../middlewares/isAdmin.js'

const subscriptionPaymentRouter = Router();

subscriptionPaymentRouter.get("/subscriptionPayments",isAuthenticated, attachCurrentUser,isAdmin,  async (req, res) => {
    try{
        const subscriptionPayments = await SubscriptionPayment.find( req.query.userId ?  {user: req.query.userId} : {})
        return res.status(200).json(subscriptionPayments)
    }catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error"})
    }
} )

export default subscriptionPaymentRouter;