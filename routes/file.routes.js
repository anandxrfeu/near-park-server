import { Router } from "express";

import fileUpload from "../config/cloudinary.config.js"
import isAuthenticated from '../middlewares/isAuthenticated.js'


const fileRouter = Router()

fileRouter.post("/imageUpload", isAuthenticated, fileUpload.single("imageUrl"), async (req, res) => {
    try{
        if(!req.file){
            return res.status(422).json({msg: "You must upload a file."})
        }
        return res.status(200).json({filePath: req.file.path}) 
    }catch(err){
        console.log(err)
        return res.status(500).json({msg: "Internal server error."})
    }
})


export default fileRouter;