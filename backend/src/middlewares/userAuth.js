import jwt from 'jsonwebtoken';
import 'dotenv/config';
const jwtSecret = process.env.JWT_SECRET;
const userauthenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing or malformed' });
    };

    const token = authHeader.split(' ')[1];
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

export {
    userauthenticateJWT,
};