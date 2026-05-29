import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        // ✅ No token = treat as guest user (NOT error)
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            req.user = decoded;

        } catch (err) {
            // ✅ Invalid token = still allow guest access
            req.user = null;
        }

        next();

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Server error"
        });
    }
};