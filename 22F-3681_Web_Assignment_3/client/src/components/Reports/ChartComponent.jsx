// ChartComponent.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title,
  Tooltip, Legend, PointElement, LineElement, ArcElement
);

const ChartComponent = ({ title, apiEndpoint }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching data for ${title} from API: ${apiEndpoint}`);
        const token = localStorage.getItem("token");

        const response = await axios.get(apiEndpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(`API Response for ${title}:`, response.data);

        processChartData(response.data);
      } catch (err) {
        setError(`Failed to load data for ${title}`);
        console.error(`API Error for ${title}:`, err);
      } finally {
        setLoading(false);
      }
    };

    if (apiEndpoint) fetchData();
  }, [apiEndpoint, title]); // Added title to dependency array

  // Process API response into chart format
  const processChartData = (data) => {
    let labels = [];
    let values = [];
    let backgroundColor = ["rgba(54, 162, 235, 0.6)"]; // Default color
    let borderColor = "rgba(54, 162, 235, 1)";

    if (title === "Popular Subjects") {
      labels = data.map((item) => item._id); // Subject names
      values = data.map((item) => item.count); // Number of sessions
      backgroundColor = ["rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)", "rgba(255, 206, 86, 0.6)", "rgba(75, 192, 192, 0.6)", "rgba(153, 102, 255, 0.6)"]; // More colors
      borderColor = ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)"];
    } else if (title === "Session Completion Rates") {
      labels = ["Completion Rate"];
      values = [data.completionRate]; // Single percentage value
      backgroundColor = ["rgba(75, 192, 192, 0.6)"];
      borderColor = ["rgba(75, 192, 192, 1)"];
    } else if (title === "Platform Usage by City") {
      labels = data.map((item) => item._id); // City names
      values = data.map((item) => item.count); // Number of users
      // You might want to generate more colors dynamically based on the number of cities
    } else if (title === "User Growth Over Time") {
      labels = data.map((item) => item._id); // Monthly growth (YYYY-MM)
      values = data.map((item) => item.count); // New users per month
      borderColor = "rgba(255, 99, 132, 1)";
      backgroundColor = "rgba(255, 99, 132, 0.4)";
    }

    setChartData({
      labels,
      datasets: [
        {
          label: title,
          data: values,
          backgroundColor,
          borderColor,
          borderWidth: 1,
        },
      ],
    });
  };

  // Choose chart type based on report type
  const renderChart = () => {
    if (!chartData) return <p>No data available for {title}</p>;

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false, // Allows the chart to resize based on its container
      plugins: {
        title: {
          display: true,
          text: title,
        },
      },
    };

    switch (title) {
      case "Popular Subjects":
        return <Pie data={chartData} options={chartOptions} />;
      case "Session Completion Rates":
        return <Line data={chartData} options={chartOptions} />;
      case "Platform Usage by City":
        return <Bar data={chartData} options={chartOptions} />;
      case "User Growth Over Time":
        return <Line data={chartData} options={chartOptions} />;
      default:
        return <p>No valid chart type for {title}</p>;
    }
  };

  return (
    <div className="chart-container">
      {loading ? <p>Loading {title} data...</p> : error ? <p>{error}</p> : renderChart()}
    </div>
  );
};

export default ChartComponent;