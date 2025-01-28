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
const FIFOChart = ({HandleOnChange,calculateAverages,CS,QT}) => {
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
    const contextSwitchTime = CS;
   // مرتب‌سازی فرآیندها بر اساس زمان ورود
   processes.sort((a, b) => a.arrival - b.arrival);

   let currentTime = 0;
   const completionTimes = [];
   const timeline = [];

   processes.forEach((process, index) => {
     // افزودن زمان کانتکس سویچ (به جز اولین فرآیند)
     if (index > 0) {
       currentTime += contextSwitchTime;
       timeline.push({
         time: currentTime - contextSwitchTime,
         process: "CS", // علامت‌گذاری کانتکس سویچ
       });
     }

     // فرآیند را به خط زمان اضافه کنید
     timeline.push({
       time: Math.max(currentTime, process.arrival),
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
     const completionTime = completionTimes.find((c) => c.id === process.id).completion;
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
   if (stats.length !== 0) {
     calculateAverages("FIFO", stats);
   }

   // آماده‌سازی داده‌ها برای ApexCharts
   const series = processes.map((process) => {
     const result = [];
     for (let i = 0; i < timeline.length; i++) {
       const t = timeline[i];
       if (t.process === process.id) {
         const xLen = timeline[i + 1]?.time || process.completion;
         for (let j = t.time; j < t.time + process.burst; j++) {
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

   const processColors = [];
   const processes1 = localStorage.getItem("data") ? JSON.parse(localStorage.getItem("data")) : [];
   processes1.map((item) => {
     processColors.push(item.color);
   });

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
        stroke: {
          curve: 'smooth', // منحنی نرم برای خط
          width: 3,        // ضخامت خط
          dashArray: 5,    // خط چین (خط چین با اندازه 5 پیکسل)
        },
        fill: {
          opacity: 0.3, // شفافیت رنگ داخل خط
        },
        markers: {
          size: 20,
          shape: "square", // شکل نقطه‌ها: مربع
          strokeColors: processColors.slice(0, series.length), // رنگ حاشیه نقاط
          strokeWidth: 2, // ضخامت حاشیه نقاط
          hover: {
            size: 25, // اندازه نقطه هنگام هاور
          },
          borderRadius: 8, // رادیوس برای گوشه‌ها
          strokeDashArray: 5, // خط چین برای حاشیه
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
          style: {
            fontSize: "20px", // اندازه فونت تولتیپ
            fontFamily: "Arial, sans-serif", // نوع فونت
            fontWeight: "normal", // وزن فونت
            color: "#fff", // رنگ فونت
          },
        },
      },
    });
  }, [processes,CS,QT]);

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

export default FIFOChart;
