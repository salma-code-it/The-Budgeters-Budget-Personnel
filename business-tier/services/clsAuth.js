const clsUserDataAccess = require('../../data-tier/models/clsUserDataAccess');

class clsAuth {
    static async register(username, email, password) {
        try {
            // Check if user already exists
            const existingUser = await clsUserDataAccess.findByEmail(email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Create new user
            const userId = await clsUserDataAccess.create(username, email, password);
            return { userId, username, email };
        } catch (error) {
            throw new Error('Registration failed: ' + error.message);
        }
    }

    static async login(email, password) {
        try {
            // Find user by email and password
            const user = await clsUserDataAccess.findByEmailAndPassword(email, password);
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Return user data (excluding password)
            const { password: _, ...userData } = user;
            return userData;
        } catch (error) {
            throw new Error('Login failed: ' + error.message);
        }
    }

    static async simpleLogin(email, password) {
        try {
            // Find user by email and password directly
            const user = await clsUserDataAccess.findByEmailAndPassword(email, password);
            if (!user) {
                throw new Error('Invalid email or password');
            }
            // Return user data (excluding password)
            const { password: _, ...userData } = user;
            return userData;
        } catch (error) {
            throw new Error('Login failed: ' + error.message);
        }
    }

    static async getUserProfile(userId) {
        try {
            const user = await clsUserDataAccess.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Return user data (excluding password)
            const { password: _, ...userData } = user;
            return userData;
        } catch (error) {
            throw new Error('Failed to get user profile: ' + error.message);
        }
    }
}

module.exports = clsAuth; 