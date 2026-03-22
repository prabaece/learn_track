"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { useCategories } from "@/src/hooks/useCategories";
import { supabase } from "@/lib/supabase";
import { useConfirm } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { PageLoader } from "@/components/EmptyState";
const F = "'DM Sans','Segoe UI',sans-serif";

const PRESET_COLORS = [
  "#7c3aed",
  "#4f46e5",
  "#0284c7",
  "#0891b2",
  "#059669",
  "#16a34a",
  "#ca8a04",
  "#ea580c",
  "#dc2626",
  "#db2777",
  "#F7C948",
  "#3178C6",
  "#00D8FF",
  "#61DAFB",
  "#68A063",
  "#FF6B6B",
  "#6BCB77",
  "#F05032",
  "#ED8B00",
  "#3776AB",
];

const GROUPS: Record<string, string[]> = {
  Frontend: [
    "Frontend",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Angular",
    "Vue.js",
    "CSS / Tailwind",
    "Bootstrap",
  ],
  Backend: [
    "Backend",
    "Node.js",
    "Express.js",
    "REST API",
    "GraphQL",
    "Spring Boot",
    "Django",
  ],
  Database: ["Database", "SQL", "MongoDB", "Redis"],
  Languages: ["Java", "Python", "C / C++"],
  "DSA & Design": ["DSA", "Problem Solving", "System Design"],
  "DevOps & Tools": [
    "DevOps",
    "Docker",
    "Git / GitHub",
    "AWS / Cloud",
    "Linux / Shell",
    "Testing",
  ],
  Mobile: ["React Native"],
  "Interview Prep": ["Aptitude", "HR / Soft Skills", "Mock Interview"],
  Networking: ["Networking", "Security"],
};

interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  is_active?: boolean;
  created_at: string;
}

