import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { categories, toolsByCategory, type ToolCategoryId } from "@/data/tools";
import { ToolGrid } from "@/components/portal/tool-grid";
import { PortalShell } from "@/components/portal/portal-shell";

export const Route = createFileRoute("/category/$categoryId")({
  component: CategoryRoute,
});

function CategoryRoute() {
  return (
    <PortalShell>
      <CategoryPage />
    </PortalShell>
  );
}

function CategoryPage() {
  const { categoryId } = Route.useParams();
  const cat = categories.find((c) => c.id === (categoryId as ToolCategoryId));
  const items = toolsByCategory(categoryId as ToolCategoryId);

  if (!cat) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-muted-foreground">Category not found.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-accent hover:underline">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full" style={{ background: cat.accent, boxShadow: `0 0 14px ${cat.accent}` }} />
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{cat.label}</h1>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{items.length} tools</span>
      </motion.div>
      <ToolGrid items={items} />
    </div>
  );
}