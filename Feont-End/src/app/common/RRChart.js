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
const RRChart = ({ HandleOnChange, calculateAverages }) => {
  const [processes, setprocesses] = useState([]);
  useEffect(() => {
    const data = localStorage.getItem("data")
      ? JSON.parse(localStorage.getItem("data"))
      : [];
    setprocesses(data);
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

    const timeQuantum = 5; // مقدار تایم کوانتوم
    let currentTime = 0;
    const readyQueue = [];
    const timeline = [];
    const completionTimes = {};

    const remainingBurstTimes = processes.reduce((acc, process) => {
      acc[process.id] = process.burst;
      return acc;
    }, {});

    // مرتب‌سازی فرآیندها بر اساس زمان ورود
    processes.sort((a, b) => a.arrival - b.arrival);

    while (
      processes.length > 0 ||
      readyQueue.length > 0 ||
      Object.values(remainingBurstTimes).some((time) => time > 0)
    ) {
      // اضافه کردن فرآیندهای آماده به صف
      while (processes.length > 0 && processes[0].arrival <= currentTime) {
        readyQueue.push(processes.shift());
      }

      if (readyQueue.length > 0) {
        const process = readyQueue.shift();

        const execTime = Math.min(remainingBurstTimes[process.id], timeQuantum);
        timeline.push({
          time: currentTime,
          process: process.id,
        });

        currentTime += execTime;
        remainingBurstTimes[process.id] -= execTime;

        // اضافه کردن فرآیند به انتهای صف اگر زمان اجرا باقی مانده باشد
        if (remainingBurstTimes[process.id] > 0) {
          readyQueue.push(process);
        } else {
          completionTimes[process.id] = currentTime;
        }
      } else {
        currentTime++;
      }
    }
    // محاسبه WT و TAT
    const stats = Object.keys(completionTimes).map((id) => {
      const processes = localStorage.getItem("data")
        ? JSON.parse(localStorage.getItem("data"))
        : [];
      const process = processes.find((p) => p.id === id) || {
        id: id,
        arrival: 0,
        burst: 0,
      };
      console.log(process,processes);
      const completionTime = completionTimes[id];
      const tat = completionTime - process.arrival;
      const wt = tat - process.burst;

      return {
        id: id,
        arrival: process.arrival,
        burst: process.burst,
        completion: completionTime,
        tat: tat,
        wt: wt,
        color:process.color
      };
    });

    setProcessStats(stats);
    if (stats.length != 0) {
      calculateAverages("RR", stats);
    }
    // آماده‌سازی داده‌ها برای ApexCharts
    const DataResultQT = []
    const series = stats.map((process, index) => {
      const result = [];
      for (let i = 0; i < timeline.length; i++) {
        const t = timeline[i];
        if (t.process === process.id) {
          //const xLen = timeline[i + 1]?.time || process.completion;
          const NumberOfQT = (B,T,id) =>{
            const Number =  DataResultQT.filter(item => item.ID === id).length
            console.log(DataResultQT);
            console.log(T,B,Number,T+(B-Number),id);
            return T+(B-Number)
          }
          const xLen = NumberOfQT(process.burst,t.time,process.id)
          for (let j = t.time; j < xLen; j++) {
            DataResultQT.push({
              ID:process.id
            })
            result.push({
              x: j, // زمان اجرا
              y: process.arrival, // زمان ورود تغییر دادم
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
          curve: "smooth", // منحنی نرم برای خط
          width: 3, // ضخامت خط
          dashArray: 5, // خط چین (خط چین با اندازه 5 پیکسل)
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
  }, [processes]);
  return (
    <div
      style={{ padding: 20, display: "flex", justifyContent: "space-between" }}>
      <Card style={{ width: "79%", paddingRight: 15, marginBottom: 30 }}>
        <CardHeader>
          <CardTitle>نمودار الگوریتم Round Robin (RR)</CardTitle>
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
        <Charts
          processes={processes}
          data={processStats}
          name={"wt"}
          title={"Waiting Time (WT)"}
        />
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

export default RRChart;
