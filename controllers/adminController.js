import mongoose from "mongoose";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import OTP from "../models/otpModel.js";

const loginAdmin = async (req, res) => {
  try {
    req.body.email = req.body.email.toLowerCase().trim();
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    let same = false;

    if (admin) {
      same = await bcrypt.compare(password, admin.password);
    } else {
      return res.status(401).json({
        succeeded: false,
        error: "No such admin was found",
      });
    }

    if (same) {
      const token = createAdminToken(admin._id);
      res.cookie("admin_jwt", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 720, // 30 days
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

const createAdminToken = (adminId) => {
  const token = jwt.sign({ adminId }, process.env.JWT_ADMINSECRET, {
    expiresIn: "30d",
  });
  return token;
};

const getAdminDashoardPage = async (req, res) => {
  const userid = req.query.id;
  try {
    const user = await User.findById(userid)
      .populate("pendingPurchase")
      .populate("confirmedPurchase");
    if (!user) {
      return res.status(404).send("User not found");
    }

    const pendingPurchases = user.pendingPurchase;
    const confirmedPurchases = user.confirmedPurchase;

    res.render("admindashboard", {
      link: "admindashboard",
      user,
      pendingPurchases,
      confirmedPurchases,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const purchaseConfirmation = async (req, res) => {
  try {
    const userId = req.body.userId;
    const userEmail = req.body.userEmail;
    const userName = req.body.userName;
    const userSurname = req.body.userSurname;
    const userIDlast6digit = userId.toString().slice(-6);
    const user = await User.findById(userId);

    const { orderAmount, paymentMethod, transactionHash, orderDate, orderId } =
      req.body;
    const doggamount = orderAmount * 10000;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user's token balance
    user.tokenbalance += doggamount;
    await user.save();

    const confirmedPurchase = {
      orderId,
      orderAmount,
      paymentMethod,
      transactionHash,
      orderDate,
    };

    // Find the index of the pending purchase in the user's pendingPurchase array
    const index = user.pendingPurchase.findIndex(
      (purchase) => purchase.orderId === orderId
    );

    if (index !== -1) {
      // Remove the pending purchase from the array
      user.pendingPurchase.splice(index, 1);
    }

    // Add the confirmed purchase to the user's document
    user.confirmedPurchase.push(confirmedPurchase);
    await user.save();

    // Sending purchase confirmation email notification
    const transporter = nodemailer.createTransport({
      host: process.env.NODE_MAILHOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODE_NOREPLYMAIL,
        pass: process.env.NODE_PASS,
      },
    });

    const mailOptions = {
      from: `DogGuardians <${process.env.NODE_NOREPLYMAIL}>`,
      to: userEmail,
      subject: `Token Purchase Confirmation`,
      html: `<p>Dear ${userName} ${userSurname}, your $DOGG purchase order <b>has confirmed.</b></p>
       <p><b>Order details</b></p>
       <p>Order ID : ${orderId} </p>
       <p>Order Amount : ${orderAmount} ${paymentMethod} ≈ ${doggamount} $DOGG</p><br>
       <p>To learn about next steps of the ICO and meet again Purchase Terms, you can visit here :</p>
       <a target="_blank" href="https://www.guardians.dog/whitepaper#page=5" style="text-decoration: underline;">https://www.guardians.dog/whitepaper#page=5</a><br>
       <p style:"font-weight=bold;">Invite friend and earn 100000 $DOGG, your Referral Link :</p>
       <p>https://guardians.dog/join?refcode=${userIDlast6digit}</p>
       `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Error sending new purchase notification email:", error);
      }
    });

    return res.status(201).json({ message: "Order confirmed" });
  } catch (error) {
    console.error("Error creating confirmed purchase:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateUserDetails = async (req, res) => {
  const {
    id,
    name,
    surname,
    email,
    country,
    referrerID,
    walletaddress,
    tokenbalance,
    referralearning,
  } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user details
    user.name = name;
    user.surname = surname;
    user.email = email;
    user.country = country;
    user.referrerID = referrerID;
    user.walletaddress = walletaddress;
    user.tokenbalance = tokenbalance;
    user.referralearning = referralearning;

    // Save the updated user
    await user.save();

    return res
      .status(200)
      .json({ message: "User details updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getSearchPanelPage = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Calculate totals
    let totalPending = 0;
    let totalConfirmed = 0;

    users.forEach(user => {
      // Sum pendingPurchase amounts
      totalPending += user.pendingPurchase.reduce((sum, purchase) => sum + purchase.orderAmount, 0);

      // Sum confirmedPurchase amounts
      totalConfirmed += user.confirmedPurchase.reduce((sum, purchase) => sum + purchase.orderAmount, 0);
    });

    // Render the view with calculated totals
    res.render("searchpanel", {
      link: "searchpanel",
      totalPending,
      totalConfirmed,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
};

const finduserwithlast6digit = async (req, res) => {
  try {
    const last6digit = req.query.last6;
    const allusers = await User.find({}, "_id");
    const userIds = allusers.map((user) => user._id.toHexString());

    const filteredUserIds = userIds.filter((id) => id.slice(-6) === last6digit);

    const users = await User.find({ _id: { $in: filteredUserIds } });

    // Extract _id and email from each user
    const extractedData = users.map((user) => {
      return {
        _id: user._id,
        email: user.email,
      };
    });
  
    // Convert extracted data to JSON
    const extractedJson = JSON.stringify(extractedData);
  
    res.json(extractedJson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {
  loginAdmin,
  getAdminDashoardPage,
  getSearchPanelPage,
  createAdminToken,
  purchaseConfirmation,
  updateUserDetails,
  finduserwithlast6digit,
};
