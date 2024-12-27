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

const FCFSChart = ({HandleOnChange}) => {
  const [processes, setprocesses] = useState([]);
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
    

    const timeline = [];
    let currentTime = 0;

    const completionTimes = {};

    // شبیه‌سازی الگوریتم FCFS
    processes.sort((a, b) => a.arrival - b.arrival); // Sort by arrival time

    processes.forEach((process) => {
      if (currentTime < process.arrival) {
        currentTime = process.arrival;
      }
      timeline.push({
        time: currentTime,
        process: process.id,
      });
      currentTime += process.burst;
      completionTimes[process.id] = currentTime;
    });
    // محاسبه WT و TAT
    const stats = processes.map((p) => {
      const completionTime = completionTimes[p.id];
      const tat = completionTime - p.arrival; // Turnaround Time
      const wt = tat - p.burst; // Waiting Time

      return {
        id: p.id,
        arrival: p.arrival,
        burst: p.burst,
        completion: completionTime,
        tat: tat,
        wt: wt,
      };
    });

    setProcessStats(stats); // ذخیره مقادیر در استیت
    // آماده‌سازی داده‌ها برای ApexCharts
    const series = processes.map((process) => {
      const result = [];
      for (let i = 0; i < timeline.length; i++) {
        const t = timeline[i];
        if (t.process === process.id) {
          const xLen = timeline[i + 1]?.time // چک کردن وجود عنصر بعدی
          if (xLen !== undefined) {
            for (let j = t.time; j < xLen; j++) {
              result.push({
                x: j,
                y: process.arrival,
              });
            }
          }else{
            for (let j = t.time; j < (t.time +processes[i].burst); j++) {
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
    // const series = processes.map((process) => {
    //   const processTimeline = [];
    //   let lastTime = -1; // برای ردیابی زمان قبلی

    //   timeline.forEach((t) => {
    //     if (t.process === process.id) {
    //       // اگر فاصله‌ای بین نقاط باشد، آن را پر کن
    //       if (lastTime !== -1 && t.time > lastTime + 1) {
    //         for (let i = lastTime + 1; i < t.time; i++) {
    //           processTimeline.push({ x: i, y: process.arrival });
    //         }
    //       }
    //       processTimeline.push({ x: t.time, y: process.arrival });
    //       lastTime = t.time;
    //     }
    //   });

    //   return {
    //     name: process.id,
    //     data: processTimeline,
    //   };
    // });
    const processColors = [];
    processes.map(item =>{
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
              color: "#000", // رنگ سفید
              fontSize: "16px", // اندازه فونت
              fontWeight: "bold", // اختیاری: بولد کردن متن
            },
          },
          labels: {
            style: {
              colors: "#000", // رنگ سفید برای برچسب‌ها
              fontSize: "14px", // اندازه فونت برای برچسب‌ها
            },
          },
        },
        yaxis: {
          title: {
            text: "زمان ورود (Arrival Time)",
            style: {
              color: "#000", // رنگ سفید
              fontSize: "16px", // اندازه فونت
              fontWeight: "bold", // اختیاری: بولد کردن متن
            },
          },
          labels: {
            formatter: (val) => `T${val}`, // فرمت‌دهی برچسب‌ها
            style: {
              colors: "#000", // رنگ سفید برای برچسب‌ها
              fontSize: "14px", // اندازه فونت برای برچسب‌ها
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
  }, [processes]);
  return (
    <div
      style={{ padding: 20, display: "flex", justifyContent: "space-between" }}>
      <Card style={{ width: "79%", paddingRight: 15, marginBottom: 30 }}>
        <CardHeader>
          <CardTitle>نمودار الگوریتم FCFS (محور Y: زمان ورود)</CardTitle>
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
         <Charts processes={processes} data={processStats} name={"wt"} title={"Waiting Time (WT)"} />
                <Charts
                processes={processes} 
                  data={processStats}
                  name={"tat"}
                  title={"Turnaround Time (TAT)"}
                />
                  <Charts
                  processes={processes} 
                    data={processStats}
                    name={"completion"}
                    title={"Completion Time"}
                  />
      </div>
    </div>
  );
};

export default FCFSChart;
