import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // allow guest users
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            req.user = null;
            req.userId = null;
            return next();
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded;

            // ✅ FIX: normalize userId properly
            req.userId = decoded.id || decoded._id || null;

        } catch (err) {
            req.user = null;
            req.userId = null;
        }

        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};