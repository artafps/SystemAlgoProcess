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
const LRTFChart = ({HandleOnChange,calculateAverages,CS,QT}) => {
  const [processes, setprocesses] = useState([]);
  useEffect(() => {
    const data = localStorage.getItem("data")? JSON.parse(localStorage.getItem("data")): []
    setprocesses(data)
  }, [HandleOnChange]);
  const [chartData, setChartData] = useState({
    series: [],
    options: {},
  });

  const [processStats, setProcessStats] = useState([]);

  useEffect(() => {
    const contextSwitchTime = CS;
    const data = localStorage.getItem("data")
      ? JSON.parse(localStorage.getItem("data"))
      : [];
    let currentTime = 0;
    const timeline = [];
    const completionTimes = {};
    const remainingBurstTimes = data.reduce((acc, process) => {
      acc[process.id] = process.burst;
      return acc;
    }, {});
    
    // مرتب‌سازی فرآیندها بر اساس زمان ورود
    data.sort((a, b) => a.arrival - b.arrival);
    const readyQueue = [];
    let previousProcess = null; // ذخیره فرآیند قبلی برای مدیریت سوئیچ
    
    while (
      data.length > 0 ||
      readyQueue.length > 0 ||
      Object.values(remainingBurstTimes).some((time) => time > 0)
    ) {
      // اضافه کردن فرآیندهای آماده به صف
      while (data.length > 0 && data[0].arrival <= currentTime) {
        readyQueue.push(data.shift());
      }
    
      // مرتب‌سازی صف آماده بر اساس زمان باقی‌مانده
      readyQueue.sort((a, b) => remainingBurstTimes[b.id] - remainingBurstTimes[a.id]);
    
      if (readyQueue.length > 0) {
        const process = readyQueue[0];
    
        // بررسی تغییر فرآیند برای کانتکس سویچ
        if (previousProcess && previousProcess.id !== process.id) {
          // ثبت کانتکس سویچ در timeline
          timeline.push({
            time: currentTime,
            process: "Context Switch", // نشان‌دهنده زمان کانتکس سویچ
          });
          currentTime += contextSwitchTime; // اضافه کردن زمان کانتکس سویچ
        }
    
        timeline.push({
          time: currentTime,
          process: process.id, // فرآیندی که اجرا می‌شود
        });
    
        currentTime++; // یک واحد زمان پیشروی می‌کنیم
        remainingBurstTimes[process.id]--;
        previousProcess = process; // به‌روزرسانی فرآیند قبلی
    
        if (remainingBurstTimes[process.id] === 0) {
          completionTimes[process.id] = currentTime;
          readyQueue.shift(); // حذف فرآیند تکمیل‌شده از صف
        }
      } else {
        currentTime++; // پیشروی زمان در صورت نبود فرآیند آماده
      }
    }
    
  // محاسبه WT و TAT
  const stats = Object.keys(completionTimes).map((id) => {
    const process = processes.find((p) => p.id === id) || {
      id,
      arrival: 0,
      burst: 0,
    };
    const completionTime = completionTimes[id];
    const tat = completionTime - process.arrival;
    const wt = tat - process.burst;

    return {
      id,
      arrival: process.arrival,
      burst: process.burst,
      completion: completionTime,
      tat,
      wt,
      color: process.color,
    };
  });

  setProcessStats(stats);
  if (stats.length > 0) {
    calculateAverages("LRTF", stats);
  }
    // آماده‌سازی داده‌ها برای ApexCharts
    const DataResultQT = []
    const series = stats.map((process) => {
      const result = [];
      for (let i = 0; i < timeline.length; i++) {
        const t = timeline[i];
        if (t.process === process.id) {
          const xLen2 = timeline[i + 1]?.time || process.completion;
          const NumberOfQT = (id) =>{
            const Number =  DataResultQT.filter(item => item.ID === id).length
            return Number
          }
          for (let j = t.time; j < xLen2 && process.burst >  NumberOfQT(process.id); j++) {
            DataResultQT.push({
              ID:process.id
            })
            result.push({
              x: j, // زمان اجرا
              y: process.arrival, // زمان ورود
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
    stats.map(item =>{
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
          <CardTitle>نمودار الگوریتم Longest Remaining Time First (LRTF)</CardTitle>
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

export default LRTFChart;
