"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"; // کامپوننت Input از shadcn/ui
import { Button } from "@/components/ui/button"; // کامپوننت Button از shadcn/ui

const Config = ({ processes, setProcesses }) => {
    useEffect(() => {
      const data = localStorage.getItem("data")? JSON.parse(localStorage.getItem("data")): []
      setProcesses(data)
    }, []);
    const DeleteProcessesData = () =>{
      localStorage.clear()
      setProcesses([])
    }
  const [arrivalTime, setArrivalTime] = useState("");
  const [burstTime, setBurstTime] = useState("");
  const [deadline, setDeadline] = useState("");
  const [Queue, setQueue] = useState("");
  const addProcess = () => {
    if (!arrivalTime || !burstTime || !deadline || !Queue) {
      alert("Arrival Time and Burst  and deadline  and Queue Time are required!");
      return;
    }
    function generateFancyRGBColor() {
      const channels = [0, 0, 0]; // سه کانال RGB
      const primaryIndex = Math.floor(Math.random() * 3); // انتخاب یک کانال به صورت تصادفی برای مقدار بالا
    
      // تنظیم مقدار بالا برای یک کانال اصلی
      channels[primaryIndex] = Math.floor(Math.random() * 56) + 200; // مقدار بین 200 تا 255
    
      // تنظیم مقدار بالا برای یک کانال ثانویه (برای تنوع)
      const secondaryIndex = (primaryIndex + Math.floor(Math.random() * 2) + 1) % 3;
      channels[secondaryIndex] = Math.floor(Math.random() * 156) + 100; // مقدار بین 100 تا 255
    
      return `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`;
    }
    const dataGetLocalStorange = localStorage.getItem("data")? JSON.parse(localStorage.getItem("data")): []
    const newProcess = {
      id:'P'+(dataGetLocalStorange.length +1) ,
      arrival: parseInt(arrivalTime),
      burst: parseInt(burstTime),
      deadline: deadline ? parseInt(deadline) : 0, // اگر ددلاین وارد نشد، null قرار می‌دهیم
      queue: Queue ? parseInt(Queue) : 1, // اگر ددلاین وارد نشد، null قرار می‌دهیم
      color:generateFancyRGBColor()
    };

    console.log(dataGetLocalStorange);
    localStorage.setItem("data",JSON.stringify([...dataGetLocalStorange, newProcess]))
    setArrivalTime("");
    setBurstTime("");
    setDeadline("");
    setQueue("");
  };
useEffect(() => {
  console.log(processes);
}, [processes]);
  return (
    <div
      style={{
        width: "min(500px , 80%)",
        padding: "20px",
        margin: "auto",
        borderRadius: "8px",
      }}>
      <h3>Create Processes</h3>
      <div style={{ marginBottom: "10px" }}>
        <label>Arrival Time: </label>
        <Input
          type="number"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
          placeholder="Arrival Time"
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>Burst Time: </label>
        <Input
          type="number"
          value={burstTime}
          onChange={(e) => setBurstTime(e.target.value)}
          placeholder="Burst Time"
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>Deadline (Optional)(EDF and Deadline): </label>
        <Input
          type="number"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          placeholder="Deadline"
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>Queue (MultilevelQueueChart): </label>
        <Input
          type="number"
          value={Queue}
          onChange={(e) => setQueue(e.target.value)}
          placeholder="Queue"
        />
      </div>

      <Button onClick={addProcess} style={{ marginRight: "10px" }}>
        Add Process
      </Button>
      <Button onClick={DeleteProcessesData} style={{ marginRight: "10px" }}>
        Delete All Process
      </Button>
      <div style={{ marginTop: "20px" }}>
        <h4>Processes List:</h4>
        <ul>
          <div>
            {processes.map((process, index) => (
              <pre
                key={index}
                style={{
                  backgroundColor: "#f8f8f8",
                  padding: "10px",
                  borderRadius: "5px",
                }}>
                {JSON.stringify({ id: index + 1, ...process }, null, 2)}
              </pre>
            ))}
          </div>
        </ul>
      </div>
    </div>
  );
};

export default Config;
