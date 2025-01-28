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
const FCFSChart = ({HandleOnChange,calculateAverages,CS,QT}) => {
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
    const timeline = [];
    let currentTime = 0;

    const completionTimes = {};

    // شبیه‌سازی الگوریتم FCFS
    processes.sort((a, b) => a.arrival - b.arrival); // مرتب‌سازی بر اساس زمان ورود

    processes.forEach((process, index) => {
      if (currentTime < process.arrival) {
        // اگر CPU بیکار باشد
        currentTime = process.arrival;
      }

      // اضافه کردن زمان کانتکس سویچ قبل از شروع هر فرآیند (به جز اولین فرآیند)
      if (index > 0) {
        timeline.push({
          time: currentTime,
          process: "CS", // نمایش کانتکس سویچ در نمودار (بدون اضافه کردن به داده‌های واقعی)
        });
        currentTime += contextSwitchTime;
      }

      // ثبت زمان شروع فرآیند در timeline
      timeline.push({
        time: currentTime,
        process: process.id,
      });

      // اجرای فرآیند
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

    setProcessStats(stats);

    if (stats.length !== 0) {
      calculateAverages("FCFS", stats);
    }

    // آماده‌سازی داده‌ها برای ApexCharts
    const series = processes.map((process) => {
      const result = [];
      for (let i = 0; i < timeline.length; i++) {
        const t = timeline[i];
        if (t.process === process.id) {
         

          for (let j = t.time; j <  t.time + process.burst; j++) {
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

    // نمایش کانتکس سویچ در نمودار
    const contextSwitchData = timeline
      .filter((t) => t.process === "CS")
      .map((t) => ({
        name: "Context Switch",
        data: [
          {
            x: t.time,
            y: null, // نمایش خالی برای تاکید بر کانتکس سویچ
          },
        ],
      }));

    // تنظیم رنگ‌ها
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
