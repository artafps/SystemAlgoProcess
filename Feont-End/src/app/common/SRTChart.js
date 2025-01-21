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
const SRTChart = ({HandleOnChange,calculateAverages}) => {
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
    const completed = [];
    let currentTime = 0;

    const completionTimes = {};
    const burstCopy = processes.map((p) => ({ ...p })); // کپی burst اصلی

    // شبیه‌سازی الگوریتم SRT
    while (completed.length < processes.length) {
      const availableProcesses = burstCopy.filter(
        (p) => p.arrival <= currentTime && !completed.includes(p.id)
      );

      if (availableProcesses.length === 0) {
        currentTime++;
        continue;
      }

      const currentProcess = availableProcesses.reduce((prev, curr) =>
        prev.burst < curr.burst ? prev : curr
      );

      // اجرای فرآیند به مدت 1 واحد زمانی
      currentProcess.burst--;
      timeline.push({ time: currentTime, process: currentProcess.id });

      if (currentProcess.burst === 0) {
        completed.push(currentProcess.id);
        completionTimes[currentProcess.id] = currentTime + 1; // زمان تکمیل
      }

      currentTime++;
    }

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
    if(stats.length!=0){
      calculateAverages('SRT',stats)
    }
    // آماده‌سازی داده‌ها برای ApexCharts
    const series =processes.map((process) => {
      const processTimeline = timeline
        .filter((t) => t.process === process.id)
        .map((t,i) => {
          return(
          {
          x: t.time,
          y: process.arrival,
        })});
      return {
        name: process.id,
        data: processTimeline,
      };
    });
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
      <Card style={{width:"79%", paddingRight: 15, marginBottom: 30 }}>
        <CardHeader>
          <CardTitle>نمودار الگوریتم SRT (محور Y: زمان ورود)</CardTitle>
          <CardDescription>نمایش فرآیندهای زمان‌بندی‌شده</CardDescription>
        </CardHeader>
        <Chart
          options={chartData.options}
          series={chartData.series}
          height={600}
          style={{color:'black'}}
          type="scatter"
        />
      </Card>
      <div style={{ width:"20%",height:600, display:'flex',justifyContent:"space-between",flexDirection:'column'}}>
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
      {/* جدول WT و TAT */}
      {/* <Card>
        <CardHeader>
          <CardTitle>جدول WT و TAT</CardTitle>
          <CardDescription>جزئیات زمان انتظار و برگشت</CardDescription>
        </CardHeader>
        
        <div style={{ padding: "15px" }}>
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Process</th>
                <th style={tableHeaderStyle}>Arrival Time</th>
                <th style={tableHeaderStyle}>Burst Time</th>
                <th style={tableHeaderStyle}>Completion Time</th>
                <th style={tableHeaderStyle}>Turnaround Time (TAT)</th>
                <th style={tableHeaderStyle}>Waiting Time (WT)</th>
              </tr>
            </thead>
            <tbody>
              {processStats.map((stat) => (
                <tr key={stat.id}>
                  <td style={tableCellStyle}>{stat.id}</td>
                  <td style={tableCellStyle}>{stat.arrival}</td>
                  <td style={tableCellStyle}>{stat.burst}</td>
                  <td style={tableCellStyle}>{stat.completion}</td>
                  <td style={tableCellStyle}>{stat.tat}</td>
                  <td style={tableCellStyle}>{stat.wt}</td>
                </tr>
              ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card> */}
    </div>
  );
};

const tableHeaderStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  backgroundColor: "#f4f4f4",
  textAlign: "left",
};

const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
};

export default SRTChart;
