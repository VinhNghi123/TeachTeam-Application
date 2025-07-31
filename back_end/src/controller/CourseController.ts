import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../entity/Course";
import { validateCourseCode } from "../utils/validation";

export class CourseController {
  private courseRepository = AppDataSource.getRepository(Course);

  /**
   * Retrieves all courses with optional filtering
   * @param request - Express request with query parameters
   * @param response - Express response object
   * @returns JSON response with filtered courses
   */
  async all(request: Request, response: Response) {
    try {
      const { semester, year, isActive } = request.query;
      
      let query = this.courseRepository.createQueryBuilder("course");
      
      // Apply filters if provided
      if (semester) {
        query = query.andWhere("course.semester = :semester", { semester });
      }
      
      if (year) {
        query = query.andWhere("course.year = :year", { year: parseInt(year as string) });
      }
      
      if (isActive !== undefined) {
        const active = isActive === 'true';
        query = query.andWhere("course.isActive = :isActive", { isActive: active });
      }
      
      // Order by course code
      query = query.orderBy("course.courseCode", "ASC");
      
      const courses = await query.getMany();
      
      return response.json(courses);
    } catch (error: unknown) {
      console.error("Error retrieving courses:", error);
      return response.status(500).json({ 
        message: "Error retrieving courses", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Retrieves a single course by ID
   * @param request - Express request with course ID
   * @param response - Express response object
   * @returns JSON response with the course if found
   */
  async one(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      
      const course = await this.courseRepository.findOne({
        where: { id },
        relations: ["applications", "lecturerCourses", "lecturerCourses.lecturer"]
      });

      if (!course) {
        return response.status(404).json({ message: "Course not found" });
      }
      
      return response.json(course);
    } catch (error: unknown) {
      console.error("Error retrieving course:", error);
      return response.status(500).json({ 
        message: "Error retrieving course", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Creates a new course
   * @param request - Express request with course details
   * @param response - Express response object
   * @returns JSON response with the created course
   */
  async save(request: Request, response: Response) {
    try {
      const { courseCode, name, description, semester, year, isActive = true } = request.body;

      // Validate required fields
      if (!courseCode || !name || !semester || !year) {
        return response.status(400).json({ 
          message: "Course code, name, semester, and year are required" 
        });
      }

      // Validate course code format (COSC followed by 4 digits)
      if (!validateCourseCode(courseCode)) {
        return response.status(400).json({ 
          message: "Invalid course code format. Must be in format COSCxxxx where xxxx is a 4-digit number" 
        });
      }

      // Check if course code already exists
      const existingCourse = await this.courseRepository.findOne({ 
        where: { courseCode } 
      });
      
      if (existingCourse) {
        return response.status(400).json({ 
          message: "Course code already exists" 
        });
      }

      // Create new course
      const course = new Course();
      course.courseCode = courseCode;
      course.name = name;
      course.description = description;
      course.semester = semester;
      course.year = parseInt(year);
      course.isActive = isActive;

      const savedCourse = await this.courseRepository.save(course);
      
      return response.status(201).json(savedCourse);
    } catch (error: unknown) {
      console.error("Error creating course:", error);
      return response.status(500).json({ 
        message: "Error creating course", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Updates an existing course
   * @param request - Express request with course ID and updated details
   * @param response - Express response object
   * @returns JSON response with the updated course
   */
  async update(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const { courseCode, name, description, semester, year, isActive } = request.body;

      let courseToUpdate = await this.courseRepository.findOne({
        where: { id }
      });

      if (!courseToUpdate) {
        return response.status(404).json({ message: "Course not found" });
      }

      // If course code is being updated, validate and check for duplicates
      if (courseCode && courseCode !== courseToUpdate.courseCode) {
        // Validate course code format
        if (!validateCourseCode(courseCode)) {
          return response.status(400).json({ 
            message: "Invalid course code format. Must be in format COSCxxxx where xxxx is a 4-digit number" 
          });
        }

        // Check if the new course code already exists
        const existingCourse = await this.courseRepository.findOne({ 
          where: { courseCode } 
        });
        
        if (existingCourse) {
          return response.status(400).json({ 
            message: "Course code already exists" 
          });
        }

        courseToUpdate.courseCode = courseCode;
      }

      // Update other fields if provided
      if (name) courseToUpdate.name = name;
      if (description !== undefined) courseToUpdate.description = description;
      if (semester) courseToUpdate.semester = semester;
      if (year) courseToUpdate.year = parseInt(year);
      if (isActive !== undefined) courseToUpdate.isActive = isActive;

      const updatedCourse = await this.courseRepository.save(courseToUpdate);
      
      return response.json(updatedCourse);
    } catch (error: unknown) {
      console.error("Error updating course:", error);
      return response.status(500).json({ 
        message: "Error updating course", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Removes a course from the database
   * @param request - Express request with course ID
   * @param response - Express response object
   * @returns JSON response with success message
   */
  async remove(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      
      const courseToRemove = await this.courseRepository.findOne({
        where: { id }
      });

      if (!courseToRemove) {
        return response.status(404).json({ message: "Course not found" });
      }

      await this.courseRepository.remove(courseToRemove);
      
      return response.json({ message: "Course removed successfully" });
    } catch (error: unknown) {
      console.error("Error removing course:", error);
      return response.status(500).json({ 
        message: "Error removing course", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}