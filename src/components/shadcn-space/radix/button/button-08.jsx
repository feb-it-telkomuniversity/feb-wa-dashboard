import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ButtonWithIcon = ({ icon, className, onClick, variant = "outline" }) => {
  return (
    <Button
      variant={variant}
      className={cn("rounded-lg hover:scale-120 transition-all duration-300 cursor-pointer", className)} onClick={onClick}>
      {icon}
    </Button>
  );
};

export default ButtonWithIcon