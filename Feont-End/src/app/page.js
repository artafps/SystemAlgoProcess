"use client";
import { Fragment, useEffect, useState } from "react";
import SRTChart from "./common/SRTChart";
import FCFSChart from "./common/FCFSChart";
import "./globals.css";
import SJFChart from "./common/SJFChart";
import FIFOChart from "./common/FIFOChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RRChart from "./common/RRChart";
import HRRNChart from "./common/HRRNChart";
import LRTFChart from "./common/LRTFChart";
import DeadlineChart from "./common/DeadlineChart";
import MultilevelQueueChart from "./common/MultilevelQueueChart";
import EDFChart from "./common/EDFChart";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Config from "./Config/Config";

const Home = () => {
  var [processes, setProcesses] = useState([]);
  useEffect(() => {
    console.log(processes);
  }, [processes]);
  console.log(processes);
  return (
    <Fragment >
      <Tabs
        defaultValue="Config"
        className="pt-5"
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
        }}>
        <TabsList style={{width:'90%' ,height:"auto", margin:'auto',display:'flex', flexWrap:"wrap"  ,justifyContent: "space-between" }}>
          <TabsTrigger value="Config" style={{ background:"red",color:'white'}}>Config</TabsTrigger>
          <TabsTrigger value="SRTChart">SRTChart</TabsTrigger>
          <TabsTrigger value="FCFSChart">FCFSChart</TabsTrigger>
          <TabsTrigger value="SJFChart">SJFChart</TabsTrigger>
          <TabsTrigger value="FIFOChart">FIFOChart</TabsTrigger>
          <TabsTrigger value="RRChart">RRChart</TabsTrigger>
          <TabsTrigger value="HRRNChart">HRRNChart</TabsTrigger>
          <TabsTrigger value="LRTFChart">LRTFChart</TabsTrigger>
          <TabsTrigger value="DeadlineChart">DeadlineChart</TabsTrigger>
          <TabsTrigger value="MultilevelQueueChart">MultilevelQueueChart</TabsTrigger>
          <TabsTrigger value="EDFChart">EDFChart</TabsTrigger>
        </TabsList>
        <TabsContent value="Config">
          <Card>
           <Config  processes={processes} setProcesses={setProcesses}/>
          </Card>
        </TabsContent>
        <TabsContent value="SRTChart">
          <Card>
            <CardHeader>
              <CardTitle>SRT (Shortest Remaining Time)</CardTitle>
              <CardDescription>
                الگوریتم SRT (کوتاه‌ترین زمان باقی‌مانده) یک الگوریتم زمانبندی است که در آن پردازه‌ای که کمترین زمان باقی‌مانده برای تکمیل را دارد، انتخاب می‌شود.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SRTChart  processes={processes}/>
              <pre>
                <code>
{`def srt_scheduling(processes):
    n = len(processes)
    remaining_time = [processes[i][1] for i in range(n)]
    complete = 0
    time = 0
    while complete != n:
        min_remaining = float('inf')
        shortest = -1
        for i in range(n):
            if processes[i][0] <= time and remaining_time[i] < min_remaining and remaining_time[i] > 0:
                min_remaining = remaining_time[i]
                shortest = i
        if shortest == -1:
            time += 1
            continue
        remaining_time[shortest] -= 1
        if remaining_time[shortest] == 0:
            complete += 1
        time += 1`}
                </code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="FCFSChart">
          <Card>
            <CardHeader>
              <CardTitle>FCFS (First Come First Serve)</CardTitle>
              <CardDescription>
                الگوریتم FCFS (اولین ورود، اولین سرویس) یک الگوریتم زمانبندی است که در آن پردازه‌ها به ترتیب ورودشان اجرا می‌شوند.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FCFSChart  processes={processes}/>
              <pre>
                <code>
{`def fcfs_scheduling(processes):
    n = len(processes)
    waiting_time = [0] * n
    for i in range(1, n):
        waiting_time[i] = processes[i - 1][1] + waiting_time[i - 1]
    return waiting_time`}
                </code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="SJFChart">
          <Card>
            <CardHeader>
              <CardTitle>SJF (Shortest Job First)</CardTitle>
              <CardDescription>
                الگوریتم SJF (کوتاه‌ترین کار اول) یک الگوریتم زمانبندی است که در آن پردازه‌ای که کمترین زمان اجرا را دارد، انتخاب می‌شود.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SJFChart  processes1={processes}/>
              <pre>
                <code>
{`def sjf_scheduling(processes):
    n = len(processes)
    processes.sort(key=lambda x: x[1])
    waiting_time = [0] * n
    for i in range(1, n):
        waiting_time[i] = processes[i - 1][1] + waiting_time[i - 1]
    return waiting_time`}
                </code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="FIFOChart">
          <Card>
            <CardHeader>
              <CardTitle>FIFO (First In First Out)</CardTitle>
              <CardDescription>
                الگوریتم FIFO (اولین ورود، اولین خروج) یک الگوریتم زمانبندی است که در آن پردازه‌ها به ترتیب ورودشان اجرا می‌شوند.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FIFOChart processes={processes} />
              <pre>
                <code>
{`def fifo_scheduling(processes):
    n = len(processes)
    waiting_time = [0] * n
    for i in range(1, n):
        waiting_time[i] = processes[i - 1][1] + waiting_time[i - 1]
    return waiting_time`}
                </code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="RRChart">
          <Card>
            <CardHeader>
              <CardTitle>RR (Round Robin)</CardTitle>
              <CardDescription>
                الگوریتم RR (رابین دور) یک الگوریتم زمانبندی است که در آن هر پردازه یک زمان مشخص (کوانتوم) برای اجرا دریافت می‌کند.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RRChart processes={processes} />
              <pre>
                <code>
{`def rr_scheduling(processes, quantum):
    n = len(processes)
    remaining_time = [processes[i][1] for i in range(n)]
    waiting_time = [0] * n
    time = 0
    while True:
        done = True
        for i in range(n):
            if remaining_time[i] > 0:
                done = False
                if remaining_time[i] > quantum:
                    time += quantum
                    remaining_time[i] -= quantum
                else:
                    time += remaining_time[i]
                    waiting_time[i] = time - processes[i][1]
                    remaining_time[i] = 0
        if done:
            break
    return waiting_time`}
                </code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="HRRNChart">
          <Card>
            <CardHeader>
              <CardTitle>HRRN (Highest Response Ratio Next)</CardTitle>
              <CardDescription>
                الگوریتم HRRN (بالاترین نسبت پاسخ بعدی) یک الگوریتم زمانبندی است که در آن پردازه‌ای با بالاترین نسبت پاسخ انتخاب می‌شود.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HRRNChart processes={processes} />
              <pre>
                <code>
{`def hrrn_scheduling(processes):
    n = len(processes)
    waiting_time = [0] * n
    for i in range(1, n):
        waiting_time[i] = processes[i - 1][1] + waiting_time[i - 1]
    return waiting_time`}
                </code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="LRTFChart">
          <Card>
            <CardHeader>
              <CardTitle>LRTF (Longest Remaining Time First)</CardTitle>
              <CardDescription>
                الگوریتم LRTF (طولانی‌ترین زمان باقی‌مانده اول) یک الگوریتم زمانبندی است که در آن پردازه‌ای با بیشترین زمان باقی‌مانده برای اجرا انتخاب می‌شود.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LRTFChart  processes={processes}/>
              <pre>
                <code>
{`def lrtf_scheduling(processes):
    n = len(processes)
    remaining_time = [processes[i][1] for i in range(n)]
    complete = 0
    time = 0
    while complete != n:
        max_remaining = -1
        longest = -1
        for i in range(n):
            if processes[i][0] <= time and remaining_time[i] > max_remaining and remaining_time[i] > 0:
                max_remaining = remaining_time[i]
                longest = i
        if longest == -1:
            time += 1
            continue
        remaining_time[longest] -= 1
        if remaining_time[longest] == 0:
            complete += 1
        time += 1`}
                </code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="DeadlineChart">
          <Card>
            <CardHeader>
              <CardTitle>Deadline Scheduling</CardTitle>
              <CardDescription>
                الگوریتم زمانبندی بر اساس ددلاین، پردازه‌ها را بر اساس زمان ددلاینشان اجرا می‌کند.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeadlineChart  processes={processes}/>
              <pre>
                <code>
{`def deadline_scheduling(processes):
    n = len(processes)
    processes.sort(key=lambda x: x[2])
    waiting_time = [0] * n
    for i in range(1, n):
        waiting_time[i] = processes[i - 1][1] + waiting_time[i - 1]
    return waiting_time`}
                </code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="MultilevelQueueChart">
          <Card>
            <CardHeader>
              <CardTitle>Multilevel Queue Scheduling</CardTitle>
              <CardDescription>
                الگوریتم زمانبندی صف چند سطحی، پردازه‌ها را در چندین صف با اولویت‌های مختلف قرار می‌دهد.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MultilevelQueueChart processes={processes}/>
              <pre>
                <code>
{`def multilevel_queue_scheduling(processes):
    n = len(processes)
    processes.sort(key=lambda x: x[2])
    waiting_time = [0] * n
    for i in range(1, n):
        waiting_time[i] = processes[i - 1][1] + waiting_time[i - 1]
    return waiting_time`}
                </code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="EDFChart">
          <Card>
            <CardHeader>
              <CardTitle>EDF (Earliest Deadline First)</CardTitle>
              <CardDescription>
                الگوریتم EDF (اولین ددلاین اول) یک الگوریتم زمانبندی است که در آن پردازه‌ای با نزدیک‌ترین ددلاین انتخاب می‌شود.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EDFChart processes={processes}/>
              <pre>
                <code>
{`def edf_scheduling(processes):
    n = len(processes)
    processes.sort(key=lambda x: x[2])
    waiting_time = [0] * n
    for i in range(1, n):
        waiting_time[i] = processes[i - 1][1] + waiting_time[i - 1]
    return waiting_time`}
                </code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Fragment>
  );
};

export default Home;