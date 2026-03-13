"use client";

import { useEffect, useState } from "react";
import { Group } from "@visx/group";
import { Arc } from "@visx/shape";
import { scaleLinear } from "d3-scale";

export default function TimeWheel({ tasks, date, dayOffset }) {

  const hourScale = scaleLinear()
    .domain([0, 24])
    .range([0, 2 * Math.PI]);

  // current time state (client only)
  const [now, setNow] = useState(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg
  viewBox="0 0 400 400"
  width="100%"
  height="auto"
>

      <Group top={200} left={200}>

        {/* minute ticks */}
        {Array.from({ length: 60 }).map((_, i) => {

          const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;

          const inner = i % 5 === 0 ? 150 : 155;
          const outer = 160;

          const x1 = Number((Math.cos(angle) * inner).toFixed(2));
          const y1 = Number((Math.sin(angle) * inner).toFixed(2));

          const x2 = Number((Math.cos(angle) * outer).toFixed(2));
          const y2 = Number((Math.sin(angle) * outer).toFixed(2));

          return (
            <line
              key={"m" + i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="gray"
              strokeWidth={i % 5 === 0 ? 2 : 1}
            />
          );
        })}

        {/* hour ticks */}
        {Array.from({ length: 24 }).map((_, i) => {

          const angle = hourScale(i) - Math.PI / 2;

          const x1 = Number((Math.cos(angle) * 140).toFixed(2));
          const y1 = Number((Math.sin(angle) * 140).toFixed(2));

          const x2 = Number((Math.cos(angle) * 150).toFixed(2));
          const y2 = Number((Math.sin(angle) * 150).toFixed(2));

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="white"
              strokeWidth={i % 6 === 0 ? 2 : 1}
            />
          );
        })}

        {/* hour labels */}
        {[0,3,6,9,12,15,18,21].map((h) => {

          const angle = hourScale(h) - Math.PI / 2;

          const x = Math.cos(angle) * 175;
          const y = Math.sin(angle) * 175;

          return (
            <text
              key={h}
              x={x}
              y={y}
              fill="white"
              fontSize="12"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {String(h).padStart(2,"0")}
            </text>
          );
        })}

        {/* task arcs + labels */}
        {tasks.map((task, i) => {

           const start = hourScale(task.start) ;
          const end = hourScale(task.start + task.duration);

          const mid = ((hourScale(task.start) - Math.PI / 2) + (hourScale(task.start + task.duration) - Math.PI / 2) )/ 2;

          const labelRadius = 130;

          const labelX = Math.cos(mid) * labelRadius;
          const labelY = Math.sin(mid) * labelRadius;

         
          

          return (
            <g key={i}>
<Arc
  startAngle={start}
  endAngle={end}
  innerRadius={90}
  outerRadius={160}
  fill={task.color}
  fillOpacity={0.15}
  stroke={task.color}
  strokeWidth={1}
/>

              <text
                x={labelX}
                y={labelY}
                fill="white"
                fontSize="11"
                textAnchor="middle"
                alignmentBaseline="middle"
                fontWeight="500"
              >
                {task.name}
              </text>
            </g>
          );
          
        })}

        {/* current time pointer */}
        {now && (() => {

          const hour =
  dayOffset === 0
    ? now.getHours() + now.getMinutes() / 60
    : 0;

          const angle =
            hourScale(hour) - Math.PI / 2;

          const x = Math.cos(angle) * 150;
          const y = Math.sin(angle) * 150;

          const labelX = Math.cos(angle) * 175;
          const labelY = Math.sin(angle) * 175;

         const timeString =
  dayOffset === 0
    ? now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      })
    : "00:00";

          return (
            <>
              <line
                x1={0}
                y1={0}
                x2={x}
                y2={y}
                stroke="red"
                strokeWidth={2}
              />

              <circle
                cx={labelX}
                cy={labelY}
                r="18"
                fill="black"
                stroke="red"
                strokeWidth="1"
              />

              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill="white"
                fontSize="8"
              >
                {timeString}
              </text>
            </>
          );

        })()}

      </Group>

      {/* center circle */}
      <circle
        cx="200"
        cy="200"
        r="90"
        fill="black"
      />

      {/* day label */}
      <text
        x="200"
        y="190"
        textAnchor="middle"
        fill="white"
        fontSize="18"
        fontWeight="bold"
      >
        {date
  ? new Date(date).toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()
  : ""}
      </text>

      {/* schedule summary */}
      <text
        x="200"
        y="215"
        textAnchor="middle"
        fill="gray"
        fontSize="12"
      >
        {tasks.reduce((s,t)=>s+t.duration,0).toFixed(2)}h scheduled
      </text>

    </svg>
  );
}
