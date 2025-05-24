"use client";
import {
  Badge,
  Button,
  Card,
  Column,
  Feedback,
  Input,
  NumberInput,
  useToast,
} from "@/once-ui/components";
import { baseURL } from "@/app/resources";
import { about, person, work } from "@/app/resources/content";
import { Meta, Schema } from "@/once-ui/modules";
import { Projects } from "@/components/work/Projects";
import { useEffect, useState } from "react";

/** نوع یک فرایند */
interface Process {
  pid: string;
  arrivalTime: number;
  burstTime: number;
}

/** نوع فرم ورودی */
type ProcessForm = Process;
export default function Work() {
  const { addToast } = useToast();

  /* ---------- state ---------- */
  const [form, setForm] = useState<ProcessForm>({
    pid: "",
    arrivalTime: 1,
    burstTime: 1,
  });

  // مقدار اولیهٔ processes را خالی می‌گذاریم؛
  // بعداً در useEffect از localStorage پُر می‌شود.
  const [processes, setProcesses] = useState<Process[]>([]);

  /* ---------- خواندن از localStorage هنگام mount ---------- */
  useEffect(() => {
    // فقط روی client وجود دارد؛ در سرورسايدرندر undefined است.
    const saved = localStorage.getItem("processes");
    if (saved) {
      try {
        const parsed: Process[] = JSON.parse(saved);
        // اگر آرایه باشد در state ذخیره کن
        if (Array.isArray(parsed)) {
          setProcesses(parsed);
        }
      } catch {
        /* دادهٔ خراب را نادیده بگیر */
      }
    }
  }, []); // وابستگی خالی ⇒ فقط یک بار اجرا می‌شود

  /* ---------- هندلرهای فرم ---------- */

  const handlePidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, pid: e.target.value }));
  };

  const handleArrivalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, arrivalTime: Number(e.target.value) }));
  };

  const handleBurstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, burstTime: Number(e.target.value) }));
  };

  /* ---------- افزودن فرایند ---------- */

  const handleAdd = () => {
    const { pid, arrivalTime, burstTime } = form;

    // بررسی یکتایی PID
    const pidExists = processes.some((p) => p.pid === pid);
    if (!pid || pidExists) {
      addToast({
        variant: "danger",
        message: "PID باید یکتا و غیرخالی باشد.",
      });
      return;
    }

    // بررسی اعتبار مقادیر
    if (
      isNaN(arrivalTime) ||
      isNaN(burstTime) ||
      arrivalTime < 0 ||
      burstTime <= 0
    ) {
      addToast({
        variant: "danger",
        message: "مقادیر وارد شده معتبر نیستند.",
      });
      return;
    }

    // ایجاد فرایند جدید
    const newProcess: Process = { pid, arrivalTime, burstTime };

    setProcesses((prev) => [...prev, newProcess]);
    localStorage.setItem(
      "processes",
      JSON.stringify([...processes, newProcess])
    );
    // ریست فرم
    setForm({ pid: "", arrivalTime: 0, burstTime: 0 });
  };
  /* ---------- حذف ---------- */
  const handleDelete = (pid: string) => {
    setProcesses((prev) => {
      const updated = prev.filter((p) => p.pid !== pid);
      localStorage.setItem("processes", JSON.stringify(updated)); // ← پاک‌سازی در استوریج
      return updated;
    });
  };

  /* ---------- ویرایش ---------- */
  const handleEdit = (proc: Process) => {
    setProcesses((prev) => {
      const updated = prev.filter((p) => p.pid !== proc.pid);
      localStorage.setItem("processes", JSON.stringify(updated)); // ← پاک‌سازی در استوریج
      return updated;
    });
    setForm(proc); // مقداردهی فرم برای ویرایش
  };
  /* ---------- رندر ---------- */

  return (
    <Column maxWidth="m">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={work.path}
        title={work.title}
        description={work.description}
        image={`${baseURL}/og?title=${encodeURIComponent(work.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      <h1 className="text-2xl font-bold mb-20">افزودن فرایند</h1>

      <div className="flex gap-4 items-center" dir="ltr">
        <Column fillWidth gap="16">
          {/* PID */}
          <Input
            name="pid"
            id="input-1"
            label="PID"
            value={form.pid}
            onChange={handlePidChange}
            description="شناسه یکتا برای هر پردازش (مثلاً P1 یا P2)"
          />

          {/* Arrival Time */}
          <Input
            name="arrivalTime"
            id="input-2"
            type="number"
            label="زمان ورود"
            value={form.arrivalTime === 0 ? "0" : form.arrivalTime}
            onChange={handleArrivalChange}
            min={0}
            step={1}
            description="زمان ورود فرایند"
          />

          {/* Burst Time */}
          <Input
            name="burstTime"
            id="input-3"
            type="number"
            label="زمان اجرا"
            value={form.burstTime === 0 ? "" : form.burstTime}
            onChange={handleBurstChange}
            min={1}
            step={1}
            description="مدت زمان اجرای فرایند (بر حسب واحد زمانی)"
          />

          <Button onClick={handleAdd}>افزودن</Button>
        </Column>
      </div>

      {/* فهرست فرایندها */}
      <div className="space-y-2 mt-12">
        <h2 className="text-lg font-semibold mb-20">لیست فرایندها:</h2>

        <div style={{ display: "flex", gap: "10px" }}>
          {processes.map((p) => (
            <div key={p.pid}>
              <Feedback title={`فرایند ${p.pid}`} description="">
                <div style={{ display: "flex", gap: "10px" }}>
                  <Badge title={`زمان ورود: ${p.arrivalTime}`} arrow={false} />
                  <Badge title={`زمان اجرا: ${p.burstTime}`} arrow={false} />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button
                    
                    variant="secondary"
                    onClick={() => handleEdit(p)}
                  >
                    ویرایش
                  </Button>

                  {/* دکمهٔ حذف */}
                  <Button
                    
                    variant="danger"
                    onClick={() => handleDelete(p.pid)}
                  >
                    حذف
                  </Button>
                </div>
              </Feedback>
            </div>
          ))}
        </div>
      </div>
    </Column>
  );
}
