import mongoose from "mongoose";

const { Schema, model } = mongoose;

const subscrptionPaymentSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        requird: true
    },
    subscriptionPrice:{
        type: String,
        required: true
    }
}, {
  timestamps: true
})

const SubscriptionPayment = model("SubscriptionPayment", subscrptionPaymentSchema)

export default SubscriptionPayment;

