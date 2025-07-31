import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, UserType } from "../entity/User";

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Retrieves all users from the database with optional filtering
   * @param request - Express request with optional query parameters
   * @param response - Express response object
   * @returns JSON response containing filtered array of users
   */
  async all(request: Request, response: Response) {
    try {
      const { type, isBlocked } = request.query;
      
      let query = this.userRepository.createQueryBuilder("user");
      
      // Filter by user type if specified
      if (type && Object.values(UserType).includes(type as UserType)) {
        query = query.andWhere("user.type = :type", { type });
      }
      
      // Filter by blocked status if specified
      if (isBlocked !== undefined) {
        const blocked = isBlocked === 'true';
        query = query.andWhere("user.isBlocked = :isBlocked", { isBlocked: blocked });
      }
      
      const users = await query.getMany();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return response.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error retrieving users:", error);
      return response.status(500).json({ 
        message: "Error retrieving users", 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Retrieves a single user by ID
   * @param request - Express request object containing the user ID
   * @param response - Express response object
   * @returns JSON response containing the user if found
   */
  async one(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ["applications", "lecturerCourses", "lecturerCourses.course"]
      });

      if (!user) {
        return response.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return response.json(userWithoutPassword);
    } catch (error) {
      console.error("Error retrieving user:", error);
      return response.status(500).json({ 
        message: "Error retrieving user", 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Creates a new user in the database
   * @param request - Express request object containing user details
   * @param response - Express response object
   * @returns JSON response with the new user
   */
  async save(request: Request, response: Response) {
    try {
      const { name, email, password, type, profileBio, avatarUrl } = request.body;

      // Validate required fields
      if (!name || !email || !password) {
        return response.status(400).json({ 
          message: "Name, email, and password are required" 
        });
      }

      // Check if email already exists
      const existingUser = await this.userRepository.findOne({ 
        where: { email } 
      });
      
      if (existingUser) {
        return response.status(400).json({ 
          message: "Email already in use" 
        });
      }

      // Create new user
      const user = new User();
      user.name = name;
      user.email = email;
      user.password = password;
      
      if (type && Object.values(UserType).includes(type as UserType)) {
        user.type = type as UserType;
      }
      
      if (profileBio) {
        user.profileBio = profileBio;
      }
      
      const savedUser = await this.userRepository.save(user);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = savedUser;
      
      return response.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      return response.status(500).json({ 
        message: "Error creating user", 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Updates an existing user
   * @param request - Express request with user ID and updated details
   * @param response - Express response object
   * @returns JSON response with the updated user
   */
  async update(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const { name, email, profileBio, avatarUrl, isBlocked } = request.body;

      let userToUpdate = await this.userRepository.findOne({
        where: { id }
      });

      if (!userToUpdate) {
        return response.status(404).json({ message: "User not found" });
      }

      // Update fields if provided
      if (name) userToUpdate.name = name;
      if (email) userToUpdate.email = email;
      if (profileBio !== undefined) userToUpdate.profileBio = profileBio;
      if (isBlocked !== undefined) userToUpdate.isBlocked = isBlocked;

      const updatedUser = await this.userRepository.save(userToUpdate);

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      return response.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      return response.status(500).json({ 
        message: "Error updating user", 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Removes a user from the database
   * @param request - Express request with user ID
   * @param response - Express response object
   * @returns JSON response with success message
   */
  async remove(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      
      const userToRemove = await this.userRepository.findOne({
        where: { id }
      });

      if (!userToRemove) {
        return response.status(404).json({ message: "User not found" });
      }

      await this.userRepository.remove(userToRemove);
      
      return response.json({ message: "User removed successfully" });
    } catch (error) {
      console.error("Error removing user:", error);
      return response.status(500).json({ 
        message: "Error removing user", 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
}