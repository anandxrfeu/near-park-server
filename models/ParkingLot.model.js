import mongoose from 'mongoose';
const { Schema, model } = mongoose

const parkingLotSchema = new Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    address:{
        type: String,
        required: true,
        trim: true
    },
    pricing:{
        oneHourPrice:{
            type: Number,
            required: true,
            validate(value){
                if(value < 0) throw new Error("Price should be greater than Zero")
            }
        },
        oneHourAdditionalPrice:{
            type: Number,
            required: true,
            validate(value){
                if(value < 0) throw new Error("Price should be greater than Zero")
            }
        },
        eightHourPrice:{
            type: Number,
            required: true,
            validate(value){
                if(value < 0) throw new Error("Price should be greater than Zero")
            }
        },
        twentyFourHourPrice:{
            type: Number,
            required: true,
            validate(value){
                if(value < 0) throw new Error("Price should be greater than Zero")
            }
        }
    },
    maxOccupancy:{
        type: Number,
        required: true,
        validate(value){
            if(value <=0 ) throw new Error("Occupancy should be greater than 1")
        }
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, {
    timestamps: true
  })

const ParkingLot = model("ParkingLot", parkingLotSchema)

export default ParkingLot;