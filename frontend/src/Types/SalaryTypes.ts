// Salary calculation related types

export interface SalaryCalculation {
  user_id: number;
  name: string;
  position: string;
  hour_pay: number;
  total_hours: number;
  total_salary: number;
  shifts: Array<{
    day: string;
    start_time: string;
    finish_time: string;
    hours: number;
  }>;
}

export interface MonthlySalaryReport {
  company_id: number;
  month: string; // Format: YYYY-MM
  total_labor_cost: number;
  target_labor_cost: number;
  labor_cost_ratio: number;
  employees: SalaryCalculation[];
}