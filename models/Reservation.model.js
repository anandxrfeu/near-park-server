import mongoose from 'mongoose';
const { Schema, model } = mongoose

const reservationSchema = new Schema({

    ticket:{
        type: String,
        required: true,
        unique: true
    },
    vehicle : {
        type:{
            type: String,
            enum: ["CAR", "MOTORBIKE"],
            required: true,
        },
        licensePlate:{
            type: String,
            required: true
            //add validation
        },
        description: {
            type: String,
            required: true
        }
    },
    endedAt:{
        type: Date
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    guestUserPhone:{
        type: String,
        required: true
        //add validation
    },
    status:{
        type: String,
        enum: ["OPEN", "PAID", "CLOSED"],
        default: "OPEN"
    },
    payBy:{
        type: String,
        enum: ["CARD", "CASH"],
        default: "CASH"
    },
    paidCode:{
        type: String
    },
    price:{
        type: Number
    },
    parkingLot:{
        type: Schema.Types.ObjectId,
        ref: "ParkingLot",
        required: true
    }
}, {timestamps: true}
)

const Reservation = model("Reservation", reservationSchema)

export default Reservation;