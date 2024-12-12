import jwt from "jsonwebtoken";
import User from '../models/userModel.js';


const getIndexPage = async (req, res) => {
 
  res.render('index', {
    link: 'index'
  });
};

const getSiteMapPage = (req, res) => {
  res.sendFile('/public/sitemap.xml');
};


const getPrivacyPolicyPage = (req, res) => {
  res.render('privacy-policy', {
    link: 'privacy-policy',
  });
};

const getTermsandConditionsPage = (req, res) => {
  res.render('terms-conditions', {
    link: 'terms-conditions',
  });
};



const getRegisterPage = (req, res) => {
 const refcode = req.query.refcode ;
  
  if (req.cookies.user_jwt) {
    return res.redirect('/ico-dashboard');
  } else {
  res.render('join', {
    link: 'join',
    refcode 
  });}
};

const getLoginPage = (req, res) => {
  if (req.cookies.user_jwt) {
    return res.redirect('/ico-dashboard');
  } else {
  res.render('login', {
    link: 'login',
  });}
};

const getIcoPage = async (req, res) => {
  try {
    const token = req.cookies.user_jwt; 
    if (!token) {
      return res.status(401).send('Authentication token is missing');
    }

    
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
 

    const user = await User.findById(decodedToken.userId) 
      .populate('pendingPurchase')
      .populate('confirmedPurchase'); 

    if (!user) {
      return res.status(404).send('User not found');
    }

    const userID = user._id;
    const userIDlast6digit = userID.toString().slice(-6);
    const tokenbalance = user.tokenbalance;
    const referralearning = user.referralearning;
    const pendingPurchases = user.pendingPurchase;
    const confirmedPurchases = user.confirmedPurchase; 

    res.render('ico-dashboard', {
      link: 'ico-dashboard',
      tokenbalance,
      referralearning,
      pendingPurchases,
      confirmedPurchases,
      userIDlast6digit
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};




const getUserLogout = (req, res) => {
  res.cookie('user_jwt', '', {
    maxAge: 1,
  });
  res.redirect('/');
};

const getAdminLogout = (req, res) => {
  res.cookie('admin_jwt', '', {
    maxAge: 1,
  });
  res.redirect('/');
};



const getResetPasswordPage = (req, res) => {
  if (req.cookies.user_jwt) {
    return res.redirect('/ico-dashboard');
  } else {
  res.render('resetpassword', {
    link: 'resetpassword',
  });}
};

const getAdminLoginPage = (req, res) => {
  if (req.cookies.admin_jwt) {
    return res.redirect('/admin/searchpanel');
  } else {
  res.render('adminlogin', {
    link: 'adminlogin',
  });}
};



export {
  getIndexPage,
  getRegisterPage,
  getLoginPage,
  getUserLogout,
  getAdminLogout,
  getResetPasswordPage,
  getPrivacyPolicyPage,
  getTermsandConditionsPage,
  getSiteMapPage,
  getIcoPage,
  getAdminLoginPage,
};
