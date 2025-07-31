import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, UserType } from "../entity/User";
import * as bcrypt from "bcrypt";

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Register a new user
   * @param request - Express request object containing user registration details
   * @param response - Express response object
   * @returns JSON response with the registered user or error message
   */
  async register(request: Request, response: Response) {
    try {
      const { name, email, password, type = UserType.TUTOR } = request.body;

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
      const existingUser = await this.userRepository.findOne({ 
        where: { email } 
      });
      
      if (existingUser) {
        return response.status(400).json({ 
          message: "Email already in use" 
        });
      }

      // Validate user type
      if (type && !Object.values(UserType).includes(type as UserType)) {
        return response.status(400).json({ 
          message: "Invalid user type" 
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const user = new User();
      user.name = name;
      user.email = email;
      user.password = hashedPassword;
      user.type = type as UserType;

      const savedUser = await this.userRepository.save(user);

      // Don't include password in response
      const { password: _, ...userWithoutPassword } = savedUser;
      
      return response.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error during registration:", error);
      return response.status(500).json({ 
        message: "Error during registration", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Login a user
   * @param request - Express request object containing login credentials
   * @param response - Express response object
   * @returns JSON response with user data or error message
   */
  async login(request: Request, response: Response) {
    try {
      const { email, password } = request.body;

      // Validate required fields
      if (!email || !password) {
        return response.status(400).json({ 
          message: "Email and password are required" 
        });
      }

      // Find user with email
      const user = await this.userRepository.findOne({ 
        where: { email } 
      });

      // Check if user exists
      if (!user) {
        return response.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Try matching with encrypted password first
      let matchPassword = await bcrypt.compare(password, user.password);
      
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
      const { password: _, ...userWithoutPassword } = user;

      return response.status(200).json({
        message: "Login successful",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Error during login:", error);
      return response.status(500).json({ 
        message: "Error during login", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}