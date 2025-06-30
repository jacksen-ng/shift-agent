/**
 * Date and time formatting utilities for consistent formatting across the application
 * Backend expects ISO format dates (YYYY-MM-DD) and times (HH:MM:SS)
 */

/**
 * Format a Date object to ISO date string (YYYY-MM-DD)
 */
export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format time string to ensure HH:MM:SS format
 * Accepts HH:MM or HH:MM:SS and returns HH:MM:SS
 */
export const formatTimeToISO = (time: string): string => {
  if (!time) return '';
  
  // If already in HH:MM:SS format, return as is
  if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return time;
  }
  
  // If in HH:MM format, append :00
  if (time.match(/^\d{2}:\d{2}$/)) {
    return `${time}:00`;
  }
  
  // Handle edge cases
  const parts = time.split(':');
  const hours = parts[0]?.padStart(2, '0') || '00';
  const minutes = parts[1]?.padStart(2, '0') || '00';
  const seconds = parts[2]?.padStart(2, '0') || '00';
  
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Parse ISO date string (YYYY-MM-DD) to Date object
 */
export const parseISODate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Format Date object to display string (M月D日)
 */
export const formatDateDisplay = (date: Date): string => {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

/**
 * Get day of week in Japanese
 */
export const getDayOfWeekJapanese = (date: Date): string => {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[date.getDay()];
};

/**
 * Format time for display (remove seconds if :00)
 * Ensures proper HH:MM format for HTML time inputs
 */
export const formatTimeDisplay = (time: string): string => {
  if (!time) return '';
  
  // Handle numeric-only values (e.g., "09", "10") by converting to proper time format
  if (/^\d{1,2}$/.test(time)) {
    const hour = parseInt(time, 10);
    if (hour >= 0 && hour <= 23) {
      return `${hour.toString().padStart(2, '0')}:00`;
    }
    return '';
  }
  
  // Validate proper time format
  if (!/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
    return '';
  }
  
  // If ends with :00, remove it for display
  if (time.endsWith(':00')) {
    return time.slice(0, -3);
  }
  
  // Ensure HH:MM format
  const parts = time.split(':');
  const hours = parts[0].padStart(2, '0');
  const minutes = parts[1].padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Safely format time value for HTML time input
 * Handles various input formats and ensures valid HH:MM output
 */
export const formatTimeForInput = (time: string | number): string => {
  if (!time && time !== 0) return '';
  
  const timeStr = String(time);
  
  // Handle numeric values (hours only) - バックエンドから数値で来る場合
  if (/^\d{1,2}$/.test(timeStr)) {
    const hour = parseInt(timeStr, 10);
    if (hour >= 0 && hour <= 23) {
      return `${hour.toString().padStart(2, '0')}:00`;
    }
    return '';
  }
  
  // Handle HH:MM:SS format (バックエンドの標準形式) - 秒を削除してHH:MM形式に
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeStr)) {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }
  
  // Handle HH:MM format
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }
  
  // 無効な形式の場合は空文字を返す
  console.warn('Invalid time format received:', timeStr);
  return '';
};

/**
 * Parse time string safely and return hours and minutes
 * Handles various time formats including numeric-only values
 */
export const parseTimeToNumbers = (time: string): { hours: number; minutes: number } | null => {
  if (!time) return null;
  
  const timeStr = String(time);
  
  // Handle numeric values (hours only)
  if (/^\d{1,2}$/.test(timeStr)) {
    const hour = parseInt(timeStr, 10);
    if (hour >= 0 && hour <= 23) {
      return { hours: hour, minutes: 0 };
    }
    return null;
  }
  
  // Handle HH:MM:SS format
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeStr)) {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return { hours, minutes };
    }
  }
  
  // Handle HH:MM format
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return { hours, minutes };
    }
  }
  
  return null;
};

/**
 * Calculate hours between two time strings safely
 * Handles various time formats and returns 0 if parsing fails
 */
export const calculateTimeDifference = (startTime: string, endTime: string): number => {
  const start = parseTimeToNumbers(startTime);
  const end = parseTimeToNumbers(endTime);
  
  if (!start || !end) {
    console.warn('Invalid time format in calculation:', { startTime, endTime });
    return 0;
  }
  
  const startTotal = start.hours + start.minutes / 60;
  const endTotal = end.hours + end.minutes / 60;
  
  // Handle overnight shifts
  if (endTotal < startTotal) {
    return (24 - startTotal) + endTotal;
  }
  
  return endTotal - startTotal;
};