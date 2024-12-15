import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '../emails/emailHandlers.js';


export const signup = async (req, res) => {
    try {
        const { firstName, lastName, username, role, email, password } = req.body;

        if (!firstName || !lastName || !username || !role || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'User ID already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ firstName, lastName, username, role, email, password: hashedPassword });

        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' }); 

        res.cookie('token', token, { 
            httpOnly: true, // This prevents client-side JavaScript from accessing the cookie
            maxAge: 3 * 24 * 60 * 60 * 1000, // Cookie expires in 3 days
            sameSite: 'Strict', // Cookie is sent only to the same site as the request
            secure: process.env.NODE_ENV === 'production' ? true : false // Cookie is sent only over HTTPS
        });

        res.status(201).json({ message: 'User created successfully' });
        
        // Construct the URL for the user's profile
        const profileUrl = process.env.CLIENT_URL + '/profile/' + user.username;

        // send welcome email
        try {
            await sendWelcomeEmail(user.email, user.firstName, profileUrl);
        } 
        catch (emailError) {
            console.error(`Error sending welcome email: ${emailError.message}`);
        }

    } catch (error) {
        console.error(`Error signing up user: ${error.message}`);
        res.status(500).json({ message: 'Internal Server error' });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log(username, password);

        // Check if the user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({message: "Invalid credentials"})
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({message: "Invalid credentials"})
        }

        // Create a token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });

        // Send the token in a HTTP-only cookie
        res.cookie('token', token, { 
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000,
            sameSite: 'Strict',
            secure: process.env.NODE_ENV === 'production' ? true : false
        });

        console.log('got a token');

        res.json({ message: 'Logged in successfully' }); 

    } catch (error) {
        console.error(`Error logging in user: ${error.message}`);
        res.status(500).json({ message: 'Internal Server error' });
    }
}

export const logout = async (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
}

export const getMe = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.error(`Error getting user profile: ${error.message}`);
        res.status(500).json({ message: 'Internal Server error' });
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
        } else {
            // Send password reset email
            res.json({ message: 'Password reset email sent' });
        }
    } catch (error) {
        console.error(`Error resetting password: ${error.message}`);
        res.status(500).json({ message: 'Internal Server error' });
    }
}
