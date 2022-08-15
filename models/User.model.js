import mongoose from 'mongoose';
const { Schema, model } = mongoose
import bcrypt from 'bcryptjs'

const salt_rounds = process.env.SALT_ROUNDS;

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["ADMIN", "OWNER"],
    required: true,
    default: "OWNER",
  },
  deletedAt:{
    type: Date
  },
  profileImageUrl: {
    type: String
  }

}, {
  timestamps: true
});

UserSchema.pre("save", function(next){
  const user = this;
  if(user.isModified("password")){
    const salt = bcrypt.genSaltSync(+salt_rounds);
    user.password = bcrypt.hashSync(user.password, salt);
  }
  next()
})

const User = model("User", UserSchema);

export default User