export default function CategoriesPage() {
  const { userId, loading: authLoading } = useAuth();
  const { confirm, Dialog } = useConfirm()
  const { categories: rawCats, loading, refetch } = useCategories(userId);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [toast, setToast] = useState({ msg: "", type: "" });

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 2500);
  };

  // Cast categories with is_active fallback
  const categories = rawCats as Category[];

  // Filter + search
  const filtered = useMemo(() => {
    return categories.filter((c) => {
      const matchSearch =
        !search || c.name.toLowerCase().includes(search.toLowerCase());
      const isActive = c.is_active !== false;
      const matchFilter =
        filterActive === "all"
          ? true
          : filterActive === "active"
            ? isActive
            : !isActive;
      return matchSearch && matchFilter;
    });
  }, [categories, search, filterActive]);

  // Group
  const grouped = useMemo(() => {
    const g: Record<string, Category[]> = {};
    filtered.forEach((cat) => {
      let placed = false;
      for (const [group, names] of Object.entries(GROUPS)) {
        if (names.includes(cat.name)) {
          if (!g[group]) g[group] = [];
          g[group].push(cat);
          placed = true;
          break;
        }
      }
      if (!placed) {
        if (!g["Custom"]) g["Custom"] = [];
        g["Custom"].push(cat);
      }
    });
    return g;
  }, [filtered]);

  const handleToggleActive = async (cat: Category) => {
    const newVal = cat.is_active === false ? true : false;
    const { error } = await supabase
      .from("categories")
      .update({ is_active: newVal })
      .eq("id", cat.id);
    if (!error) {
      showToast(
        newVal ? `✅ "${cat.name}" activated` : `⏸ "${cat.name}" deactivated`,
      );
      refetch();
    }
  };

 const handleDelete = async (cat: Category) => {
  const ok = await confirm({
    title:        'Delete Category',
    message:      `"${cat.name}" will be deleted. Tasks in this category will be uncategorised.`,
    confirmLabel: 'Delete',
    danger:       true,
  })
  if (!ok) return
  const { error } = await supabase.from('categories').delete().eq('id', cat.id)
  if (!error) { showToast(`🗑 "${cat.name}" deleted`); refetch() }
}

  const activeCount = categories.filter((c) => c.is_active !== false).length;
  const inactiveCount = categories.filter((c) => c.is_active === false).length;

  if (authLoading || loading)
    return <PageLoader text="Loading categories..." />;

  return (
    <div
      className="page-wrap"
      style={{
        minHeight: "100%",
        background: "var(--bg-page)",
        padding: "20px 24px",
        fontFamily: F,
      }}
    >
      {/* Toast */}
      {toast.msg && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 100,
            background: "var(--bg-card)",
            border: `1px solid ${toast.type === "error" ? "var(--red)" : "var(--green)"}`,
            borderRadius: 12,
            padding: "10px 16px",
            color: "var(--text-primary)",
            fontSize: 13,
            fontWeight: 500,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            animation: "slideIn .2s ease",
            maxWidth: "calc(100vw - 40px)",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <h1
            style={{
              color: "var(--text-primary)",
              fontSize: 22,
              fontWeight: 700,
              margin: 0,
            }}
          >
            Categories
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 3 }}>
            {activeCount} active · {inactiveCount} inactive ·{" "}
            {categories.length} total
          </p>
        </div>
        <button
          onClick={() => {
            setEditCat(null);
            setShowModal(true);
          }}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg,var(--accent),var(--accent-2))",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: F,
            boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Category
        </button>
      </div>

      {/* Search + filter */}
      <div
        style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}
      >
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
          <svg
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              paddingLeft: 32,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 9,
              color: "var(--text-primary)",
              fontSize: 13,
              outline: "none",
              fontFamily: F,
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              style={{
                padding: "7px 14px",
                borderRadius: 9,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: F,
                transition: "all .15s",
                background:
                  filterActive === f ? "var(--accent-bg)" : "var(--bg-card)",
                color:
                  filterActive === f
                    ? "var(--accent-text)"
                    : "var(--text-muted)",
                outline:
                  filterActive === f
                    ? "1px solid var(--accent-border)"
                    : "1px solid var(--border)",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{ marginLeft: 5, opacity: 0.6, fontSize: 11 }}>
                (
                {f === "all"
                  ? categories.length
                  : f === "active"
                    ? activeCount
                    : inactiveCount}
                )
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grouped categories */}
      {Object.entries(grouped).map(
        ([group, cats]) =>
          cats.length > 0 && (
            <div key={group} style={{ marginBottom: 20 }}>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  margin: "0 0 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {group} <span style={{ opacity: 0.5 }}>({cats.length})</span>
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
                  gap: 8,
                }}
              >
                {cats.map((cat) => {
                  const isActive = cat.is_active !== false;
                  return (
                    <div
                      key={cat.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "11px 14px",
                        borderRadius: 12,
                        background: "var(--bg-card)",
                        border: `1px solid ${isActive ? "var(--border)" : "var(--border)"}`,
                        opacity: isActive ? 1 : 0.5,
                        transition: "all .15s",
                        position: "relative",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor =
                          "var(--border-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = "var(--border)")
                      }
                    >
                      {/* Color dot */}
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: cat.color,
                          flexShrink: 0,
                          boxShadow: `0 0 6px ${cat.color}60`,
                        }}
                      />

                      {/* Name */}
                      <span
                        style={{
                          flex: 1,
                          fontSize: 13,
                          color: isActive
                            ? "var(--text-primary)"
                            : "var(--text-muted)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cat.name}
                      </span>

                      {/* Inactive badge */}
                      {!isActive && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "1px 6px",
                            borderRadius: 5,
                            background: "var(--border)",
                            color: "var(--text-muted)",
                            flexShrink: 0,
                          }}
                        >
                          off
                        </span>
                      )}

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        {/* Edit */}
                        <ActionBtn
                          title="Edit"
                          color="var(--accent-text)"
                          bg="var(--accent-bg)"
                          onClick={() => {
                            setEditCat(cat);
                            setShowModal(true);
                          }}
                          icon={
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          }
                        />
                        {/* Toggle active */}
                        <ActionBtn
                          title={isActive ? "Deactivate" : "Activate"}
                          color={isActive ? "var(--yellow)" : "var(--green)"}
                          bg={isActive ? "var(--yellow-bg)" : "var(--green-bg)"}
                          onClick={() => handleToggleActive(cat)}
                          icon={
                            isActive ? (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                              </svg>
                            ) : (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                            )
                          }
                        />
                        {/* Delete */}
                        <ActionBtn
                          title="Delete"
                          color="var(--red)"
                          bg="var(--red-bg)"
                          onClick={() => handleDelete(cat)}
                          icon={
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {Dialog}
            </div>
          ),
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <EmptyState
          message={
            search
              ? `No categories found for "${search}"`
              : filterActive !== "all"
                ? `No ${filterActive} categories`
                : "No categories yet"
          }
          action={
            !search && filterActive === "all"
              ? {
                  label: "Add Category",
                  onClick: () => {
                    setEditCat(null);
                    setShowModal(true);
                  },
                }
              : undefined
          }
        />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <CategoryModal
          cat={editCat}
          userId={userId}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            refetch();
            showToast(editCat ? "✅ Category updated!" : "✅ Category added!");
          }}
        />
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        input::placeholder{color:var(--text-muted)}
        @media(max-width:768px){.page-wrap{padding:14px!important}}
      `}</style>
    </div>

  );
}

// ── Action button ──────────────────────────────────────
function ActionBtn({
  title,
  color,
  bg,
  onClick,
  icon,
}: {
  title: string;
  color: string;
  bg: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 26,
        height: 26,
        borderRadius: 6,
        border: "none",
        background: bg,
        color,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .15s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = ".8")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {icon}
    </button>
  );
}

// ── Add/Edit Modal ─────────────────────────────────────
function CategoryModal({
  cat,
  userId,
  onClose,
  onSave,
}: {
  cat: any | null;
  userId: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(cat?.name || "");
  const [color, setColor] = useState(cat?.color || "#7c3aed");
  const [saving, setSaving] = useState(false);
  const [nameErr, setNameErr] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setNameErr("Name is required");
      return;
    }
    setSaving(true);
    if (cat) {
      await supabase
        .from("categories")
        .update({ name: name.trim(), color })
        .eq("id", cat.id);
    } else {
      await supabase
        .from("categories")
        .insert({ user_id: userId, name: name.trim(), color, is_active: true });
    }
    setSaving(false);
    onSave();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          padding: "24px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
          fontFamily: F,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              color: "var(--text-primary)",
              fontSize: 16,
              fontWeight: 700,
              margin: 0,
            }}
          >
            {cat ? "Edit Category" : "Add Category"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-page)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              width: 30,
              height: 30,
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              color: "var(--text-muted)",
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Name *
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value) setNameErr("");
            }}
            placeholder="e.g. React"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "var(--bg-input)",
              border: `1px solid ${nameErr ? "var(--red)" : "var(--border-input)"}`,
              borderRadius: 10,
              padding: "10px 14px",
              color: "var(--text-primary)",
              fontSize: 13,
              outline: "none",
              fontFamily: F,
            }}
          />
          {nameErr && (
            <p style={{ color: "var(--red)", fontSize: 11, marginTop: 4 }}>
              ⚠ {nameErr}
            </p>
          )}
        </div>

        {/* Color */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              color: "var(--text-muted)",
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Color
          </label>

          {/* Preset colors */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 10,
            }}
          >
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: c,
                  border: `2px solid ${color === c ? "var(--text-primary)" : "transparent"}`,
                  cursor: "pointer",
                  transition: "transform .15s",
                  transform: color === c ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>

          {/* Custom color picker */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: 40,
                height: 36,
                borderRadius: 8,
                border: "1px solid var(--border)",
                cursor: "pointer",
                padding: 2,
                background: "transparent",
              }}
            />
            <div
              style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: color,
                  boxShadow: `0 0 10px ${color}60`,
                }}
              />
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: 12,
                  fontFamily: "monospace",
                }}
              >
                {color}
              </span>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 10,
            background: "var(--bg-page)",
            border: "1px solid var(--border)",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 6px ${color}60`,
            }}
          />
          <span
            style={{
              fontSize: 13,
              color: "var(--text-primary)",
              fontWeight: 500,
            }}
          >
            {name || "Category preview"}
          </span>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--bg-page)",
              color: "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: F,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "none",
              background: saving
                ? "var(--accent-bg)"
                : "linear-gradient(135deg,var(--accent),var(--accent-2))",
              color: saving ? "var(--accent-text)" : "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: F,
              boxShadow: saving ? "none" : "0 4px 14px rgba(124,58,237,0.3)",
            }}
          >
            {saving ? "Saving..." : cat ? "Update" : "Add"}
          </button>
        </div>
        
      </div>
      
    </div>
    
  );
}

