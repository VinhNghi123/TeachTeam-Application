## https://github.com/rmit-fsd-2025-s1/s3978216-s3959789-a2.git
### Reference
#### **Data Visualization**
- **Recharts** - Recharts Team
  - *Source*: https://github.com/recharts/recharts
  - *Documentation*: https://recharts.org/
  - *NPM Package*: https://www.npmjs.com/package/recharts
  - *Version Used*: 2.15.3 (as of project development)
  - *Usage*: React charting library for creating interactive data visualizations in the lecturer dashboard
  - *Components Used*: BarChart, PieChart, LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend
  - *License*: MIT License

#### **Claude AI Assistance**
- **AI Assistant**: Claude (Anthropic)
  - *Accessed*: Multiple sessions during project development (May-June 2025)
  - *Usage Areas*:
    - Recharts library integration and component implementation
    - Code debugging and optimization suggestions
    - TypeScript type definitions and error resolution
    - Database schema design consultation
    - GraphQL subscription implementation guidance
    - Real-time notification system architecture
    - README documentation structure and formatting
  - *Specific Assistance*: 
    - Help with importing and implementing Recharts components in the VisualData.tsx component for creating interactive charts and data visualizations in the VisualData.tsx in user_frontend folder
    - Help with set up subscription of GraphQL in admin front end and applicant list realtime notification in applicantlist.tsx
  - *Note*: All AI-generated code was reviewed, tested, and adapted to project requirements

#### **Images & Visual Content**
- **Unsplash** - Unsplash Inc.
  - *Source*: https://unsplash.com/
  - *Usage*: Royalty-free images for application UI
  - *Specific Images*: Campus and education-related imagery
  - *License*: Unsplash License (free for commercial and non-commercial use)

#### **UI & User Experience**
- **Lucide React** - Lucide Community
  - *Documentation*: https://lucide.dev/
  - *Usage*: Icon library for React applications
  - *License*: ISC License
  
- **SVG (Scalable Vector Graphics)** - World Wide Web Consortium (W3C)
  - *Specification*: http://www.w3.org/2000/svg
  - *Documentation*: https://www.w3.org/Graphics/SVG/
  - *Usage*: SVG namespace and vector graphics implementation for scalable icons and graphics
  - *Implementation Areas*:
    - Icon components using SVG elements and paths
    - Scalable graphics in UI components (navigation icons, status indicators)
    - Custom SVG icons in React components (Lucide React library uses SVG)
    - Vector-based visual elements for responsive design
  - *Technical Implementation*: xmlns="http://www.w3.org/2000/svg" namespace declarations

## How to run the project
```cd user_frontend```
``` npm run dev```
and access to localhost:3000
```cd back_end```
```npm run dev```
```cd admin front_end ```
```npm run dev```
and access to localhost:3001