# Project Dashboard Instructions

## Overview
The objective is to create a clean and informative dashboard that displays tasks retrieved from ClickUp in a user-friendly layout. This dashboard will feature various metrics and categories relevant to task management, including charts and graphs for data visualization.

## Requirements

### Data Integration
- Retrieve task data from ClickUp API.
- Use the endpoint that fetches details like task statuses, priority, and labels.

### Dashboard Layout
1. **Header Section**:
   - Display the total number of tasks.
   - Include a summary of key metrics:
     - Total tasks
     - Tasks in different statuses (e.g., 미확인, 확인 중, 판단 중, 결함, 무결함, 반려, 완료)

2. **Metrics Section**:
   - Create a visually appealing metrics display:
     - Show a total counts table with correct labels and numerical values.
     - Use cards or boxes for different categories.

3. **Task List Display**:
   - Implement a dynamic task list that shows:
     - Task ID
     - Task Name
     - Status
     - Assigned Team Members
   - Use a responsive table to ensure readability across devices.

4. **Graphs and Charts**:
   - Integrate charting libraries (e.g., Chart.js, Recharts) to visualize data.
   - Create the following visual elements:
     - **Monthly Sales Chart**: A bar chart to display the number of tasks completed each month.
     - **Statistics Line Chart**: A line chart to show trends over time for various metrics, such as task completion rates.

### Styling Guidelines
- **Layout**:
  - Use Tailwind CSS for responsive and modern UI elements.
  - Ensure that elements are evenly spaced and organized.

- **Color Scheme**:
  - Utilize designated colors similar to those in the ClickUp interface for various statuses.
  - Ensure contrast for readability and accessibility.

- **Typography**:
  - Use clear, legible fonts and sizes for titles, headings, and task details.

### Example Layout (Code Snippet)
```tsx  
import React from 'react';  
import { Bar } from 'react-chartjs-2';  
import { Line } from 'react-chartjs-2';  

const Dashboard = ({ tasks }) => {  
  const monthlyData = {  
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],  
    datasets: [  
      {  
        label: 'Monthly Sales',  
        data: [300, 200, 400, 150, 300, 200, 0, 100, 400, 500, 200, 300], // Example data  
        backgroundColor: 'rgba(75, 192, 192, 0.6)',  
      },  
    ],  
  };  

  const statisticsData = {  
    labels: [...Array(12).keys()], // Dummy data for months  
    datasets: [  
      {  
        label: 'Statistics',  
        data: [100, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220], // Example data  
        borderColor: 'rgba(75, 192, 192, 1)',  
        fill: false,  
      },  
    ],  
  };  

  return (  
    <div className="p-6 space-y-6">  
      <h1 className="text-2xl font-bold">Task Dashboard</h1>  

      {/* Metrics Section */}  
      <div className="grid grid-cols-2 gap-4">  
        <div className="bg-gray-200 p-4 rounded">  
          <h2>Total Tasks</h2>  
          <p>{tasks.length}</p>  
        </div>  
        {/* More metric boxes as needed */}  
      </div>  

      {/* Monthly Sales Chart */}  
      <div className="py-4">  
        <h2 className="text-lg font-semibold">Monthly Sales</h2>  
        <Bar data={monthlyData} options={{ maintainAspectRatio: false }} />  
      </div>  

      {/* Statistics Line Chart */}  
      <div className="py-4">  
        <h2 className="text-lg font-semibold">Statistics</h2>  
        <Line data={statisticsData} options={{ maintainAspectRatio: false }} />  
      </div>  

      {/* Task List Display */}  
      <table className="min-w-full border">  
        <thead>  
          <tr className="bg-gray-300">  
            <th className="border px-4 py-2">Task ID</th>  
            <th className="border px-4 py-2">Task Name</th>  
            <th className="border px-4 py-2">Status</th>  
            <th className="border px-4 py-2">Assigned To</th>  
          </tr>  
        </thead>  
        <tbody>  
          {tasks.map(task => (  
            <tr key={task.id}>  
              <td className="border px-4 py-2">{task.id}</td>  
              <td className="border px-4 py-2">{task.name}</td>  
              <td className="border px-4 py-2">{task.status}</td>  
              <td className="border px-4 py-2">{task.assignedTo}</td>  
            </tr>  
          ))}  
        </tbody>  
      </table>  
    </div>  
  );  
};  

export default Dashboard;  