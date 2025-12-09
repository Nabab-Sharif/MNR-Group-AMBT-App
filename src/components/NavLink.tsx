import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavLinkProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}

export const NavLink = ({ icon: Icon, label, active, badge, onClick }: NavLinkProps) => {
  return (
    <Button
      variant={active ? "default" : "ghost"}
      className="relative gap-2"
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </Button>
  );
};
