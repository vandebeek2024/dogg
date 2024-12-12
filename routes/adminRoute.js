import express from "express";
import * as adminController from "../controllers/adminController.js";
import * as adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();


router.route('/login').post(adminController.loginAdmin);
router.route("/admindashboard").get(adminMiddleware.authenticateToken,adminController.getAdminDashoardPage);
router.route("/searchpanel").get(adminMiddleware.authenticateToken,adminController.getSearchPanelPage);
router.route("/searchpanel").get(adminMiddleware.authenticateToken,adminController.getSearchPanelPage);
router.route('/purchaseconfirmation').post(adminMiddleware.authenticateToken,adminController.purchaseConfirmation);
router.route('/updateuserdetails').post(adminMiddleware.authenticateToken,adminController.updateUserDetails);
router.route('/finduserwithlast6digit').get(adminMiddleware.authenticateToken,adminController.finduserwithlast6digit);



export default router;