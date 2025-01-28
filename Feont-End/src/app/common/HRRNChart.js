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
const HRRNChart = ({HandleOnChange,calculateAverages,CS,QT}) => {
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
    const processes = localStorage.getItem("data")
      ? JSON.parse(localStorage.getItem("data"))
      : [];
    const contextSwitchTime = CS; // زمان کانتکس سویچ
    let currentTime = 0;
    const timeline = [];
    const completionTimes = {};
    const waitingTimes = {};
    const turnaroundTimes = {};

    // مرتب‌سازی فرآیندها بر اساس زمان ورود
    processes.sort((a, b) => a.arrival - b.arrival);

    while (processes.length > 0) {
      // انتخاب فرآیندهای آماده
      const readyProcesses = processes.filter(
        (p) => p.arrival <= currentTime
      );

      if (readyProcesses.length > 0) {
        // محاسبه نسبت پاسخ‌دهی برای فرآیندهای آماده
        readyProcesses.forEach((process) => {
          const waitingTime = currentTime - process.arrival;
          process.responseRatio = (waitingTime + process.burst) / process.burst;
        });

        // انتخاب فرآیندی که بالاترین نسبت پاسخ‌دهی را دارد
        readyProcesses.sort((a, b) => b.responseRatio - a.responseRatio);
        const selectedProcess = readyProcesses[0];

        // اجرای فرآیند
        timeline.push({
          time: currentTime,
          process: selectedProcess.id,
        });

        currentTime += selectedProcess.burst;
        completionTimes[selectedProcess.id] = currentTime;

        // اضافه کردن زمان کانتکس سویچ اگر فرآیند دیگری در صف آماده باشد
        if (processes.length > 1) {
          currentTime += contextSwitchTime;
        }

        // حذف فرآیند از لیست
        const index = processes.findIndex(
          (p) => p.id === selectedProcess.id
        );
        processes.splice(index, 1);
      } else {
        currentTime++;
      }
    }

    // محاسبه WT و TAT
    Object.keys(completionTimes).forEach((id) => {
      const processes = localStorage.getItem("data")
        ? JSON.parse(localStorage.getItem("data"))
        : [];
      const process = processes.find((p) => p.id === id) || {};
      const completionTime = completionTimes[id];
      const tat = completionTime - process.arrival;
      const wt = tat - process.burst;

      waitingTimes[id] = wt;
      turnaroundTimes[id] = tat;
    });

    const stats = Object.keys(completionTimes).map((id) => {
      const processes = localStorage.getItem("data")
        ? JSON.parse(localStorage.getItem("data"))
        : [];

      return {
        id,
        arrival: processes.find((p) => p.id === id)?.arrival || 0,
        burst: processes.find((p) => p.id === id)?.burst || 0,
        completion: completionTimes[id],
        tat: turnaroundTimes[id],
        wt: waitingTimes[id],
        color:processes.find((p) => p.id === id)?.color || 0,
      };
    });

    setProcessStats(stats);

    if (stats.length !== 0) {
      calculateAverages("HRRN", stats);
    }

    // آماده‌سازی داده‌ها برای ApexCharts
    const series = stats.map((process) => {
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
    const processesData = localStorage.getItem("data")
      ? JSON.parse(localStorage.getItem("data"))
      : [];
      stats.map((item) => {
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
          <CardTitle>
            نمودار الگوریتم Highest Response Ratio Next (HRRN)
          </CardTitle>
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

export default HRRNChart;
