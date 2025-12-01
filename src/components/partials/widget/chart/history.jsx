import React, { useMemo, useRef, useEffect } from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/hooks/useDarkMode";
import useRtl from "@/hooks/useRtl";
import themeConfig from "@/configs/themeConfig";
import { useGetInvestmentOrdersByMonthQuery } from "@/store/api/order/orderApi";
import LoadingIcon from "@/components/LoadingIcon";

const RevenueBarChart = ({ height = 400 }) => {
  const [isDark] = useDarkMode();
  const [isRtl] = useRtl();
  
  // Fetch investment orders data
  const { data: chartDataResponse, isLoading } = useGetInvestmentOrdersByMonthQuery({ months: 12 });
  
  const chartData = chartDataResponse?.data || {
    categories: [],
    series: [
      { name: 'Gold', data: [], orderCounts: [] },
      { name: 'Silver', data: [], orderCounts: [] }
    ]
  };
  
  // Store order counts for tooltip access using useMemo
  const orderCountsMap = useMemo(() => {
    const map = {};
    chartData.series.forEach((metal, seriesIndex) => {
      metal.orderCounts.forEach((count, index) => {
        const key = `${seriesIndex}_${index}`;
        map[key] = count;
      });
    });
    return map;
  }, [chartData.series]);
  
  // Format series data for ApexCharts
  const series = chartData.series.map(metal => ({
    name: metal.name,
    data: metal.data
  }));
  
  // Store chartData and orderCountsMap in refs for tooltip access
  const chartDataRef = useRef(chartData);
  const orderCountsMapRef = useRef(orderCountsMap);
  
  useEffect(() => {
    chartDataRef.current = chartData;
    orderCountsMapRef.current = orderCountsMap;
  }, [chartData, orderCountsMap]);
  
  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        endingShape: "rounded",
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    legend: {
      show: true,
      markers: {
        width: 10,
        height: 10,
        radius: 12,
      },
      labels: {
        colors: "#f9fafb",
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    yaxis: {
      opposite: isRtl ? true : false,
      labels: {
        style: {
          colors: "#f9fafb",
          fontFamily: "Inter",
        },
        formatter: function (val) {
          return "₹" + (val / 1000).toFixed(1) + "k";
        },
      },
      title: {
        text: "Value (₹)",
        style: {
          color: "#f9fafb",
        },
      },
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: "#f9fafb",
          fontFamily: "Inter",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      custom: function({ seriesIndex, dataPointIndex, w }) {
        // Access chartData from ref
        const currentChartData = chartDataRef.current;
        const currentOrderCountsMap = orderCountsMapRef.current;
        
        const metalName = w.globals.seriesNames[seriesIndex] || 
                         (currentChartData?.series[seriesIndex]?.name) || 
                         'Unknown';
        const value = w.globals.series[seriesIndex][dataPointIndex] || 0;
        
        // Get month from xaxis categories - w.globals.categoryLabels should have it
        let month = 'Unknown Month';
        if (w.globals.categoryLabels && w.globals.categoryLabels[dataPointIndex]) {
          month = w.globals.categoryLabels[dataPointIndex];
        } else if (currentChartData?.categories && currentChartData.categories[dataPointIndex]) {
          month = currentChartData.categories[dataPointIndex];
        } else if (w.config.xaxis && w.config.xaxis.categories && w.config.xaxis.categories[dataPointIndex]) {
          month = w.config.xaxis.categories[dataPointIndex];
        }
        
        const orderCount = currentOrderCountsMap[`${seriesIndex}_${dataPointIndex}`] || 0;
        
        return `
          <div style="padding: 10px; background: rgba(0, 0, 0, 0.9); border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <div style="font-weight: bold; margin-bottom: 8px; color: #fff; font-size: 14px;">
              ${metalName} - ${month}
            </div>
            <div style="color: #f9fafb; margin-bottom: 5px; font-size: 13px;">
              <span style="opacity: 0.8;">Orders:</span> <strong style="color: #60a5fa;">${orderCount}</strong>
            </div>
            <div style="color: #f9fafb; font-size: 13px;">
              <span style="opacity: 0.8;">Value:</span> <strong style="color: #60a5fa;">₹${value.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        `;
      },
    },
    colors: ["#FFD700", "#C0C0C0"], // Gold and Silver colors
    grid: {
      show: true,
      borderColor: "#60a5fa",
      strokeDashArray: 10,
      position: "back",
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          legend: {
            position: "bottom",
            offsetY: 8,
            horizontalAlign: "center",
          },
          plotOptions: {
            bar: {
              columnWidth: "80%",
            },
          },
        },
      },
    ],
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center" style={{ height: height }}>
        <LoadingIcon />
      </div>
    );
  }
  
  return (
    <div>
      <Chart 
        options={options} 
        series={series} 
        type="bar" 
        height={height}
      />
    </div>
  );
};

export default RevenueBarChart;
