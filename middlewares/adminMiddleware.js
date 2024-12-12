import Admin from '../models/adminModel.js';
import jwt from "jsonwebtoken";

const checkAdmin = async (req, res, next) => {
    const token = req.cookies.admin_jwt;  

    if (token) {
        jwt.verify(token, process.env.JWT_ADMINSECRET, async (err, decodedToken) => {
            if (err) {
                console.log('Admin token verification error:', err.message);
                res.locals.user = null;
                next();
            } else {
                const user = await Admin.findById(decodedToken.userId);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};

const authenticateToken = async (req, res, next) => {
    try {
        const token = req.cookies.admin_jwt;  
        if (token) {
            jwt.verify(token, process.env.JWT_ADMINSECRET, (err) => {
                if (err) {
                    console.log('Admin authentication error:', err.message);
                    res.redirect("/adminlogin");
                } else {
                    next();
                }
            });
        } else {
            res.redirect("/adminlogin");
        }
    } catch (error) {
        res.status(401).json({
            succeeded: false,
            error: "Not authorized"
        });
    }
};

export { authenticateToken, checkAdmin };
