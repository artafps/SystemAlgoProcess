type Process = {
  cbt: number;
  at: number;
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

type SimulationResult = {
  algorithm: string;
  result: AlgorithmResult;
  averages: {
    avgWt: number;
    avgTt: number;
    avgRt: number;
  };
};

export class CPUScheduler {
  processes: Process[] = [];
  contextSwitchTime = 0;
  timeQuantum = 5;

  setProcesses(processes: [number, number][]): void {
    this.processes = processes.map(([cbt, at]) => ({ cbt, at }));
  }

  setContextSwitchTime(time: number): void {
    this.contextSwitchTime = time;
  }

  setTimeQuantum(quantum: number): void {
    this.timeQuantum = quantum;
  }

  fcfs(): AlgorithmResult {
    const n = this.processes.length;
    const wt: number[] = new Array(n).fill(0);
    const tt: number[] = new Array(n).fill(0);
    const rt: number[] = new Array(n).fill(0);
    const gantt: GanttEvent[] = [];

    // Sort processes by arrival time
    const sortedIndices = [...Array(n).keys()].sort(
      (a, b) => this.processes[a].at - this.processes[b].at
    );

    let time = this.processes[sortedIndices[0]].at;
    let lastProcess = false;

    for (let i = 0; i < n; i++) {
      const p = sortedIndices[i];
      const { cbt, at } = this.processes[p];

      if (time < at) time = at;
      wt[p] = time - at;

      // Add process arrival
      gantt.push({ start: at, end: at, process: p, type: "arrival" });

      // Add execution
      gantt.push({
        start: time,
        end: time + cbt,
        process: p,
        type: "execution",
      });
      time += cbt;

      if (i === n - 1) lastProcess = true;

      // Add context switch if needed
      if (!lastProcess && this.contextSwitchTime > 0) {
        gantt.push({
          start: time,
          end: time + this.contextSwitchTime,
          process: -1,
          type: "context_switch",
        });
        time += this.contextSwitchTime;
      }

      rt[p] = wt[p];
      tt[p] = wt[p] + cbt;
    }

    return { gantt, wt, tt, rt };
  }

  spn(): AlgorithmResult {
    const n = this.processes.length;
    const wt: number[] = new Array(n).fill(0);
    const tt: number[] = new Array(n).fill(0);
    const rt: number[] = new Array(n).fill(0);
    const gantt: GanttEvent[] = [];
    const completed: boolean[] = new Array(n).fill(false);

    let time = Math.min(...this.processes.map((p) => p.at));

    while (true) {
      // Find available processes
      const available: { index: number; cbt: number }[] = [];
      for (let i = 0; i < n; i++) {
        if (!completed[i] && this.processes[i].at <= time) {
          available.push({ index: i, cbt: this.processes[i].cbt });
        }
      }

      if (available.length === 0) {
        // Find next arriving process
        const nextArrival = Math.min(
          ...this.processes.map((p, i) => (completed[i] ? Infinity : p.at))
        );
        if (nextArrival === Infinity) break;
        time = nextArrival;
        continue;
      }

      // Find process with shortest burst time
      const next = available.reduce((prev, curr) =>
        curr.cbt < prev.cbt ? curr : prev
      );
      const current = next.index;
      const { cbt, at } = this.processes[current];

      // Add arrival
      gantt.push({ start: at, end: at, process: current, type: "arrival" });

      // Add execution
      gantt.push({
        start: time,
        end: time + cbt,
        process: current,
        type: "execution",
      });

      wt[current] = time - at;
      rt[current] = wt[current];
      tt[current] = wt[current] + cbt;
      time += cbt;
      completed[current] = true;

      if (completed.every((c) => c)) break;

      // Add context switch if needed
      if (this.contextSwitchTime > 0) {
        gantt.push({
          start: time,
          end: time + this.contextSwitchTime,
          process: -1,
          type: "context_switch",
        });
        time += this.contextSwitchTime;
      }
    }

    return { gantt, wt, tt, rt };
  }

  hrrn(): AlgorithmResult {
    const n = this.processes.length;
    const wt: number[] = new Array(n).fill(0);
    const tt: number[] = new Array(n).fill(0);
    const rt: number[] = new Array(n).fill(0);
    const gantt: GanttEvent[] = [];
    const completed: boolean[] = new Array(n).fill(false);

    let time = Math.min(...this.processes.map((p) => p.at));

    while (true) {
      // Find available processes
      const available: { index: number; ratio: number }[] = [];
      for (let i = 0; i < n; i++) {
        if (!completed[i] && this.processes[i].at <= time) {
          const wait = time - this.processes[i].at;
          const ratio = (wait + this.processes[i].cbt) / this.processes[i].cbt;
          available.push({ index: i, ratio });
        }
      }

      if (available.length === 0) {
        const nextArrival = Math.min(
          ...this.processes.map((p, i) => (completed[i] ? Infinity : p.at))
        );
        if (nextArrival === Infinity) break;
        time = nextArrival;
        continue;
      }

      // Find process with highest response ratio
      const next = available.reduce((prev, curr) =>
        curr.ratio > prev.ratio ? curr : prev
      );
      const current = next.index;
      const { cbt, at } = this.processes[current];

      // Add arrival
      gantt.push({ start: at, end: at, process: current, type: "arrival" });

      // Add execution
      gantt.push({
        start: time,
        end: time + cbt,
        process: current,
        type: "execution",
      });

      wt[current] = time - at;
      rt[current] = wt[current];
      tt[current] = wt[current] + cbt;
      time += cbt;
      completed[current] = true;

      if (completed.every((c) => c)) break;

      // Add context switch if needed
      if (this.contextSwitchTime > 0) {
        gantt.push({
          start: time,
          end: time + this.contextSwitchTime,
          process: -1,
          type: "context_switch",
        });
        time += this.contextSwitchTime;
      }
    }

    return { gantt, wt, tt, rt };
  }

  rr(): AlgorithmResult {
    const n = this.processes.length;
    const wt: number[] = new Array(n).fill(0);
    const tt: number[] = new Array(n).fill(0);
    const rt: number[] = new Array(n).fill(-1);
    const gantt: GanttEvent[] = [];
    const remaining = this.processes.map((p) => p.cbt);
    const at = this.processes.map((p) => p.at);

    let time = Math.min(...at);
    const queue: number[] = [];

    while (true) {
      // Add newly arrived processes to queue
      for (let i = 0; i < n; i++) {
        if (at[i] <= time && remaining[i] > 0 && !queue.includes(i)) {
          queue.push(i);
        }
      }

      if (queue.length === 0) {
        if (remaining.every((r) => r === 0)) break;
        const nextArrival = Math.min(
          ...at.map((arrival, i) => (remaining[i] > 0 ? arrival : Infinity))
        );
        time = nextArrival;
        continue;
      }

      // Get next process
      const current = queue.shift()!;

      // Record arrival
      if (remaining[current] === this.processes[current].cbt) {
        gantt.push({
          start: at[current],
          end: at[current],
          process: current,
          type: "arrival",
        });
      }

      // Record first response
      if (rt[current] === -1) {
        rt[current] = time - at[current];
      }

      // Execute for time quantum or remaining time
      const execTime = Math.min(this.timeQuantum, remaining[current]);
      gantt.push({
        start: time,
        end: time + execTime,
        process: current,
        type: "execution",
      });

      // Check for arrivals during execution
      for (let t = time; t <= time + execTime; t++) {
        const arrivalIndex = at.indexOf(t);
        if (
          arrivalIndex !== -1 &&
          remaining[arrivalIndex] > 0 &&
          !queue.includes(arrivalIndex) &&
          arrivalIndex !== current
        ) {
          queue.push(arrivalIndex);
        }
      }

      remaining[current] -= execTime;
      time += execTime;

      // If process isn't finished, add back to queue
      if (remaining[current] > 0) {
        queue.push(current);
      } else {
        tt[current] = time - at[current];
        wt[current] = tt[current] - this.processes[current].cbt;
      }

      // Add context switch if needed
      if (this.contextSwitchTime > 0 && queue.length > 0) {
        gantt.push({
          start: time,
          end: time + this.contextSwitchTime,
          process: -1,
          type: "context_switch",
        });
        time += this.contextSwitchTime;
      }
    }

    return { gantt, wt, tt, rt };
  }
  srtf(): AlgorithmResult {
    const n = this.processes.length;
    const wt: number[] = new Array(n).fill(0);
    const tt: number[] = new Array(n).fill(0);
    const rt: number[] = new Array(n).fill(-1);
    const gantt: GanttEvent[] = [];

    const remaining = this.processes.map((p) => p.cbt);
    const at = this.processes.map((p) => p.at);

    let time = Math.min(...at); // شروع از کمترین زمان ورود
    let completed = 0;
    let currentProcess: number | null = null;
    let executionStart: number | null = null;
    let start = 0;
    while (completed < n) {
      // انتخاب فرآیندی که آماده است و کمترین زمان باقی‌مانده دارد
      let minRemaining = Infinity;
      let nextProcess: number | null = null;

      for (let i = 0; i < n; i++) {
        if (at[i] <= time && remaining[i] > 0 && remaining[i] < minRemaining) {
          minRemaining = remaining[i];
          nextProcess = i;
        }
      }

      // اگر فرآیندی آماده نبود، زمان را جلو می‌بریم
      if (nextProcess === null) {
        time++;
        continue;
      }

      // اگر فرآیند انتخاب‌شده متفاوت از فرآیند قبلی بود، وقفه context switch بزنیم
      if (currentProcess !== nextProcess) {
        // ثبت پایان اجرای فرآیند قبلی
        if (
          currentProcess !== null &&
          executionStart !== null &&
          executionStart !== time
        ) {
          gantt.push({
            start: executionStart,
            end: time,
            process: currentProcess,
            type: "execution",
          });
        }
        console.log(currentProcess);

        // اگر زمان پاسخ این فرآیند هنوز ثبت نشده، ثبت کن
        if (rt[nextProcess] === -1) {
          rt[nextProcess] = time - at[nextProcess];
        }

        // ثبت arrival یک بار برای هر فرآیند
        if (
          !gantt.some((e) => e.type === "arrival" && e.process === nextProcess)
        ) {
          gantt.push({
            start: at[nextProcess],
            end: at[nextProcess],
            process: nextProcess,
            type: "arrival",
          });
        }
        if (start !== 0 && this.contextSwitchTime > 0) {
          gantt.push({
            start: time,
            end: time + this.contextSwitchTime,
            process: -1,
            type: "context_switch",
          });
          time += this.contextSwitchTime;
        }
        start++;
        currentProcess = nextProcess;
        executionStart = time;
      }

      // اجرای یک واحد زمان
      remaining[currentProcess]--;
      time++;

      // اگر فرآیند به پایان رسید
      if (remaining[currentProcess] === 0) {
        // ثبت بازه اجرای پایانی فرآیند
        if (executionStart !== null) {
          gantt.push({
            start: executionStart,
            end: time,
            process: currentProcess,
            type: "execution",
          });
        }

        tt[currentProcess] = time - at[currentProcess];
        wt[currentProcess] =
          tt[currentProcess] - this.processes[currentProcess].cbt;

        completed++;
        currentProcess = null;
        executionStart = null;
      }
    }

    return { gantt, wt, tt, rt };
  }

  runAllAlgorithms(): SimulationResult[] {
    const algorithms = [
      { name: "FCFS", method: this.fcfs.bind(this) },
      { name: "SPN", method: this.spn.bind(this) },
      { name: "HRRN", method: this.hrrn.bind(this) },
      { name: "RR", method: this.rr.bind(this) },
      { name: "SRTF", method: this.srtf.bind(this) },
    ];

    return algorithms.map(({ name, method }) => {
      const { gantt, wt, tt, rt } = method();

      const avgWt = wt.reduce((sum, val) => sum + val, 0) / wt.length;
      const avgTt = tt.reduce((sum, val) => sum + val, 0) / tt.length;
      const avgRt = rt.reduce((sum, val) => sum + val, 0) / rt.length;

      return {
        algorithm: name,
        result: { gantt, wt, tt, rt },
        averages: {
          avgWt,
          avgTt,
          avgRt,
        },
      };
    });
  }
}

// Example usage:
/*
const scheduler = new CPUScheduler();
scheduler.setProcesses([[6, 1], [10, 7], [2, 9], [3, 25]]);
scheduler.setContextSwitchTime(2);
scheduler.setTimeQuantum(5);

const results = scheduler.runAllAlgorithms();
console.log(results);
*/
