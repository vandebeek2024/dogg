import mongoose from "mongoose";

const { Schema } = mongoose;

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: { 
    type: Date, 
    expires: '10m' },
});

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;