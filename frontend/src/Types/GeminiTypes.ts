// Re-export Gemini types from the service
export type {
  GeminiCreateShiftRequest,
  GeminiEvaluateShiftRequest,
  GeminiCreateShiftResponse,
  GeminiEvaluateShiftResponse,
  EditShiftItem,
  CompanyInfo as GeminiCompanyInfo, // Renamed to avoid conflict with StoreTypes
  CompanyMember,
  DecisionShiftItem,
  EvaluateDecisionShiftItem
} from '../Services/GeminiService';