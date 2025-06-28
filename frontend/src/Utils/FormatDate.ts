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
 */
export const formatTimeDisplay = (time: string): string => {
  if (!time) return '';
  
  // If ends with :00, remove it for display
  if (time.endsWith(':00')) {
    return time.slice(0, -3);
  }
  
  return time;
};