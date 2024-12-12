import mongoose from "mongoose";
import nodemailer from 'nodemailer';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import OTP from "../models/otpModel.js";

const createUser = async (req, res) => {
  try {
    req.body.email = req.body.email.toLowerCase().trim();
    const user = await User.create(req.body);

    const token = createUserToken(user._id);

    res.cookie("user_jwt", token, {  // Use "user_jwt" cookie name
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 720,  // 30 days
    });

    res.status(201).json({
      message: "success",
    });
  } catch (error) {
    console.log("ERROR", error);

    let errors = {};

    if (error.code === 11000) {
      errors.email = "Already registered with this e-mail before.";
    }

    if (error.name === "ValidationError") {
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
    }

    res.status(400).json({
      message: "error",
      errors,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    req.body.email = req.body.email.toLowerCase().trim();
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    let same = false;

    if (user) {
      same = await bcrypt.compare(password, user.password);
    } else {
      return res.status(401).json({
        succeeded: false,
        error: "No such user was found",
      });
    }

    if (same) {
      const token = createUserToken(user._id);
      res.cookie("user_jwt", token, {  
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 720,  // 30 days
      });

      res.json({
        succeeded: true,
        message: "Login successful",
      });
    } else {
      res.status(401).json({
        succeeded: false,
        error: "Wrong password",
      });
    }
  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error,
    });
  }
};

const createUserToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  return token;
};

const resetPassword = async (req, res) => {
  const { email, newPassword, otpCode } = req.body;

  const user = await User.findByEmail(email);

  const otp = await OTP.findOne({ email, otp: otpCode });

  if (!otp) {
    res.status(400).send("Invalid or expired OTP code");
    return;
  }

  await user.changePassword(newPassword);

  res.status(200).send("Password updated successfully");
};

const purchaseToken = async (req, res) => {
  try {
    const token = req.cookies.user_jwt; 
    if (!token) {
      return res.status(401).send('Authentication token is missing');
    }

    
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
 

    const user = await User.findById(decodedToken.userId);
    const userId = user._id;

    var utcTime = new Date().toISOString().slice(11, 16).replace(":", "");
    var last6digit = userId.toString().slice(-6);
    var orderId = last6digit + "-" + utcTime;

    const { orderAmount, paymentMethod, transactionHash, orderDate } = req.body;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const pendingPurchase = {
      orderId,
      orderAmount,
      paymentMethod,
      transactionHash,
      orderDate,
    };
    // Add the pending purchase to the user's document
    user.pendingPurchase.push(pendingPurchase);
    await user.save();

    // Sending email notification
    const notificationEmail = process.env.NODE_NOTIFICATIONMAIL; 
    const transporter = nodemailer.createTransport({
        host: process.env.NODE_MAILHOST,
        port: 465,
        secure: true,
        auth: {
            user: process.env.NODE_MAIL,
            pass: process.env.NODE_PASS,
      },
    });

    const mailOptions = {
      from: `DogGuardians <${process.env.NODE_MAIL}>`,
      to: notificationEmail,
      subject: `New Purchase Order ID : ${orderId}`,
      html: `<p>User ID: ${userId}</p>
      <p>Order Amount: ${orderAmount}</p>
      <p>Payment Method: ${paymentMethod}</p>
      <p>Transaction Hash: ${transactionHash}</p>
      <p>Order Date: ${orderDate}</p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('Error sending new purchase notification email:', error);
      }
    });

    return res
      .status(201)
      .json({ message: "We have received your purchase request. We will review it shortly, and once confirmed, you will receive a confirmation email" });
  } catch (error) {
    console.error('Error creating pending purchase:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};




export { createUser, loginUser, resetPassword, purchaseToken, createUserToken };