// ── Shared Empty State ─────────────────────────────────
// export function EmptyState({
//   message,
//   action,
// }: {
//   message: string;
//   action?: { label: string; onClick: () => void };
// }) {
//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "48px 24px",
//         textAlign: "center",
//         fontFamily: F,
//       }}
//     >
//       <svg
//         width="64"
//         height="64"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="var(--border-hover)"
//         strokeWidth="1"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         style={{ marginBottom: 16 }}
//       >
//         <rect x="2" y="3" width="20" height="14" rx="2" />
//         <line x1="8" y1="21" x2="16" y2="21" />
//         <line x1="12" y1="17" x2="12" y2="21" />
//       </svg>
//       <p
//         style={{
//           color: "var(--text-secondary)",
//           fontSize: 14,
//           fontWeight: 500,
//           margin: "0 0 6px",
//         }}
//       >
//         Nothing here yet
//       </p>
//       <p
//         style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 16px" }}
//       >
//         {message}
//       </p>
//       {action && (
//         <button
//           onClick={action.onClick}
//           style={{
//             padding: "8px 18px",
//             borderRadius: 10,
//             border: "1px solid var(--accent-border)",
//             background: "var(--accent-bg)",
//             color: "var(--accent-text)",
//             fontSize: 13,
//             fontWeight: 600,
//             cursor: "pointer",
//             fontFamily: F,
//           }}
//         >
//           {action.label}
//         </button>
        
//       )}
      
//     </div>
//   );
// }

// ── Page Loader ────────────────────────────────────────
// export function PageLoader({ text = "Loading..." }: { text?: string }) {
//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         minHeight: "100%",
//         background: "var(--bg-page)",
//         fontFamily: F,
//       }}
//     >
//       <div style={{ textAlign: "center" }}>
//         <div
//           style={{
//             width: 34,
//             height: 34,
//             border: "3px solid var(--accent-bg)",
//             borderTopColor: "var(--accent)",
//             borderRadius: "50%",
//             animation: "spin .8s linear infinite",
//             margin: "0 auto 10px",
//           }}
//         />
//         <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{text}</p>
//       </div>
//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//     </div>
//   );
// }

