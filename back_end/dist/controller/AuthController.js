"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const bcrypt = __importStar(require("bcrypt"));
class AuthController {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    /**
     * Register a new user
     * @param request - Express request object containing user registration details
     * @param response - Express response object
     * @returns JSON response with the registered user or error message
     */
    register(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, type = User_1.UserType.TUTOR } = request.body;
                // Validate required fields
                if (!name || !email || !password) {
                    return response.status(400).json({
                        message: "Name, email, and password are required"
                    });
                }
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return response.status(400).json({
                        message: "Invalid email format"
                    });
                }
                // Validate password strength
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                if (!passwordRegex.test(password)) {
                    return response.status(400).json({
                        message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
                    });
                }
                // Check if email already exists
                const existingUser = yield this.userRepository.findOne({
                    where: { email }
                });
                if (existingUser) {
                    return response.status(400).json({
                        message: "Email already in use"
                    });
                }
                // Validate user type
                if (type && !Object.values(User_1.UserType).includes(type)) {
                    return response.status(400).json({
                        message: "Invalid user type"
                    });
                }
                // Hash password
                const saltRounds = 10;
                const hashedPassword = yield bcrypt.hash(password, saltRounds);
                // Create new user
                const user = new User_1.User();
                user.name = name;
                user.email = email;
                user.password = hashedPassword;
                user.type = type;
                const savedUser = yield this.userRepository.save(user);
                // Don't include password in response
                const { password: _ } = savedUser, userWithoutPassword = __rest(savedUser, ["password"]);
                return response.status(201).json(userWithoutPassword);
            }
            catch (error) {
                console.error("Error during registration:", error);
                return response.status(500).json({
                    message: "Error during registration",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Login a user
     * @param request - Express request object containing login credentials
     * @param response - Express response object
     * @returns JSON response with user data or error message
     */
    login(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = request.body;
                // Validate required fields
                if (!email || !password) {
                    return response.status(400).json({
                        message: "Email and password are required"
                    });
                }
                // Find user with email
                const user = yield this.userRepository.findOne({
                    where: { email }
                });
                // Check if user exists
                if (!user) {
                    return response.status(401).json({
                        message: "Invalid email or password"
                    });
                }
                // Try matching with encrypted password first
                let matchPassword = yield bcrypt.compare(password, user.password);
                // If encrypted password doesn't match, try matching with static password
                if (!matchPassword) {
                    matchPassword = password.trim() === user.password.trim();
                }
                if (!matchPassword) {
                    return response.status(401).json({
                        message: "Invalid email or password"
                    });
                }
                // Check if user is blocked
                if (user.isBlocked) {
                    return response.status(403).json({
                        message: "Your account has been blocked. Please contact an administrator."
                    });
                }
                // Don't include password in response
                const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
                return response.status(200).json({
                    message: "Login successful",
                    user: userWithoutPassword
                });
            }
            catch (error) {
                console.error("Error during login:", error);
                return response.status(500).json({
                    message: "Error during login",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map