import mongoose from 'mongoose';
const { Schema, model } = mongoose

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["ADMIN", "OWNER"],
    required: true,
    default: "OWNER",
  },
});

const User = model("User", UserSchema);

export default User
