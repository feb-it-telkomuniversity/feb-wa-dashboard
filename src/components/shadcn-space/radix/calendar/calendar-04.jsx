"use client";;
import { faker } from "@faker-js/faker";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

const RangeCalendar = ({ date, onDateChange }) => {
  return (
    <div className="flex items-center justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-start text-left font-normal bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-xl shadow-sm h-9">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pilih Tanggal Rapat</span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-fit!">
          <DialogHeader>
            <DialogTitle>Pilih Tanggal Rapat</DialogTitle>
          </DialogHeader>
          <Calendar
            className="rounded-md border"
            mode="range"
            numberOfMonths={2}
            onSelect={onDateChange}
            selected={date} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RangeCalendar;
