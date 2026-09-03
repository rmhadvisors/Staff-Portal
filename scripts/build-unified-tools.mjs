import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const staffRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(staffRoot, "..");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
    shell: true,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const analyzerRoot = path.join(repoRoot, "BankStatementAnalyzer");
const converterRoot = path.join(repoRoot, "BankStatementconvertermain");
const tbConverterRoot = path.join(repoRoot, "TrialBalanceConverter");
const gstRecoRoot = path.join(repoRoot, "Collection-Gst-Reconcillation");
const partyAnalysisRoot = path.join(repoRoot, "one-page-party-analysis");
const itrRoot = path.join(repoRoot, "ITRBankStatementAnalyzer");
const acc2a2bRoot = path.join(repoRoot, "2A-2B convertion");
const gstReconciliationRoot = path.join(repoRoot, "gst-reconciliation");

console.log("\n=== Building Bank Statement Analyzer ===");
run("npm", ["install"], { cwd: analyzerRoot });
run("npm", ["run", "build", "--workspace", "frontend"], {
  cwd: analyzerRoot,
  env: { VITE_APP_BASE_PATH: "/tools/acc-bankanalyser/" },
});
console.log("=== Bank Statement Analyzer build complete ===\n");

console.log("\n=== Building Bank Statement Converter ===");
run("npm", ["install"], { cwd: converterRoot });
run("npm", ["run", "build"], {
  cwd: converterRoot,
  env: { VITE_APP_BASE_PATH: "/tools/acc-bankconv/" },
});
console.log("=== Bank Statement Converter build complete ===\n");

console.log("\n=== Building Trial Balance Converter ===");
run("npm", ["install"], { cwd: tbConverterRoot });
run("npm", ["run", "build"], {
  cwd: tbConverterRoot,
  env: { VITE_APP_BASE_PATH: "/tools/gst-xml/" },
});
console.log("=== Trial Balance Converter build complete ===\n");

console.log("\n=== Installing Collection & GST Reconciliation (Express sidecar) ===");
// Collection & GST Reconciliation is a plain Express app — just install deps, no build needed.
run("npm", ["install"], { cwd: gstRecoRoot });
console.log("=== GST Reconciliation deps installed ===\n");

console.log("\n=== Building Party Ledger Analyzer (one-page-party-analysis) ===");
run("npm", ["install"], { cwd: partyAnalysisRoot });
run("npm", ["run", "build", "--workspace", "frontend"], {
  cwd: partyAnalysisRoot,
  env: {
    VITE_APP_BASE_PATH: "/tools/aud-party-analysis/",
    // Distinct API prefix so its /api/analysis calls don't collide with the
    // Bank Statement Analyzer's own /api/analysis in the unified server.
    VITE_API_BASE_URL: "/tools/aud-party-analysis",
  },
});
console.log("=== Party Ledger Analyzer build complete ===\n");

console.log("\n=== Installing ITR Bank Statement Analyzer (Express + Python OCR sidecar) ===");
// Plain Express app spawned as a child process by unified-preview.mjs — needs its
// own node_modules installed (it isn't part of the npm workspace). It also needs
// its Python deps (requirements.txt: pdfplumber, pdf2image, pytesseract, etc.) plus
// the system binaries they wrap (poppler, tesseract) available on the host — those
// are NOT installed here and must be provisioned by the deploy environment.
run("npm", ["install"], { cwd: itrRoot });
console.log("=== ITR Bank Statement Analyzer deps installed ===\n");

console.log("\n=== Building 2A-2B Conversion frontend (FastAPI + Python sidecar) ===");
// Frontend is a plain Vite/React SPA; the FastAPI backend (server.py) mounts
// frontend/dist as static files at "/" and its own routes under /api/*, so it
// serves both once built — no Node server piece for this tool (see
// unified-preview.mjs, which spawns it directly via uvicorn). Python deps
// (fastapi, uvicorn, pandas, etc.) are installed separately by the Dockerfile.
run("npm", ["install"], { cwd: path.join(acc2a2bRoot, "frontend") });
run("npm", ["run", "build"], {
  cwd: path.join(acc2a2bRoot, "frontend"),
  env: { VITE_APP_BASE_PATH: "/tools/acc-2a2b/" },
});
console.log("=== 2A-2B Conversion frontend build complete ===\n");

console.log("\n=== Building GSTR2B vs Books Reconciliation frontend (Flask + Python sidecar) ===");
// Frontend is a plain Vite/React SPA; the Flask backend (backend/app.py) mounts
// frontend/dist as static files at "/" and its own routes under /api/*, so it
// serves both once built — no Node server piece for this tool (see
// unified-preview.mjs, which spawns it directly via gunicorn). Python deps
// (flask, pandas, openpyxl, etc.) are installed separately by the Dockerfile.
run("npm", ["install"], { cwd: path.join(gstReconciliationRoot, "frontend") });
run("npm", ["run", "build"], {
  cwd: path.join(gstReconciliationRoot, "frontend"),
  env: { VITE_APP_BASE_PATH: "/tools/gst-2breco/" },
});
console.log("=== GSTR2B vs Books Reconciliation frontend build complete ===\n");

