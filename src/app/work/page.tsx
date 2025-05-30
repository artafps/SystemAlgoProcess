"use client";
import {
  Badge,
  Button,
  Column,
  Feedback,
  Input,
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
  color: {
    name: string;
    hex: string;
  };
}

/** نوع فرم ورودی */
type ProcessForm = Process;
export default function Work() {
  const { addToast } = useToast();
  function generateFancyColor() {
    const nameParts1 = [
      "Velvet",
      "Blush",
      "Dreamy",
      "Golden",
      "Crystal",
      "Cotton",
      "Moonlit",
      "Fairy",
      "Silky",
      "Lavender",
      "Snowy",
      "Ocean",
      "Peachy",
      "Minty",
      "Satin",
    ];

    const nameParts2 = [
      "Rose",
      "Mist",
      "Glow",
      "Sky",
      "Cloud",
      "Pearl",
      "Twinkle",
      "Whisper",
      "Charm",
      "Dust",
      "Blossom",
      "Frost",
      "Cream",
      "Breeze",
      "Shine",
    ];

    // رنگ‌های متنوع با HSL (اشباع بالا، روشنایی متوسط)
    const randomHex = () => {
      const h = Math.floor(Math.random() * 360); // hue: 0–360 (رنگ کامل)
      const s = Math.floor(70 + Math.random() * 30); // saturation: 70–100%
      const l = Math.floor(40 + Math.random() * 20); // lightness: 40–60% (نه سفید نه سیاه)

      // تبدیل HSL به RGB
      const hslToHex = (h: number, s: number, l: number) => {
        s /= 100;
        l /= 100;
        const k = (n: number) => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = (n: number) =>
          Math.round(
            255 *
              (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))
          );
        return `#${[f(0), f(8), f(4)]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("")}`;
      };

      return hslToHex(h, s, l);
    };

    const name =
      nameParts1[Math.floor(Math.random() * nameParts1.length)] +
      " " +
      nameParts2[Math.floor(Math.random() * nameParts2.length)];

    return {
      name,
      hex: randomHex(),
    };
  }

  /* ---------- state ---------- */
  const [form, setForm] = useState<ProcessForm>({
    pid: "",
    arrivalTime: 1,
    burstTime: 1,
    color: generateFancyColor(),
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
    const newProcess: Process = {
      pid,
      arrivalTime,
      burstTime,
      color: generateFancyColor(),
    };

    setProcesses((prev) => [...prev, newProcess]);
    localStorage.setItem(
      "processes",
      JSON.stringify([...processes, newProcess])
    );
    // ریست فرم
    setForm({
      pid: "",
      arrivalTime: 0,
      burstTime: 0,
      color: generateFancyColor(),
    });
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

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {processes.map((p) => (
            <div key={p.pid}>
              <Feedback title={`فرایند ${p.pid}`} description="">
                <div style={{ display: "flex", gap: "10px" }}>
                  <Badge title="رنگ" arrow={false}>
                    <div
                      style={{
                        margin: "0px 10px 0px 0px",
                        width: "20px",
                        height: "20px",
                        borderRadius: 50,
                        background: p.color.hex,
                      }}
                    />
                  </Badge>
                  <Badge title={`زمان ورود: ${p.arrivalTime}`} arrow={false} />
                  <Badge title={`زمان اجرا: ${p.burstTime}`} arrow={false} />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button variant="secondary" onClick={() => handleEdit(p)}>
                    ویرایش
                  </Button>

                  {/* دکمهٔ حذف */}
                  <Button variant="danger" onClick={() => handleDelete(p.pid)}>
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
