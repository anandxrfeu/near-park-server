import mongoose from 'mongoose';
const { Schema, model } = mongoose

const userSubscriptionSchema = new Schema({
    subscriptionPlan : {
        type: Schema.Types.ObjectId,
        ref: "SubscriptionPlan",
        required: true
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        required: true,
        default: "ACTIVE",
      }
})

const UserSubscription = model("UserSubscription", userSubscriptionSchema);

export default UserSubscription;