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
const SJFChart = ({HandleOnChange,calculateAverages,CS,QT}) => {
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
    const quantum = QT;
    const contextSwitchTime = CS;
    
    const originalProcesses = processes1.map((p) => ({
      ...p,
      remainingBurst: p.burst, // اضافه کردن مقدار باقی‌مانده‌ی burst برای پشتیبانی از کوانتوم
    }));

    const processes = [...originalProcesses];
    const timeline = [];
    let currentTime = 0;

    const completionTimes = {};
    const readyQueue = [];
    let lastProcessId = null; // برای ردیابی آخرین فرآیند اجرا شده

    // مرتب‌سازی فرآیندها بر اساس زمان ورود
    processes.sort((a, b) => a.arrival - b.arrival);

    while (processes.length > 0 || readyQueue.length > 0) {
      // اضافه کردن فرآیندهای جدید به صف آماده
      while (processes.length > 0 && processes[0].arrival <= currentTime) {
        readyQueue.push(processes.shift());
      }
    
      // مرتب‌سازی صف آماده بر اساس remainingBurst (کمترین burst باقی‌مانده)
      readyQueue.sort((a, b) => a.remainingBurst - b.remainingBurst);
    
      if (readyQueue.length > 0) {
        const process = readyQueue.shift();
    
        // اگر فرآیند قبلی متفاوت از فرآیند جدید باشد، زمان جابجایی اضافه می‌شود
        if (lastProcessId !== null && lastProcessId !== process.id) {
          currentTime += contextSwitchTime;
        }
    
        // اعمال کوانتوم: فقط به اندازه quantum اجرا شود
        const timeToExecute = Math.min(quantum, process.remainingBurst);
    
        timeline.push({
          time: currentTime,
          process: process.id,
        });
    
        currentTime += timeToExecute;
        process.remainingBurst -= timeToExecute;
    
        // اگر فرآیند هنوز کامل نشده، دوباره به صف اضافه می‌شود
        if (process.remainingBurst > 0) {
          // اگر به صف اضافه می‌شود، زمان جابجایی باید دوباره محاسبه شود
          currentTime += contextSwitchTime; // اضافه کردن زمان جابجایی قبل از بازگشت به صف
          readyQueue.push(process);
        } else {
          // اگر فرآیند کامل شده باشد، زمان اتمام آن ذخیره می‌شود
          completionTimes[process.id] = currentTime;
        }
    
        lastProcessId = process.id; // به‌روزرسانی فرآیند فعلی
      } else {
        currentTime++; // اگر هیچ فرآیندی آماده نبود، زمان جلو می‌رود
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

    if (stats.length !== 0) {
      calculateAverages("SJF", stats);
    }


    // آماده‌سازی داده‌ها برای ApexCharts
    const DataResultQT = []
    const series = stats.map((process) => {
      const result = [];
      let remainingBurst = process.burst;
      for (let i = 0; i < timeline.length; i++) {
        const t = timeline[i];
        if (t.process === process.id) {
    
          const xLen = timeline[i + 1]?.time;
          const NumberOfQT = (id) => {
            const Number = DataResultQT.filter(item => item.ID === id).length;
            return Number;
          };
    
          if (xLen !== undefined) {
            // زمانی که کوانتوم تایم تمام شد و باید جداگانه زمان‌ها تقسیم شوند
            for (let j = t.time; j < t.time + quantum && remainingBurst > 0; j++) {
              DataResultQT.push({
                ID: process.id,
              });
              result.push({
                x: j,
                y: process.arrival,
              });
              remainingBurst--;
            }
          } else {
            // آخرین اجرای فرآیند
            for (let j = t.time; j < t.time + remainingBurst && remainingBurst > 0; j++) {
              DataResultQT.push({
                ID: process.id,
              });
              result.push({
                x: j,
                y: process.arrival,
              });
              remainingBurst--;
            }
          }
        }
      }
      return {
        name: process.id,
        data: result,
      };
    });

    const processColors = processes1.map((item) => item.color);

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
  }, [processes1,CS,QT]);
  

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
