import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies["token"];
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }

    // Fetch user from database 
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("User not found");
       res.status(404).json({ message: "User not found" }); // missing user
    }
    // Attach user to request object
    req.user = user;
    next(); // call the next middleware

    console.log("-----------------");

  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
