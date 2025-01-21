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
import { Input } from "@/components/ui/input";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const MultilevelQueueChart = ({HandleOnChange}) => {
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
  const [timeQuantum, settimeQuantum] = useState(4);
  useEffect(() => {
    const processes = localStorage.getItem("data")? JSON.parse(localStorage.getItem("data")): []
    

    const queue1 = processes.filter((p) => p.queue === 1);
    const queue2 = processes.filter((p) => p.queue === 2);

    let currentTime = 0;
    const timeline = [];
    const completionTimes = {};

    // زمان‌بندی صف 1 (Round Robin)
    const remainingBurstTimes = queue1.reduce((acc, process) => {
      acc[process.id] = process.burst;
      return acc;
    }, {});

    while (
      queue1.length > 0 ||
      Object.values(remainingBurstTimes).some((time) => time > 0)
    ) {
      const process = queue1.shift();
      if (remainingBurstTimes[process.id] > 0) {
        const execTime = Math.min(remainingBurstTimes[process.id], timeQuantum);
        timeline.push({
          time: currentTime,
          process: process.id,
          queue: process.queue,
        });
        currentTime += execTime;
        remainingBurstTimes[process.id] -= execTime;

        if (remainingBurstTimes[process.id] > 0) {
          queue1.push(process);
        } else {
          completionTimes[process.id] = currentTime;
        }
      }
    }

    // زمان‌بندی صف 2 (FCFS)
    queue2.sort((a, b) => a.arrival - b.arrival);
    queue2.forEach((process) => {
      timeline.push({
        time: currentTime,
        process: process.id,
        queue: process.queue,
      });
      currentTime = Math.max(currentTime, process.arrival) + process.burst;
      completionTimes[process.id] = currentTime;
    });

    // محاسبه WT و TAT
    const processes1 = localStorage.getItem("data")? JSON.parse(localStorage.getItem("data")): []
    const stats = processes1.map((process) => {
      const completionTime = completionTimes[process.id];
      const tat = completionTime - process.arrival;
      const wt = tat - process.burst;

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
  }, [processes,timeQuantum]);

  return (
    <div
      style={{ padding: 20, display: "flex", justifyContent: "space-between" }}>
      <Card style={{ width: "79%", paddingRight: 15, marginBottom: 30 }}>
        <CardHeader>
          <CardTitle>نمودار الگوریتم Multilevel Queue</CardTitle>
          <CardDescription>نمایش فرآیندهای زمان‌بندی‌شده</CardDescription>
         <Input type="number" value={timeQuantum} onChange={(e) => {
          if(e.target.value === ''){
            settimeQuantum(4)
          }else{
            if(e.target.value<=0){
              settimeQuantum(0.25)
            }else{
              settimeQuantum(e.target.value)
            }
          }
          
         }}/>
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

export default MultilevelQueueChart;
