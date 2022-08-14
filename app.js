import dotenv from 'dotenv/config'
import express from 'express'
import cors from 'cors'
import dbConnect from './config/db.config.js'
import userRouter from './routes/user.routes.js'
dbConnect()

const app = express();

app.use(express.json());
// Não esquecer de criar variável de ambiente com o endereço do seu app React (local ou no Netlify)
app.use(cors({ origin: process.env.REACT_APP_URL }));

app.use("/api", userRouter);

app.listen(Number(process.env.EXPRESS_PORT), () =>
  console.log(`Server up and running at port ${process.env.EXPRESS_PORT}`)
);
