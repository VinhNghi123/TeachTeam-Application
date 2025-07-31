"use strict";
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
exports.UserController = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
class UserController {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    /**
     * Retrieves all users from the database with optional filtering
     * @param request - Express request with optional query parameters
     * @param response - Express response object
     * @returns JSON response containing filtered array of users
     */
    all(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { type, isBlocked } = request.query;
                let query = this.userRepository.createQueryBuilder("user");
                // Filter by user type if specified
                if (type && Object.values(User_1.UserType).includes(type)) {
                    query = query.andWhere("user.type = :type", { type });
                }
                // Filter by blocked status if specified
                if (isBlocked !== undefined) {
                    const blocked = isBlocked === 'true';
                    query = query.andWhere("user.isBlocked = :isBlocked", { isBlocked: blocked });
                }
                const users = yield query.getMany();
                // Remove passwords from response
                const usersWithoutPasswords = users.map(user => {
                    const { password } = user, userWithoutPassword = __rest(user, ["password"]);
                    return userWithoutPassword;
                });
                return response.json(usersWithoutPasswords);
            }
            catch (error) {
                console.error("Error retrieving users:", error);
                return response.status(500).json({
                    message: "Error retrieving users",
                    error: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        });
    }
    /**
     * Retrieves a single user by ID
     * @param request - Express request object containing the user ID
     * @param response - Express response object
     * @returns JSON response containing the user if found
     */
    one(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const user = yield this.userRepository.findOne({
                    where: { id },
                    relations: ["applications", "lecturerCourses", "lecturerCourses.course"]
                });
                if (!user) {
                    return response.status(404).json({ message: "User not found" });
                }
                // Remove password from response
                const { password } = user, userWithoutPassword = __rest(user, ["password"]);
                return response.json(userWithoutPassword);
            }
            catch (error) {
                console.error("Error retrieving user:", error);
                return response.status(500).json({
                    message: "Error retrieving user",
                    error: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        });
    }
    /**
     * Creates a new user in the database
     * @param request - Express request object containing user details
     * @param response - Express response object
     * @returns JSON response with the new user
     */
    save(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, type, profileBio, avatarUrl } = request.body;
                // Validate required fields
                if (!name || !email || !password) {
                    return response.status(400).json({
                        message: "Name, email, and password are required"
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
                // Create new user
                const user = new User_1.User();
                user.name = name;
                user.email = email;
                user.password = password;
                if (type && Object.values(User_1.UserType).includes(type)) {
                    user.type = type;
                }
                if (profileBio) {
                    user.profileBio = profileBio;
                }
                const savedUser = yield this.userRepository.save(user);
                // Remove password from response
                const { password: _ } = savedUser, userWithoutPassword = __rest(savedUser, ["password"]);
                return response.status(201).json(userWithoutPassword);
            }
            catch (error) {
                console.error("Error creating user:", error);
                return response.status(500).json({
                    message: "Error creating user",
                    error: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        });
    }
    /**
     * Updates an existing user
     * @param request - Express request with user ID and updated details
     * @param response - Express response object
     * @returns JSON response with the updated user
     */
    update(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const { name, email, profileBio, avatarUrl, isBlocked } = request.body;
                let userToUpdate = yield this.userRepository.findOne({
                    where: { id }
                });
                if (!userToUpdate) {
                    return response.status(404).json({ message: "User not found" });
                }
                // Update fields if provided
                if (name)
                    userToUpdate.name = name;
                if (email)
                    userToUpdate.email = email;
                if (profileBio !== undefined)
                    userToUpdate.profileBio = profileBio;
                if (isBlocked !== undefined)
                    userToUpdate.isBlocked = isBlocked;
                const updatedUser = yield this.userRepository.save(userToUpdate);
                // Remove password from response
                const { password } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
                return response.json(userWithoutPassword);
            }
            catch (error) {
                console.error("Error updating user:", error);
                return response.status(500).json({
                    message: "Error updating user",
                    error: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        });
    }
    /**
     * Removes a user from the database
     * @param request - Express request with user ID
     * @param response - Express response object
     * @returns JSON response with success message
     */
    remove(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const userToRemove = yield this.userRepository.findOne({
                    where: { id }
                });
                if (!userToRemove) {
                    return response.status(404).json({ message: "User not found" });
                }
                yield this.userRepository.remove(userToRemove);
                return response.json({ message: "User removed successfully" });
            }
            catch (error) {
                console.error("Error removing user:", error);
                return response.status(500).json({
                    message: "Error removing user",
                    error: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map