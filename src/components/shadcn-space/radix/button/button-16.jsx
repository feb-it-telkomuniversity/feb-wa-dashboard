"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ButtonRipleSpotlight = ({ text, icon, className, onClick }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const handleMouseEnter = (e) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <Button
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      variant="outline"
      className={cn("relative overflow-hidden group px-6 py-3 h-auto rounded-full cursor-pointer border border-border transition-all duration-300", className)} onClick={onClick}>
      <span
        className={cn(
          "absolute w-10 h-10 rounded-full scale-0 transition-transform duration-700 ease-in-out group-hover:scale-[15] pointer-events-none",
          "bg-primary"
        )}
        style={{
          left: pos.x - 20,
          top: pos.y - 20,
        }} />
      <span
        className="relative z-10 transition-colors duration-500 pointer-events-none group-hover:text-primary-foreground">
        {icon} {text}
      </span>
    </Button>
  );
};

export default ButtonRipleSpotlight;
