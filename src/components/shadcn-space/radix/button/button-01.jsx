import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

const ButtonWithIconDemo = ({ text, icon, className, onClick }) => {
  return (
    <Button
      className={cn("relative text-sm font-medium rounded-full h-12 p-1 ps-6 pe-14 group transition-all duration-500 hover:ps-14 hover:pe-6 w-fit overflow-hidden hover:bg-primary/80 cursor-pointer", className)} onClick={onClick} >
      <span className="relative z-10 transition-all duration-500">
        {text}
      </span>
      <div
        className="absolute right-1 w-10 h-10 bg-background text-foreground rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45">
        {icon || <ArrowUpRight size={16} />}
      </div>
    </Button>
  );
};

export default ButtonWithIconDemo;
