import express from "express";
import * as pageController from "../controllers/pageController.js";
import * as authMiddleware from "../middlewares/authMiddleware.js";


const router = express.Router();

router.route("/").get(pageController.getIndexPage);
router.route("/sitemap.xml").get(pageController.getSiteMapPage);
router.route("/privacy-policy").get(pageController.getPrivacyPolicyPage);
router.route("/terms-conditions").get(pageController.getTermsandConditionsPage);
router.route("/join").get(pageController.getRegisterPage);
router.route("/login").get(pageController.getLoginPage);
router.route("/userlogout").get(pageController.getUserLogout);
router.route("/adminlogout").get(pageController.getAdminLogout);
router.route("/resetpassword").get(pageController.getResetPasswordPage);
router.route("/ico-dashboard").get(authMiddleware.authenticateToken,pageController.getIcoPage);
router.route("/adminlogin").get(pageController.getAdminLoginPage);

export default router;