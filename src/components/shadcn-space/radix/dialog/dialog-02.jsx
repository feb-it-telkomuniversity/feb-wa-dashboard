"use client";

import { Trash2Icon } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteDialog({
  trigger,
  title = "Delete Item",
  description = "Are you sure you want to delete this item? This action cannot be undone and the data will be permanently removed.",
  onConfirm,
  confirmText = "Delete",
  cancelText = "Cancel"
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button variant="outline" className="cursor-pointer">
            Delete Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="data-open:slide-in-from-bottom-8 data-closed:slide-out-to-bottom-8 data-open:zoom-in-100 data-closed:zoom-out-100 duration-300"
        showCloseButton={false}>
        <div className="flex flex-col items-center text-center gap-4">
          <div
            className="flex items-center justify-center size-12 rounded-md bg-destructive/10 text-destructive">
            <Trash2Icon size={20} />
          </div>
          <DialogHeader className="items-center">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 w-full">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1 cursor-pointer">
                {cancelText}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="destructive" onClick={onConfirm} className="flex-1 cursor-pointer">
                {confirmText}
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
