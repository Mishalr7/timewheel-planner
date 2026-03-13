"use client";

import Clock24 from "@/components/Clock24";
import { useState, useEffect } from "react";
import TimeWheel from "@/components/TimeWheel";
import { Trash2 } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

const colors = [
  "#22c55e",
  "#06b6d4",
  "#a855f7",
  "#f97316",
  "#e11d48"
];

export default function Home() {

const { data: session } = useSession();

const [tasks, setTasks] = useState([]);
const [mounted, setMounted] = useState(false);

const [title, setTitle] = useState("");
const [startHour, setStartHour] = useState("");
const [startMinute, setStartMinute] = useState("");

const [durationHour, setDurationHour] = useState("");
const [durationMinute, setDurationMinute] = useState("");
const [loaded, setLoaded] = useState(false);

const [now, setNow] = useState(null);
const getDateString = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
const [dayOffset, setDayOffset] = useState(0);


// Load tasks from localStorage (client only)
useEffect(() => {

  const loadTasks = async () => {

    if (!session) {
      setTasks([]);
      setMounted(true);
      setLoaded(true);
      return;
    }

    const date = getDateString(dayOffset);

    const res = await fetch(
      `/api/tasks?email=${session.user.email}&date=${date}`
    );

    const data = await res.json();

    setTasks(data.tasks || []);
    setMounted(true);
    setLoaded(true);

  };

  loadTasks();

}, [dayOffset, session]);

// Save tasks
useEffect(() => {

  if (!loaded || !session) return;

  if (!tasks) return;

  const saveTasks = async () => {

    await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: session.user.email,
        date: getDateString(dayOffset),
        tasks: tasks,
      }),
    });

  };

  saveTasks();

}, [tasks]);

// Time updater
useEffect(() => {
  const update = () => setNow(new Date());

  update();

  const interval = setInterval(update, 1000);

  return () => clearInterval(interval);
}, [dayOffset]);


const addTask = () => {

  if (!title.trim()) return;

  const startNum =
    Number(startHour) + Number(startMinute) / 60;

  const durationNum =
    Number(durationHour) + Number(durationMinute) / 60;

  if (durationNum <= 0) {
    alert("Duration must be greater than 0");
    return;
  }

  if (startNum + durationNum > 24) {
    alert("Task exceeds the day limit");
    return;
  }

  const overlap = tasks.some(task =>
    startNum < task.start + task.duration &&
    startNum + durationNum > task.start
  );

  if (overlap) {
    alert("Task overlaps with another task");
    return;
  }

  const newTask = {
    name: title,
    start: startNum,
    duration: durationNum,
    color: colors[tasks.length % colors.length]
  };

  setTasks([...tasks, newTask]);

  setTitle("");
  setStartHour("");
  setStartMinute("");
  setDurationHour("");
  setDurationMinute("");
};


const deleteTask = (index) => {
  setTasks(tasks.filter((_, i) => i !== index));
};

const currentHour =
  now ? now.getHours() + now.getMinutes() / 60 : 0;

const remaining =
  (24 - currentHour).toFixed(2);

  const formatTime = (t) => {
  const hours = Math.floor(t);
  const minutes = Math.round((t % 1) * 60);

  return `${hours}:${minutes.toString().padStart(2, "0")}`;
};

return (
  <main className="flex flex-col items-center min-h-screen gap-4 px-6">
<div className="absolute top-5 right-6 flex items-center gap-3">

{!session ? (

<button
  onClick={() => signIn("google")}
  className="flex items-center gap-2 
             bg-zinc-900/80 
             border border-zinc-700
             hover:border-purple-500
             hover:bg-zinc-800
             text-gray-200 
             px-4 py-2 rounded-lg 
             transition"
>

<img
  src="https://www.svgrepo.com/show/475656/google-color.svg"
  width="16"
/>

Sign In

</button>

) : (

<div className="flex items-center gap-3">



<span className="text-gray-300 text-sm">
{session.user.name}
</span>

<button
  onClick={() => signOut()}
  className="text-gray-400 hover:text-red-500 text-sm"
>
Logout
</button>

</div>

)}

</div>

<h1 className="text-4xl font-bold"><br/>
Daily Planner
</h1>
    <Clock24 />
    <p className="text-gray-400">
      Remaining: {now ? remaining : "--"} hours
    </p>

{mounted && (
<div className="w-full max-w-2xl mx-auto">
   
<div className="flex items-center justify-center gap-4 text-lg mb-2">
<button
  onClick={() => dayOffset > -1 && setDayOffset(dayOffset - 1)}
  className="text-gray-400 hover:text-white text-xl"
>
‹
</button>

<span>
{new Date(getDateString(dayOffset)).toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit"
})}
</span>

<button
  onClick={() => dayOffset < 1 && setDayOffset(dayOffset + 1)}
  className="text-gray-400 hover:text-white text-xl"
>
›
</button>

</div>
<TimeWheel
  tasks={tasks}
  date={getDateString(dayOffset)}
  dayOffset={dayOffset}
/>
  </div>
)}
    
<div className="flex flex-wrap gap-3 mb-6 items-center justify-center">

<input
  placeholder="Task name"
  className="border border-gray-500 p-2 rounded bg-black text-white w-40"
  value={title}
  onChange={(e)=>setTitle(e.target.value)}
/>

<span className="text-gray-400 text-sm">Start</span>

<input
  type="number"
  min="0"
  max="23"
  placeholder="H"
  className="border border-gray-500 p-2 w-14 rounded bg-black text-white"
  value={startHour}
  onChange={(e)=>setStartHour(e.target.value)}
/>

<input
  type="number"
  min="0"
  max="59"
  placeholder="M"
  className="border border-gray-500 p-2 w-14 rounded bg-black text-white"
  value={startMinute}
  onChange={(e)=>setStartMinute(e.target.value)}
/>

<span className="text-gray-400 text-sm">Duration</span>

<input
  type="number"
  min="0"
  max="23"
  placeholder="H"
  className="border border-gray-500 p-2 w-14 rounded bg-black text-white"
  value={durationHour}
  onChange={(e)=>setDurationHour(e.target.value)}
/>

<input
  type="number"
  min="0"
  max="59"
  placeholder="M"
  className="border border-gray-500 p-2 w-14 rounded bg-black text-white"
  value={durationMinute}
  onChange={(e)=>setDurationMinute(e.target.value)}
/>

<button
  onClick={addTask}
  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded"
>
Add Task
</button>

</div>
    <div className="mt-6 w-80">

      <h2 className="text-lg mb-2">Tasks</h2>

      {tasks.map((task, i) => (
        <div
          key={i}
          className="flex justify-between items-center p-2 border-b"
        >
          <span>{task.name}</span>

          <div className="flex items-center gap-2">
 <span>
  {formatTime(task.start)} - {formatTime(task.start + task.duration)}
</span>

           <button
  onClick={() => deleteTask(i)}
  className="text-gray-400 hover:text-red-500 transition"
>
  <Trash2 size={16} />
</button>
          </div>
        </div>
      ))}

    </div>



  </main>
);
}