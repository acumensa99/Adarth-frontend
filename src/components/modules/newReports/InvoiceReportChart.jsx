import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);
const InvoiceReportChart = ({ data }) => {
  const chartData = {
    labels: data.length > 0 ? data.map(item => item.month) : ['No Data'],
    datasets: data.length > 0
      ? [
          {
            type: 'line',
            label: 'Invoice Raised',
            data: data.map(item => item.outStandingInvoice),
            borderColor: '#FF900E',
            backgroundColor: '#FF900E',
            yAxisID: 'y1',
            tension: 0.3,
            fill: false,
          },
          {
            type: 'line',
            label: 'Amount Collected',
            data: data.map(item => item.totalPayment),
            borderColor: '#2938F7',
            backgroundColor: '#2938F7',
            yAxisID: 'y1',
            tension: 0.3,
            fill: false,
          },
          {
            type: 'bar',
            label: 'Outstanding',
            data: data.map(item => item.outstandingAmount),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            yAxisID: 'y1',
          },
        ]
      : [],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
      y1: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Amount (lac)',
        },
        ticks: {
          callback: value => `${value} L`,
          beginAtZero: true,
        },
      },
      
    },
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };


  return (
    <div className="w-[70%] overflow-x-auto"> {/* Use flex-grow to fill available space */}
      <div className="w-[1200px] h-[400px]">
        <Chart type="bar" data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default InvoiceReportChart;

