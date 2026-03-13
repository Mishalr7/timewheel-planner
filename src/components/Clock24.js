"use client";

import { useEffect, useState } from "react";

export default function Clock24() {

  const [time, setTime] = useState("");

  useEffect(() => {

    const updateClock = () => {

      const now = new Date();

      const options = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      };

      const formatter = new Intl.DateTimeFormat("en-GB", options);

      setTime(formatter.format(now));
    };

    updateClock();

    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);

  }, []);

  return (
    <div className="text-lg text-gray-300">Time: {time}</div>
  );
}