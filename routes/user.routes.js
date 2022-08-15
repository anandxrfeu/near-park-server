import { Router } from 'express'
import bcrypt from 'bcryptjs'

import User from '../models/User.model.js'
import generateToken from '../config/jwt.config.js';
import isAuthenticated from '../middlewares/isAuthenticated.js'
import attachCurrentUser from '../middlewares/attachCurrentUser.js';
import isAdmin from '../middlewares/isAdmin.js'

const userRouter = Router()

userRouter.post("/users/signup", async (req, res) => {
  try {
    const { password } = req.body;
    if (
      !password ||
      !password.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/
      )
    ) {
      return res.status(400).json({
        msg: "Password is required and must have at least 8 characters, uppercase and lowercase letters, numbers and special characters.",
      });
    }
    const result = await User.create(req.body)
    result.password = undefined
    result.__v = undefined
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

userRouter.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "This email is not yet registered in our website;" });
    }
    if(user.deletedAt){
      return res.status(401).json({msg: "You do not have permission to this." })
    }
    if (bcrypt.compareSync(password, user.password)) {
      const token = generateToken(user);

      return res.status(200).json({
        user: {
          name: user.name,
          email: user.email,
          _id: user._id,
          role: user.role,
        },
        token,
      });
    } else {
      return res.status(401).json({ msg: "Wrong password or email" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

userRouter.get("/users/profile", isAuthenticated, attachCurrentUser, (req, res) => {

  try {
    const loggedInUser = req.currentUser;

    if (loggedInUser) {
      return res.status(200).json(loggedInUser);
    } else {
      return res.status(404).json({ msg: "User not found." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

userRouter.patch("/users/profile", isAuthenticated, attachCurrentUser, async (req, res) => {
  try {
    
    const allowedUpdates = ["name", "profileImageUrl", "password"]
    const requestedUpdates = Object.keys(req.body)
    const isValidOperaton = requestedUpdates.every(update => allowedUpdates.includes(update))

    if(!isValidOperaton){
      return res.status(405).json({msg: "Method not allowed"})
    }
    const loggedInUser = req.currentUser;
    requestedUpdates.forEach(update => loggedInUser[update] = req.body[update])
    await loggedInUser.save()
    return res.status(200).json(loggedInUser)
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

userRouter.delete("/users/profile", isAuthenticated, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;
    loggedInUser.deletedAt = Date.now()
    await loggedInUser.save()
    return res.status(204).json(loggedInUser)
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// get all users as admin
userRouter.get("/users", isAuthenticated, attachCurrentUser, isAdmin, async (req, res) => {
  try{
    const users = await User.find(
                        req.query.role ? {role: req.query.role.toUpperCase()} : {}
                        //,req.query.role ? {role: req.query.role.toUpperCase()} : {}
                        )
   // const users = await User.find({role: "OWNER"})
    return res.status(200).json(users)
  }catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
} )

// make owner active or inactive as admin
userRouter.patch("/users/:userId", isAuthenticated, attachCurrentUser, isAdmin, async (req, res) => {
  try{
    const {userId} = req.params
    const requestedOperations = Object.keys(req.body)
    const isValidOperation = requestedOperations.length === 1 && 
                             requestedOperations.includes("active") &&
                             userId !== req.currentUser._id.toString()

    if(!isValidOperation){
      return res.status(405).json({msg: "Method not allowed"})

    }
    const user = await User.findByIdAndUpdate(userId, req.body.active === true ? {deletedAt: undefined} :  {deletedAt: Date.now()} , {new: true})
    console.log(user)
    if(!user){
      return res.status(404).json({ msg: "User not found." });
    }
    return res.status(200).json(user)
    
  }catch(err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error." });
  }
} )

export default userRouter;
