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

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const SJFChart = ({HandleOnChange,calculateAverages}) => {
  const [processes1, setprocesses] = useState([]);
  useEffect(() => {
    const data = localStorage.getItem("data")? JSON.parse(localStorage.getItem("data")): []
    setprocesses(data)
  }, [HandleOnChange]);
  const [chartData, setChartData] = useState({
    series: [],
    options: {},
  });

  const [processStats, setProcessStats] = useState([]); // ذخیره اطلاعات WT و TAT
  useEffect(() => {
    const originalProcesses = processes1
  
    const processes = [...originalProcesses]; // ایجاد نسخه کپی از لیست فرآیندها
    const timeline = [];
    let currentTime = 0;
  
    const completionTimes = {};
    const readyQueue = [];
  
    // مرتب‌سازی فرآیندها بر اساس زمان ورود
    processes.sort((a, b) => a.arrival - b.arrival);
  
    while (processes.length > 0 || readyQueue.length > 0) {
      // اضافه کردن فرآیندها به صف آماده
      while (processes.length > 0 && processes[0].arrival <= currentTime) {
        readyQueue.push(processes.shift());
      }
  
      // مرتب‌سازی صف آماده بر اساس Burst Time
      readyQueue.sort((a, b) => a.burst - b.burst);
  
      if (readyQueue.length > 0) {
        const process = readyQueue.shift();
  
        timeline.push({
          time: currentTime,
          process: process.id,
        });
  
        currentTime += process.burst;
        completionTimes[process.id] = currentTime;
      } else {
        currentTime++;
      }
    }
  
    // محاسبه WT و TAT با استفاده از originalProcesses
 
    const stats = originalProcesses.map((process) => {
      const completionTime = completionTimes[process.id];
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
    if(stats.length!=0){
      calculateAverages('SRT',stats)
    }
    // آماده‌سازی داده‌ها برای ApexCharts
    const series = stats.map((process) => {
      const result = [];
      for (let i = 0; i < timeline.length; i++) {
        const t = timeline[i];
        if (t.process === process.id) {
          const xLen = timeline[i + 1]?.time;
          if (xLen !== undefined) {
            for (let j = t.time; j < xLen; j++) {
              result.push({
                x: j,
                y: process.arrival,
              });
            }
          } else {
            for (let j = t.time; j < t.time + process.burst; j++) {
              result.push({
                x: j,
                y: process.arrival,
              });
            }
          }
        }
      }
      return {
        name: process.id,
        data: result,
      };
    });
  
    const processColors = [];
    processes1.map(item =>{
      processColors.push(item.color)
    })
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
  }, [processes1]);
  

  return (
    <div
      style={{ padding: 20, display: "flex", justifyContent: "space-between" }}>
      <Card style={{ width: "79%", paddingRight: 15, marginBottom: 30 }}>
        <CardHeader>
          <CardTitle>نمودار الگوریتم SJF (محور Y: زمان ورود)</CardTitle>
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
        <Charts processes={processes1} data={processStats} name={"wt"} title={"Waiting Time (WT)"} />
                <Charts
                processes={processes1} 
                  data={processStats}
                  name={"tat"}
                  title={"Turnaround Time (TAT)"}
                />
                  <Charts
                  processes={processes1} 
                    data={processStats}
                    name={"completion"}
                    title={"Completion Time"}
                  />
      </div>
    </div>
  );
};

export default SJFChart;
