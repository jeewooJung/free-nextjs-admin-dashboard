---
applyTo: '**'
---
# Project Instructions for Web App Development

## Project Overview
The goal is to create a web application that retrieves specific lists from a ClickUp space and displays the data in a structured format. The application will be built using Next.js, TypeScript, and styled with Tailwind CSS.

## Requirements

### Technologies
- **Next.js**: For server-side rendering and routing
- **TypeScript**: For type safety and improved developer experience
- **Tailwind CSS**: For responsive and utility-first styling
- **ClickUp API**: For fetching data related to tasks and lists

### Functionality
1. **API Integration**:
   - Utilize the ClickUp API to pull data from a specified space and list.
   - Ensure that API keys are stored securely (environment variables).

2. **Data Display**:
   - Create two page layouts:
     - **Page 1**: Display a list of tasks or specific items retrieved from ClickUp.
     - **Page 2**: Present data structured similarly to the second image provided (use tables, cards, or relevant UI components).

### Code Style Guidelines
- **React Components**:
  - Use functional components and hooks (e.g., `useState`, `useEffect`).
  - Keep components modular and reusable.
  
- **TypeScript**:
  - Define props and state using interfaces.
  - Use TypeScript's type annotations for functions and component events.

- **Tailwind CSS**:
  - Apply utility classes for styling. Avoid writing custom CSS unless necessary.
  - Maintain responsive design principles.

### Structure
- **src**: Main directory for source files
  - **components**: Reusable components
  - **pages**: Next.js pages (e.g., `index.tsx`, `[spaceId].tsx` for dynamic routes)
  - **styles**: (If needed) Custom styles or utility files
  - **api**: API integration logic

### Example Component Structure
```tsx  
import React from 'react';  

interface Task {  
  id: string;  
  name: string;  
  status: string;  
}  

interface TaskListProps {  
  tasks: Task[];  
}  

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {  
  return (  
    <div className="p-4">  
      <h2 className="text-lg font-semibold">Tasks</h2>  
      <ul className="list-disc pl-5">  
        {tasks.map((task) => (  
          <li key={task.id} className="mb-2">  
            {task.name} - <span className={`status-${task.status}`}>{task.status}</span>  
          </li>  
        ))}  
      </ul>  
    </div>  
  );  
};  

export default TaskList;  