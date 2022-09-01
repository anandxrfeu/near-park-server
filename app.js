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

var whitelist = [process.env.REACT_WEB_APP_URL , process.env.REACT_MOBILE_APP_URL ]
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

// Não esquecer de criar variável de ambiente com o endereço do seu app React (local ou no Netlify)
//app.use(cors({ origin: process.env.REACT_APP_URL }));
app.use(cors())

app.get("/api/health", (req, res)=>{
  return res.status(200).json({ok: true})
})
app.use("/api", cors(corsOptions), userRouter);
app.use("/api", cors(corsOptions), fileRouter);
app.use("/api", cors(corsOptions), parkingLotRouter);
app.use("/api", cors(corsOptions), reservationRouter);
app.use("/api", cors(corsOptions), subscriptionPlanRouter);
app.use("/api", cors(corsOptions), userSubscriptionRouter);
app.use("/api", cors(corsOptions), subscriptionPaymentRouter);

app.listen(Number(process.env.PORT), () =>
  console.log(`Server up and running at port ${process.env.PORT}`)
);
