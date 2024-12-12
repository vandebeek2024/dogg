import User from '../models/userModel.js';
import jwt from "jsonwebtoken";

const checkUser = async (req, res, next) => {
    const token = req.cookies.user_jwt;  

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                console.log('User token verification error:', err.message);
                res.locals.user = null;
                next();
            } else {
                const user = await User.findById(decodedToken.userId);
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
        const token = req.cookies.user_jwt;  
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, (err) => {
                if (err) {
                    console.log('User authentication error:', err.message);
                    res.redirect("/join");
                } else {
                    next();
                }
            });
        } else {
            res.redirect("/join");
        }
    } catch (error) {
        res.status(401).json({
            succeeded: false,
            error: "Not authorized"
        });
    }
};

export { authenticateToken, checkUser };
