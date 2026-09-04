import {
  GitCompareArrows,
  FileCode2,
  ShieldAlert,
  ReceiptText,
  PieChart,
  Landmark,
  LineChart,
  CreditCard,
  ScanText,
  BookOpenCheck,
  TrendingUp,
  DatabaseZap,
  Calculator,
  FileSpreadsheet as FileCalc,
  ScanLine,
  Receipt,
  FileBarChart,
  UserCheck,
  CalendarClock,
  ClipboardCheck,
  FileCheck2,
  FileText,
  SearchCheck,
  MessageSquareWarning,
  AlertOctagon,
  RefreshCcw,
  FileDiff,
  SlidersHorizontal,
  Inbox,
  FileSignature,
  Mail,
  Reply,
  Scale,
  BellRing,
  Bell,
  CalendarDays,
  Brain,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Users,
  ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";

export type ToolCategoryId =
  | "gst"
  | "accounts"
  | "income-tax"
  | "tds"
  | "audit"
  | "notices"
  | "legal"
  | "crm"
  | "ai";

export interface ToolCategory {
  id: ToolCategoryId;
  label: string;
  accent: string;
}

export interface Tool {
  id: string;
  name: string;
  category: ToolCategoryId;
  /** Additional categories this tool should also be listed under, alongside its primary `category`. */
  extraCategories?: ToolCategoryId[];
  description: string;
  icon: LucideIcon;
  shortcut?: string;
  status?: "live" | "wip" | "soon";
  /** Small marketing tag rendered on the tool card (e.g. "BETA", "PRO"). */
  badge?: "BETA" | "PRO";
  url?: string;
}

export const categories: ToolCategory[] = [
  { id: "gst", label: "GST Tools", accent: "#22D3EE" },
  { id: "accounts", label: "Accounts Tools", accent: "#2563EB" },
  { id: "income-tax", label: "Income Tax Tools", accent: "#10B981" },
  { id: "tds", label: "TDS Tools", accent: "#F59E0B" },
  { id: "audit", label: "Audit Tools", accent: "#A855F7" },
  { id: "notices", label: "Notices & Assessment", accent: "#EF4444" },
  { id: "legal", label: "Legal Drafting", accent: "#8B5CF6" },
  { id: "crm", label: "CRM & Reminders", accent: "#0EA5E9" },
  { id: "ai", label: "AI Automation", accent: "#22D3EE" },
];

export const categoryLabel = (id: ToolCategoryId) =>
  categories.find((c) => c.id === id)?.label ?? id;
export const categoryAccent = (id: ToolCategoryId) =>
  categories.find((c) => c.id === id)?.accent ?? "#2563EB";

export const tools: Tool[] = [
  { id: "gst-2a2b", name: "2A / 2B Analysis", category: "gst", description: "Reconcile 2A & 2B against books and tax ledgers.", icon: GitCompareArrows, shortcut: "G A", status: "soon" },
  { id: "gst-reco", name: "Collection & GST Reconciliation", category: "gst", description: "Builder Collection & GST Processor", icon: RefreshCcw, shortcut: "G R", status: "soon" },
  { id: "gst-2breco", name: "GSTR2B vs Books", category: "gst", description: "Match GSTR-2B against your purchase register, invoice by invoice.", icon: FileDiff, shortcut: "G B", status: "soon" },
  { id: "gst-xml", name: "Trial Balance Converter", category: "gst", extraCategories: ["income-tax"], description: "Convert a Tally trial balance into CA-format P&L, Balance Sheet & schedules.", icon: FileCode2, status: "live", url: "https://trial-balance-converter.vercel.app/" },
  { id: "gst-risk", name: "GST Risk Analyzer", category: "gst", description: "AI risk identification section-wise.", icon: ShieldAlert, status: "soon" },
  { id: "gst-rcm", name: "RCM Entry Projection", category: "gst", description: "Project RCM entries from expense nature.", icon: ReceiptText, status: "soon" },
  { id: "gst-rate", name: "Rate-wise GST Summary", category: "gst", description: "Rate-wise bifurcation & detailed 2A report.", icon: PieChart, status: "wip" },
  { id: "acc-bankconv", name: "Bank Statement Converter", category: "accounts", description: "Convert statements to import-ready format.", icon: Landmark, status: "live", url: "https://bankstatement-converter-frontend.vercel.app/dashboard" },
  { id: "acc-bankanalyser", name: "Bank Statement Analyzer", category: "accounts", description: "Data-entry analysis with summary report.", icon: LineChart, status: "soon", badge: "BETA" },
  { id: "acc-cc", name: "Credit Card Analyzer", category: "accounts", description: "Statement to import format conversion.", icon: CreditCard, status: "soon" },
  { id: "acc-salesocr", name: "Sales OCR Recording", category: "accounts", description: "OCR-based sales invoice recording.", icon: ScanText, status: "soon" },
  { id: "acc-ledger", name: "Ledger Scrutiny", category: "accounts", description: "Automated ledger scrutiny & flags.", icon: BookOpenCheck, status: "live", url: "https://ledger-scrutiny-tools.vercel.app/" },
  { id: "acc-turnover", name: "Turnover Analysis", category: "accounts", description: "MoM, GP ratio, debtor-creditor scrutiny.", icon: TrendingUp, status: "soon" },
  { id: "acc-2a2b", name: "2A–2B Conversion", category: "accounts", description: "Convert GSTR-2A / 2B into Tally-ready purchase import sheets.", icon: ArrowLeftRight, status: "soon" },
  { id: "it-ais", name: "AIS Data Extraction", category: "income-tax", description: "Extract AIS data incl. capital gains.", icon: DatabaseZap, status: "soon" },
  { id: "it-advtax", name: "Advance Tax Working", category: "income-tax", description: "Compute advance tax from prior data.", icon: Calculator, status: "soon" },
  { id: "it-itr", name: "ITR Computation", category: "income-tax", description: "Computation, ITR, P&L, balance sheet.", icon: FileCalc, status: "soon" },
  { id: "it-26qb", name: "Form 26QB Scanner", category: "income-tax", description: "Scan agreements for buyer/seller details.", icon: ScanLine, status: "soon" },
  { id: "it-expense", name: "Expense Break-up Tool", category: "income-tax", description: "Break-up per audit report requirements.", icon: Receipt, status: "soon" },
  { id: "it-bankanalyser", name: "ITR Bank Statement Analyzer", category: "income-tax", description: "Income-tax-focused bank statement analysis for ITR & scrutiny working papers.", icon: FileBarChart, status: "live", badge: "PRO", url: "https://itr-bank-statement-analyzer.vercel.app/" },
  { id: "tds-working", name: "TDS Working", category: "tds", description: "Payment register & TDS working format.", icon: FileBarChart, status: "soon" },
  { id: "tds-pan", name: "PAN Inoperative Check", category: "tds", description: "Bulk PAN operative status check.", icon: UserCheck, status: "soon" },
  { id: "tds-mom", name: "Monthly TDS Comparison", category: "tds", description: "Month-on-month cross-check & differences.", icon: CalendarClock, status: "soon" },
  { id: "tds-audit", name: "TDS Audit Summary", category: "tds", description: "TDS audit working & summary report.", icon: ClipboardCheck, status: "soon" },
  { id: "aud-report", name: "Audit Report Generator", category: "audit", description: "Visit & in-house audit report formats.", icon: FileCheck2, status: "soon" },
  { id: "aud-cma", name: "CMA Report", category: "audit", description: "Generate CMA reports for clients.", icon: FileText, status: "soon" },
  { id: "aud-bgcheck", name: "Background Check", category: "audit", description: "IT, GST, TDS, MCA, MSME party checks.", icon: SearchCheck, status: "soon" },
  { id: "aud-query", name: "Query Formation Assistant", category: "audit", description: "Frame audit queries from prompts.", icon: MessageSquareWarning, status: "soon" },
  { id: "aud-party-analysis", name: "Party Ledger Analyzer", category: "audit", extraCategories: ["income-tax"], description: "One-page, party-wise ledger summary from bank statement transactions.", icon: Users, status: "live", url: "https://ledger-scrutiny-tools.vercel.app/" },
  { id: "not-demand", name: "Demand Pending", category: "notices", description: "Fetch pending demands from portal.", icon: AlertOctagon, status: "soon" },
  { id: "not-refund", name: "Refund Failed", category: "notices", description: "Track failed refunds from portal.", icon: RefreshCcw, status: "soon" },
  { id: "not-adjusted", name: "Demand Adjusted", category: "notices", description: "Monitor adjusted demands.", icon: SlidersHorizontal, status: "soon" },
  { id: "not-fetch", name: "Notice Fetching", category: "notices", description: "Auto-fetch notices from IT portal.", icon: Inbox, status: "soon" },
  { id: "leg-agreements", name: "Agreements", category: "legal", description: "Draft agreement-specific documents.", icon: FileSignature, status: "soon" },
  { id: "leg-notices", name: "Notices", category: "legal", description: "Draft statutory & legal notices.", icon: Mail, status: "soon" },
  { id: "leg-reply", name: "Reply Drafting", category: "legal", description: "Draft replies to notices.", icon: Reply, status: "soon" },
  { id: "leg-ai", name: "AI Legal Assistant", category: "legal", description: "AI drafting via case-law context.", icon: Scale, status: "soon" },
  { id: "crm-data", name: "Data Collection Reminder", category: "crm", description: "Auto reminders until data received.", icon: BellRing, status: "soon" },
  { id: "crm-gst", name: "GST Reminder", category: "crm", description: "GST deadline reminders.", icon: Bell, status: "soon" },
  { id: "crm-tds", name: "TDS Reminder", category: "crm", description: "TDS deadline reminders.", icon: Bell, status: "soon" },
  { id: "crm-it", name: "IT Reminder", category: "crm", description: "Income tax filing reminders.", icon: Bell, status: "soon" },
  { id: "crm-calendar", name: "Task Calendar", category: "crm", description: "Pop-up tasks due in 1–2 weeks.", icon: CalendarDays, status: "soon" },
  { id: "ai-risk", name: "AI Risk Analysis", category: "ai", description: "AI-driven compliance risk scoring.", icon: Brain, status: "soon" },
  { id: "ai-scrutiny", name: "AI Scrutiny Assistant", category: "ai", description: "Assistive scrutiny of ledgers & data.", icon: Sparkles, status: "soon" },
  { id: "ai-compliance", name: "AI Compliance Checker", category: "ai", description: "Automated compliance verification.", icon: ShieldCheck, status: "soon" },
  { id: "ai-reporting", name: "AI Reporting Assistant", category: "ai", description: "Generate client reports with AI.", icon: BarChart3, status: "soon" },
];

export const getTool = (id: string) => tools.find((t) => t.id === id);
export const toolMatchesCategory = (tool: Tool, cat: ToolCategoryId) =>
  tool.category === cat || (tool.extraCategories?.includes(cat) ?? false);
export const toolsByCategory = (cat: ToolCategoryId) =>
  tools.filter((t) => toolMatchesCategory(t, cat));

/** Curated cross-department tools surfaced together on the dashboard's "All Tools" section. */
const ALL_TOOLS_IDS = [
  "gst-xml",
  "acc-bankconv",
  "gst-reco",
  "gst-2breco",
  "acc-bankanalyser",
  "it-bankanalyser",
  "acc-ledger",
];
export const allToolsSection = () =>
  ALL_TOOLS_IDS.map(getTool).filter((t): t is Tool => Boolean(t));