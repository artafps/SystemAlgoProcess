"use client";

import {
  Row,
  Column,
  Card,
  Text,
  Avatar,
  Icon,
  Line,
  Flex,
  Scroller,
  SegmentedControl,
  NumberInput,
} from "@/once-ui/components";
import Chart from "react-apexcharts";
import { Table } from "@/once-ui/components";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import { about, algo, baseURL, person } from "../resources";
import { Schema } from "@/once-ui/modules";
import { CPUScheduler } from "./componnents/CPUScheduler";

// ChartJS registration
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Algo() {
  const [selcetor, setSelector] = useState("apc");
  const [valuetq, setValuetq] = useState<number>(1);
  const [valuecst, setValuecst] = useState<number>(0);

  const handleChangetq = (newValue: number) => {
    setValuetq(newValue);
  };
  const handleChangecst = (newValue: number) => {
    setValuecst(newValue);
  };
  function loadProcessesFromLocalStorage() {
    const raw = localStorage.getItem("processes");
    if (!raw) return { processes: [], colors: [] };

    try {
      const parsed = JSON.parse(raw) as {
        pid: string;
        arrivalTime: number;
        burstTime: number;
        color: { name: string; hex: string };
      }[];

      const processes = parsed.map((p) => [p.burstTime, p.arrivalTime]);
      const colors = parsed.map((p) => p.color.hex);

      return { processes, colors };
    } catch (e) {
      console.error("Invalid JSON in localStorage for 'processes':", e);
      return { processes: [], colors: [] };
    }
  }
  const data = loadProcessesFromLocalStorage();
  const scheduler = new CPUScheduler();
  scheduler.setProcesses(
    (data.processes.length > 0 ? data.processes : [[3, 3]]) as [
      number,
      number
    ][]
  );
  scheduler.setContextSwitchTime(valuecst);
  scheduler.setTimeQuantum(valuetq);
  const results = scheduler.runAllAlgorithms();

  const series = [
    {
      name: "Avg Wait Time",
      data: results.map((r) => r.averages.avgWt),
    },
    {
      name: "Avg Turnaround Time",
      data: results.map((r) => r.averages.avgTt),
    },
    {
      name: "Avg Response Time",
      data: results.map((r) => r.averages.avgRt),
    },
  ];

  const options = {
    chart: {
      type: "bar",
      height: 350,
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 0, // گوشه‌های صاف (مربع)
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#000"], // رنگ خط دور ستون (مثلا سیاه)
      dashArray: 5, // خط‌چین: تعداد پیکسل‌های خط و فاصله
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: results.map((r, i) => `${r.algorithm}`),
    },
    colors: ["#60a5fa", "#34d399", "#fbbf24"],
    legend: {
      position: "top",
    },
    fill: {
      opacity: 0.9,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toFixed(2)} ms`,
      },
    },
  };
  type GanttEvent = {
    start: number;
    end: number;
    process: number; // -1 for context switch
    type: "arrival" | "execution" | "context_switch";
  };

  type AlgorithmResult = {
    gantt: GanttEvent[];
    wt: number[];
    tt: number[];
    rt: number[];
  };

  function convertResultToSeries(
    result: AlgorithmResult
  ): { name: string; data: { x: number; y: number }[] }[] {
    const processMap = new Map<number, { x: number; y: number }[]>();

    for (const event of result.gantt) {
      if (event.type === "execution") {
        const pid = event.process!;
        if (!processMap.has(pid)) processMap.set(pid, []);

        for (let t = event.start; t < event.end; t++) {
          processMap.get(pid)!.push({ x: t, y: pid });
        }
      }
    }

    // تبدیل به آرایه با نام P0, P1, ...
    const series = Array.from(processMap.entries()).map(([pid, data]) => ({
      name: `P${pid}`,
      data,
    }));

    return series;
  }
  return (
    <Column
      gap="16"
      padding="16"
      style={{
        display: "flex",
        alignItems: "center", // محتوای افقی را وسط‌چین می‌کند
        justifyContent: "center", // اگر بخواهید عمودی هم وسط‌چین شود
        width: "60%", // برای اطمینان از گرفتن عرض کامل
      }}
    >
      {/* Summary Chart */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <SegmentedControl
          dir="ltr"
          width={50}
          defaultValue={"apc"}
          buttons={[
            { value: "apc", label: "مقایسه عملکرد الگوریتم" },
            { value: "FCFS", label: "FCFS  الگوریتم" },
            { value: "SPN", label: "SPN الگوریتم" },
            { value: "SRTF", label: "SRTF الگوریتم" },
            { value: "RR", label: "RR الگوریتم" },
            { value: "HRRN", label: "HRRN الگوریتم" },
          ]}
          onToggle={(value) => setSelector(value)}
        />
      </div>
      {selcetor === "apc" ? (
        <Column fillWidth paddingX="20" paddingY="24" gap="12">
          <h1>مقایسه عملکرد الگوریتم</h1>
          <div className="h-96 w-full">
            <Chart
              options={options as object}
              series={series}
              height={350}
              width={"100%"}
              style={{ color: "black" }}
              type="bar"
            />
          </div>
        </Column>
      ) : (
        ""
      )}

      {results
        .filter((item) => {
          if (item.algorithm === selcetor) {
            return item;
          }
        })
        .map((item, idx) => {
          const { algorithm, result, averages } = item;
          console.log(item.result);
          const series = convertResultToSeries(item.result);
          const processColors = data.colors;
          const op = {
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
              opacity: 0.7, // شفافیت رنگ داخل خط
            },
            markers: {
              size: 10,
              shape: "square", // شکل نقطه‌ها: مربع
              strokeColors: processColors.slice(0, series.length), // رنگ حاشیه نقاط
              strokeWidth: 2, // ضخامت حاشیه نقاط
              hover: {
                size: 15, // اندازه نقطه هنگام هاور
              },
              borderRadius: 8, // رادیوس برای گوشه‌ها
              strokeDashArray: 5, // خط چین برای حاشیه
            },
            colors: processColors.slice(0, series.length),
            xaxis: {
              title: {
                text: "زمان اجرا (Execution Time)",
                style: {
                  color: "rgba(59, 130, 246, 0.7)", // رنگ سفید
                  fontSize: "16px", // اندازه فونت
                  fontWeight: "bold", // اختیاری: بولد کردن متن
                },
              },
              labels: {
                style: {
                  colors: "rgba(59, 130, 246, 0.7)", // رنگ سفید برای برچسب‌ها
                  fontSize: "14px", // اندازه فونت برای برچسب‌ها
                },
              },
            },
            yaxis: {
              title: {
                text: "زمان ورود (Arrival Time)",
                style: {
                  color: "rgba(59, 130, 246, 0.7)", // رنگ سفید
                  fontSize: "16px", // اندازه فونت
                  fontWeight: "bold", // اختیاری: بولد کردن متن
                },
              },
              labels: {
                formatter: (val: string) => `T${val}`, // فرمت‌دهی برچسب‌ها
                style: {
                  colors: "rgba(59, 130, 246, 0.7)", // رنگ سفید برای برچسب‌ها
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
          };

          return (
            <div style={{ width: "100%" }} dir="ltr" key={idx}>
              <Schema
                as="webPage"
                baseURL={baseURL}
                path={algo.path}
                title={algo.title}
                description={algo.description}
                image={`${baseURL}/og?title=${encodeURIComponent(algo.title)}`}
                author={{
                  name: person.name,
                  url: `${baseURL}${about.path}`,
                  image: `${baseURL}${person.avatar}`,
                }}
              />
              <div>
                <Row
                  dir="rtl"
                  fillWidth
                  paddingX="20"
                  paddingY="12"
                  gap="8"
                  vertical="center"
                >
                  <h1>الگوریتم {algorithm} </h1>
                </Row>

                <Column fillWidth paddingX="20" paddingY="24" gap="12">
                  {/* Process Metrics */}
                  <Column gap="8">
                    <h2>Process Metrics | ماتریس فرآیندها</h2>
                    <Table
                      data={{
                        headers: [
                          { content: "Process", key: "process" },
                          { content: "Wait Time", key: "wt" },
                          { content: "Turnaround Time", key: "tt" },
                          { content: "Response Time", key: "rt" },
                        ],
                        rows: result.wt.map((_, i) => [
                          `P${i + 1}`,
                          result.wt[i],
                          result.tt[i],
                          result.rt[i],
                        ]),
                      }}
                    />
                  </Column>

                  {series.length > 0 ? (
                    <Chart
                      options={op as object}
                      series={series}
                      height={600}
                      width={"100%"}
                      style={{ color: "black" }}
                      type="scatter"
                    />
                  ) : (
                    ""
                  )}
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1">
                      <p className="mb-1">زمان کوانتوم | TimeQuantum</p>
                      <NumberInput
                        dir="ltr"
                        id="number-input-example"
                        label="TimeQuantum"
                        value={valuetq}
                        onChange={handleChangetq}
                        min={1}
                        max={100}
                        step={1}
                        disabled
                      />
                    </div>

                    <div className="flex-1">
                      <p className="mb-1">
                        زمان سوئیچ کانتکست | ContextSwitchTime
                      </p>
                      <NumberInput
                        dir="ltr"
                        id="number-input-example"
                        label="ContextSwitchTime"
                        value={valuecst}
                        onChange={handleChangecst}
                        min={0}
                        max={100}
                        step={1}
                        disabled
                      />
                    </div>
                  </div>

                  {/* Averages */}
                  <Row gap="8">
                    <Card
                      radius="l"
                      direction="column"
                      border="neutral-alpha-weak"
                    >
                      <Column padding="12" gap="4">
                        <Text variant="label-default-s">
                          میانگین زمان انتظار
                        </Text>
                        <Text variant="label-default-s">Avg Wait Time</Text>
                        <Text variant="body-default-xl">
                          {averages.avgWt.toFixed(2)}
                        </Text>
                      </Column>
                    </Card>
                    <Card
                      radius="l"
                      direction="column"
                      border="neutral-alpha-weak"
                    >
                      <Column padding="12" gap="4">
                        <Text variant="label-default-s">میانگین چرخش</Text>
                        <Text variant="label-default-s">Avg Turnaround</Text>
                        <Text variant="body-default-xl">
                          {averages.avgTt.toFixed(2)}
                        </Text>
                      </Column>
                    </Card>
                    <Card
                      radius="l"
                      direction="column"
                      border="neutral-alpha-weak"
                    >
                      <Column padding="12" gap="4">
                        <Text variant="label-default-s">میانگین زمان پاسخ</Text>
                        <Text variant="label-default-s">Avg Response Time</Text>

                        <Text variant="body-default-xl">
                          {averages.avgRt.toFixed(2)}
                        </Text>
                      </Column>
                    </Card>
                  </Row>
                </Column>

                <Line background="neutral-alpha-medium" />
              </div>
            </div>
          );
        })}

      <Scroller>
        <Row gap="16">
          {Array(10)
            .fill(0)
            .map((_, i) => (
              <Flex key={i} />
            ))}
        </Row>
      </Scroller>
    </Column>
  );
}
