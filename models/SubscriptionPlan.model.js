import mongoose from 'mongoose';
const { Schema, model } = mongoose

const subscriptionPlanSchema = new Schema({
    name:{
        type: String,
        trim: true,
        required: true
    },
    benefits:{
        type: [String],
        required: true
    },
    pricePerTransaction: {
        type: Number
        //add validation
    },
    pricePerMonth:{
        type: Number
        //add validation
    },
    callToAction:{
        type: String,
        default: "subscribe"
    },
    deletedAt:{
        type: Date
    }
},{
    timestamps: true
  })

const subscriptionPlan = model("SubscriptionPlan", subscriptionPlanSchema)

export default subscriptionPlan;