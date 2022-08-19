import dotenv from 'dotenv/config'
import express from 'express'
import cors from 'cors'
import dbConnect from './config/db.config.js'
import userRouter from './routes/user.routes.js'
import fileRouter from './routes/file.routes.js'
import parkingLotRouter from './routes/parkingLot.routes.js'
import reservationRouter from './routes/reservation.routes.js'
import subscriptionPlanRouter from "./routes/subscriptionPlan.routes.js"
import userSubscriptionRouter from "./routes/userSubscription.routes.js"
import subscriptionPaymentRouter from "./routes/subscriptionPayment.routes.js"

dbConnect()

const app = express();

app.use(express.json());
// Não esquecer de criar variável de ambiente com o endereço do seu app React (local ou no Netlify)
app.use(cors({ origin: process.env.REACT_APP_URL }));

app.use("/api", userRouter);
app.use("/api", fileRouter);
app.use("/api", parkingLotRouter);
app.use("/api", reservationRouter);
app.use("/api", subscriptionPlanRouter);
app.use("/api", userSubscriptionRouter);
app.use("/api", subscriptionPaymentRouter);

app.listen(Number(process.env.EXPRESS_PORT), () =>
  console.log(`Server up and running at port ${process.env.EXPRESS_PORT}`)
);


const pricing =  {
     "oneHourPrice" : 25,
    "oneHourAdditionalPrice" : 15,
    "eightHourPrice" : 75,
    "twentyFourHourPrice" : 110
} 

const start = "2022-08-19T00:00:00.000Z"
const end  = "2022-08-19T05:30:00.000Z"

 const calculatePrice = (pricing, start, end) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    let price = 0
    const durationInHours = Math.ceil((endDate.valueOf() - startDate.valueOf())/3600000)
    if(durationInHours >= 24){
        price = parseInt(pricing.twentyFourHourPrice) + (durationInHours - 24)*parseInt(pricing.oneHourAdditionalPrice)
    } else if (durationInHours >= 8 ){
        price = parseInt(pricing.eightHourPrice) + (durationInHours - 8)*parseInt(pricing.oneHourAdditionalPrice)
    }else{
        price = parseInt(pricing.oneHourPrice) + (durationInHours - 1)*parseInt(pricing.oneHourAdditionalPrice)
    }
    return price
}

//console.log(calculatePrice(pricing, start, end))
