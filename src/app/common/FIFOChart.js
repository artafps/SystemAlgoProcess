"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { Charts } from "../charts";

// لود دینامیک برای ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const FIFOChart = () => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {},
  });

  const [processStats, setProcessStats] = useState([]); // ذخیره اطلاعات WT و TAT
  useEffect(() => {
    const processes = [
      { id: "P1", arrival: 0, burst: 8 },
      { id: "P2", arrival: 1, burst: 4 },
      { id: "P3", arrival: 2, burst: 9 },
      { id: "P4", arrival: 3, burst: 5 },
      { id: "P5", arrival: 6, burst: 5 },
    ];

    // مرتب‌سازی فرآیندها بر اساس زمان ورود
    processes.sort((a, b) => a.arrival - b.arrival);

    let currentTime = 0;
    const completionTimes = [];
    const timeline = [];

    processes.forEach((process) => {
      // فرآیند را به خط زمان اضافه کنید
      timeline.push({
        time: currentTime,
        process: process.id,
      });

      // محاسبه زمان تکمیل فرآیند
      currentTime = Math.max(currentTime, process.arrival) + process.burst;
      completionTimes.push({
        id: process.id,
        completion: currentTime,
      });
    });

    // محاسبه WT و TAT
    const stats = processes.map((process) => {
      const completionTime = completionTimes.find(
        (c) => c.id === process.id
      ).completion;
      const tat = completionTime - process.arrival; // Turnaround Time
      const wt = tat - process.burst; // Waiting Time

      return {
        id: process.id,
        arrival: process.arrival,
        burst: process.burst,
        completion: completionTime,
        tat: tat,
        wt: wt,
      };
    });

    setProcessStats(stats);

    // آماده‌سازی داده‌ها برای ApexCharts
    const series = stats.map((process) => {
      const result = [];
      for (let i = 0; i < timeline.length; i++) {
        const t = timeline[i];
        if (t.process === process.id) {
          const xLen = timeline[i + 1]?.time || process.completion;
          for (let j = t.time; j < xLen; j++) {
            result.push({
              x: j,
              y: process.arrival,
            });
          }
        }
      }
      return {
        name: process.id,
        data: result,
      };
    });

    const processColors = [
      "#FF4560",
      "#008FFB",
      "#00E396",
      "#FEB019",
      "#FEBFFF",
    ];

    setChartData({
      series: series,
      options: {
        chart: {
          type: "scatter",
          zoom: {
            enabled: false,
          },
          toolbar: {
            show: false,
          },
        },
        markers: {
          size: 10,
          shape: "square",
        },
        colors: processColors.slice(0, series.length),
        xaxis: {
          title: {
            text: "زمان اجرا (Execution Time)",
            style: {
              color: "#000",
              fontSize: "16px",
              fontWeight: "bold",
            },
          },
          labels: {
            style: {
              colors: "#000",
              fontSize: "14px",
            },
          },
        },
        yaxis: {
          title: {
            text: "زمان ورود (Arrival Time)",
            style: {
              color: "#000",
              fontSize: "16px",
              fontWeight: "bold",
            },
          },
          labels: {
            formatter: (val) => `T${val}`,
            style: {
              colors: "#000",
              fontSize: "14px",
            },
          },
        },
        legend: {
          position: "top",
          show: true,
          onItemClick: {
            toggleDataSeries: false,
          },
          onItemHover: {
            highlightDataSeries: true,
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
        },
      },
    });
  }, []);

  return (
    <div
      style={{ padding: 20, display: "flex", justifyContent: "space-between" }}>
      <Card style={{ width: "79%", paddingRight: 15, marginBottom: 30 }}>
        <CardHeader>
          <CardTitle>نمودار الگوریتم FIFO (محور Y: زمان ورود)</CardTitle>
          <CardDescription>نمایش فرآیندهای زمان‌بندی‌شده</CardDescription>
        </CardHeader>
        <Chart
          options={chartData.options}
          series={chartData.series}
          height={600}
          style={{ color: "black" }}
          type="scatter"
        />
      </Card>
      <div
        style={{
          width: "20%",
          height: 600,
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
        }}>
        <Charts data={processStats} name={"wt"} title={"Waiting Time (WT)"} />
        <Charts
          data={processStats}
          name={"tat"}
          title={"Turnaround Time (TAT)"}
        />
        <Charts
          data={processStats}
          name={"completion"}
          title={"Completion Time"}
        />
      </div>
    </div>
  );
};

export default FIFOChart;