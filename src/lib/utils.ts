import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert 24-hour format to 12-hour Bangladesh format (HH:MM AM/PM)
export function formatTimeToTwelveHour(timeString: string | null): string {
  if (!timeString) return '12:00 PM';
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) return '12:00 PM';
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
  } catch (err) {
    return '12:00 PM';
  }
}
