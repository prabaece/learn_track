
// "use client";

// import { useMemo,useState } from "react";
// import Link from "next/link";
// import { useAuth } from "@/src/hooks/useAuth";
// import { useTasks } from "@/src/hooks/useTask";

// import { useAutomation } from "@/src/hooks/useAutomation";
// import PomodoroTimer from "@/components/PomodoroTimer";

// const F = "'DM Sans','Segoe UI',sans-serif";

// export default function DashboardPage() {
//   const { userId, userName, loading: authLoading } = useAuth();
//   const { tasks, loading: tasksLoading } = useTasks(userId);
//   const { suggestions, streak, autoFixed, dismissSuggestion } = useAutomation(
//     userId,
//     tasks,
//   );
//   const [showAutoMsg, setShowAutoMsg] = useState(true);

//   const stats = useMemo(() => {
//     const total = tasks.length;
//     const completed = tasks.filter((t) => t.status === "completed").length;
//     const inProgress = tasks.filter((t) => t.status === "in_progress").length;
//     const todo = tasks.filter((t) => t.status === "todo").length;
//     const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
//     return { total, completed, inProgress, todo, rate };
//   }, [tasks]);

//   const greeting = useMemo(() => {
//     const h = new Date().getHours();
//     if (h < 12) return "Good morning";
//     if (h < 17) return "Good afternoon";
//     return "Good evening";
//   }, []);

//   if (authLoading || tasksLoading)
//     return (
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           minHeight: "100%",
//           background: "var(--bg-page)",
//           fontFamily: F,
//         }}
//       >
//         <div style={{ textAlign: "center" }}>
//           <div
//             style={{
//               width: 36,
//               height: 36,
//               border: "3px solid var(--accent-bg)",
//               borderTopColor: "var(--accent)",
//               borderRadius: "50%",
//               animation: "spin .8s linear infinite",
//               margin: "0 auto 10px",
//             }}
//           />
//           <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading...</p>
//         </div>
//         <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//       </div>
//     );

//   const { total, completed, inProgress, todo, rate } = stats;

//   return (
//     <div
//       style={{
//         minHeight: "100%",
//         background: "var(--bg-page)",
//         padding: "28px 32px",
//         fontFamily: F,
//       }}
//     >
//       {/* Pomodoro — floating */}
//       <PomodoroTimer />

//       {/* Header */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "flex-start",
//           marginBottom: 24,
//         }}
//       >
//         <div>
//           <p
//             style={{
//               color: "var(--text-muted)",
//               fontSize: 13,
//               margin: "0 0 4px",
//             }}
//           >
//             {greeting},
//           </p>
//           <h1
//             style={{
//               color: "var(--text-primary)",
//               fontSize: 26,
//               fontWeight: 700,
//               margin: 0,
//             }}
//           >
//             {userName} <span style={{ fontSize: 22 }}>👋</span>
//           </h1>
//           <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
//             {new Date().toLocaleDateString("en-IN", {
//               weekday: "long",
//               day: "numeric",
//               month: "long",
//               year: "numeric",
//             })}
//           </p>
//         </div>
//         <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//           {/* Streak badge */}
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 6,
//               padding: "8px 14px",
//               borderRadius: 10,
//               background:
//                 streak.current > 0 ? "rgba(249,115,22,0.1)" : "var(--bg-card)",
//               border: `1px solid ${streak.current > 0 ? "rgba(249,115,22,0.25)" : "var(--border)"}`,
//             }}
//           >
//             <span style={{ fontSize: 16 }}>
//               {streak.current > 0 ? "🔥" : "💤"}
//             </span>
//             <div>
//               <p
//                 style={{
//                   color: streak.current > 0 ? "#f97316" : "var(--text-muted)",
//                   fontSize: 13,
//                   fontWeight: 700,
//                   margin: 0,
//                   lineHeight: 1,
//                 }}
//               >
//                 {streak.current} day{streak.current !== 1 ? "s" : ""}
//               </p>
//               <p
//                 style={{
//                   color: "var(--text-hint)",
//                   fontSize: 10,
//                   margin: "2px 0 0",
//                 }}
//               >
//                 Best: {streak.longest}d
//               </p>
//             </div>
//           </div>
//           <Link
//             href="/tasks"
//             style={{
//               textDecoration: "none",
//               padding: "10px 18px",
//               borderRadius: 12,
//               background:
//                 "linear-gradient(135deg,var(--accent),var(--accent-2))",
//               color: "#fff",
//               fontSize: 13,
//               fontWeight: 600,
//               boxShadow: "0 4px 18px rgba(124,58,237,0.3)",
//               display: "flex",
//               alignItems: "center",
//               gap: 7,
//             }}
//           >
//             <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Task
//           </Link>
//         </div>
//       </div>

//       {/* Auto-prioritize notice */}
//       {autoFixed > 0 && showAutoMsg && (
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             padding: "12px 16px",
//             borderRadius: 12,
//             marginBottom: 16,
//             background: "rgba(251,191,36,0.08)",
//             border: "1px solid rgba(251,191,36,0.2)",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <span style={{ fontSize: 18 }}>⚡</span>
//             <div>
//               <p
//                 style={{
//                   color: "var(--yellow)",
//                   fontSize: 13,
//                   fontWeight: 600,
//                   margin: 0,
//                 }}
//               >
//                 Auto-prioritized {autoFixed} overdue task
//                 {autoFixed > 1 ? "s" : ""}
//               </p>
//               <p
//                 style={{
//                   color: "var(--text-muted)",
//                   fontSize: 12,
//                   margin: "2px 0 0",
//                 }}
//               >
//                 Overdue tasks automatically set to High priority
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={() => setShowAutoMsg(false)}
//             style={{
//               background: "none",
//               border: "none",
//               color: "var(--text-muted)",
//               cursor: "pointer",
//               fontSize: 16,
//             }}
//           >
//             ×
//           </button>
//         </div>
//       )}

//       {/* Stat cards */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(4,1fr)",
//           gap: 14,
//           marginBottom: 20,
//         }}
//       >
//         {[
//           {
//             label: "Total Tasks",
//             value: total,
//             icon: "📋",
//             color: "#818cf8",
//             border: "rgba(129,140,248,0.2)",
//             sub: "all time",
//           },
//           {
//             label: "Completed",
//             value: completed,
//             icon: "✅",
//             color: "var(--green)",
//             border: "rgba(52,211,153,0.2)",
//             sub: `${rate}% done`,
//           },
//           {
//             label: "In Progress",
//             value: inProgress,
//             icon: "⚡",
//             color: "var(--yellow)",
//             border: "rgba(251,191,36,0.2)",
//             sub: "active now",
//           },
//           {
//             label: "To Do",
//             value: todo,
//             icon: "📌",
//             color: "var(--blue)",
//             border: "rgba(56,189,248,0.2)",
//             sub: "pending",
//           },
//         ].map((s, i) => (
//           <div
//             key={i}
//             style={{
//               background: "var(--bg-card)",
//               border: `1px solid ${s.border}`,
//               borderRadius: 16,
//               padding: "18px 20px",
//               cursor: "default",
//               transition: "transform .2s",
//             }}
//             onMouseEnter={(e) =>
//               (e.currentTarget.style.transform = "translateY(-2px)")
//             }
//             onMouseLeave={(e) =>
//               (e.currentTarget.style.transform = "translateY(0)")
//             }
//           >
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "flex-start",
//                 marginBottom: 10,
//               }}
//             >
//               <p
//                 style={{
//                   color: "var(--text-secondary)",
//                   fontSize: 12,
//                   margin: 0,
//                 }}
//               >
//                 {s.label}
//               </p>
//               <span style={{ fontSize: 18 }}>{s.icon}</span>
//             </div>
//             <p
//               style={{
//                 color: s.color,
//                 fontSize: 30,
//                 fontWeight: 700,
//                 margin: "0 0 4px",
//                 lineHeight: 1,
//               }}
//             >
//               {s.value}
//             </p>
//             <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0 }}>
//               {s.sub}
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* Smart suggestions */}
//       {suggestions.length > 0 && (
//         <div
//           style={{
//             background: "var(--bg-card)",
//             border: "1px solid var(--border)",
//             borderRadius: 16,
//             padding: "18px 20px",
//             marginBottom: 20,
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 8,
//               marginBottom: 14,
//             }}
//           >
//             <span style={{ fontSize: 18 }}>🤖</span>
//             <p
//               style={{
//                 color: "var(--text-primary)",
//                 fontSize: 14,
//                 fontWeight: 600,
//                 margin: 0,
//               }}
//             >
//               Smart Suggestions
//             </p>
//             <span
//               style={{
//                 fontSize: 11,
//                 padding: "2px 8px",
//                 borderRadius: 6,
//                 background: "var(--accent-bg)",
//                 color: "var(--accent-text)",
//               }}
//             >
//               AI Powered
//             </span>
//           </div>
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(2,1fr)",
//               gap: 10,
//             }}
//           >
//             {suggestions.map((s) => (
//               <div
//                 key={s.id}
//                 style={{
//                   display: "flex",
//                   alignItems: "flex-start",
//                   gap: 10,
//                   padding: "12px 14px",
//                   borderRadius: 12,
//                   background: "var(--bg-page)",
//                   border: `1px solid ${s.priority === "high" ? "rgba(248,113,113,0.2)" : "var(--border)"}`,
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 8,
//                     height: 8,
//                     borderRadius: "50%",
//                     flexShrink: 0,
//                     marginTop: 4,
//                     background:
//                       s.priority === "high" ? "var(--red)" : "var(--yellow)",
//                   }}
//                 />
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <p
//                     style={{
//                       color: "var(--text-primary)",
//                       fontSize: 12,
//                       fontWeight: 600,
//                       margin: "0 0 2px",
//                     }}
//                   >
//                     {s.title}
//                   </p>
//                   <p
//                     style={{
//                       color: "var(--text-muted)",
//                       fontSize: 11,
//                       margin: "0 0 6px",
//                       lineHeight: 1.4,
//                       overflow: "hidden",
//                       textOverflow: "ellipsis",
//                       whiteSpace: "nowrap",
//                     }}
//                   >
//                     {s.reason}
//                   </p>
//                   <span
//                     style={{
//                       fontSize: 10,
//                       padding: "2px 7px",
//                       borderRadius: 5,
//                       background: "var(--border)",
//                       color: "var(--text-secondary)",
//                     }}
//                   >
//                     {s.category}
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => dismissSuggestion(s.id)}
//                   style={{
//                     background: "none",
//                     border: "none",
//                     color: "var(--text-hint)",
//                     cursor: "pointer",
//                     fontSize: 14,
//                     flexShrink: 0,
//                     padding: 0,
//                   }}
//                 >
//                   ×
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Progress + Quick actions */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "1fr 280px",
//           gap: 14,
//           marginBottom: 20,
//         }}
//       >
//         <div
//           style={{
//             background: "var(--bg-card)",
//             border: "1px solid var(--border)",
//             borderRadius: 16,
//             padding: "20px 24px",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginBottom: 16,
//             }}
//           >
//             <div>
//               <p
//                 style={{
//                   color: "var(--text-primary)",
//                   fontSize: 14,
//                   fontWeight: 600,
//                   margin: 0,
//                 }}
//               >
//                 Overall Progress
//               </p>
//               <p
//                 style={{
//                   color: "var(--text-muted)",
//                   fontSize: 12,
//                   marginTop: 2,
//                 }}
//               >
//                 {completed} of {total} tasks completed
//               </p>
//             </div>
//             <div
//               style={{
//                 width: 52,
//                 height: 52,
//                 borderRadius: "50%",
//                 background: `conic-gradient(var(--accent) ${rate * 3.6}deg, var(--border) 0deg)`,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 flexShrink: 0,
//               }}
//             >
//               <div
//                 style={{
//                   width: 38,
//                   height: 38,
//                   borderRadius: "50%",
//                   background: "var(--bg-card)",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <span
//                   style={{
//                     color: "var(--accent-text)",
//                     fontSize: 11,
//                     fontWeight: 700,
//                   }}
//                 >
//                   {rate}%
//                 </span>
//               </div>
//             </div>
//           </div>
//           <div
//             style={{
//               height: 8,
//               borderRadius: 8,
//               background: "var(--border)",
//               overflow: "hidden",
//               display: "flex",
//               marginBottom: 12,
//             }}
//           >
//             {completed > 0 && (
//               <div
//                 style={{
//                   width: `${total > 0 ? (completed / total) * 100 : 0}%`,
//                   background:
//                     "linear-gradient(90deg,var(--accent),var(--accent-2))",
//                   transition: "width .8s",
//                 }}
//               />
//             )}
//             {inProgress > 0 && (
//               <div
//                 style={{
//                   width: `${total > 0 ? (inProgress / total) * 100 : 0}%`,
//                   background: "var(--yellow)",
//                   transition: "width .8s",
//                 }}
//               />
//             )}
//             {todo > 0 && (
//               <div
//                 style={{
//                   width: `${total > 0 ? (todo / total) * 100 : 0}%`,
//                   background: "var(--border-hover)",
//                   transition: "width .8s",
//                 }}
//               />
//             )}
//           </div>
//           <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
//             {[
//               { color: "var(--accent)", label: "Completed", count: completed },
//               {
//                 color: "var(--yellow)",
//                 label: "In Progress",
//                 count: inProgress,
//               },
//               { color: "var(--text-hint)", label: "To Do", count: todo },
//             ].map((l) => (
//               <div
//                 key={l.label}
//                 style={{ display: "flex", alignItems: "center", gap: 5 }}
//               >
//                 <div
//                   style={{
//                     width: 8,
//                     height: 8,
//                     borderRadius: "50%",
//                     background: l.color,
//                   }}
//                 />
//                 <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
//                   {l.label} ({l.count})
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div
//           style={{
//             background: "var(--bg-card)",
//             border: "1px solid var(--border)",
//             borderRadius: 16,
//             padding: "20px",
//             display: "flex",
//             flexDirection: "column",
//             gap: 10,
//           }}
//         >
//           <p
//             style={{
//               color: "var(--text-muted)",
//               fontSize: 11,
//               fontWeight: 600,
//               letterSpacing: "0.08em",
//               textTransform: "uppercase",
//               margin: 0,
//             }}
//           >
//             Quick Actions
//           </p>
//           {[
//             {
//               href: "/tasks",
//               label: "Add new task",
//               sub: "Create & track",
//               icon: "+",
//             },
//             {
//               href: "/tasks",
//               label: "View all tasks",
//               sub: `${total} total`,
//               icon: "✓",
//             },
//             {
//               href: "/analytics",
//               label: "Analytics",
//               sub: "Charts & stats",
//               icon: "↗",
//             },
//           ].map((a) => (
//             <Link
//               key={a.label}
//               href={a.href}
//               style={{
//                 textDecoration: "none",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 12,
//                 padding: "10px 12px",
//                 borderRadius: 10,
//                 background: "var(--bg-page)",
//                 border: "1px solid var(--border)",
//                 transition: "all .15s",
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.background = "var(--accent-bg)";
//                 e.currentTarget.style.borderColor = "var(--accent-border)";
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.background = "var(--bg-page)";
//                 e.currentTarget.style.borderColor = "var(--border)";
//               }}
//             >
//               <div
//                 style={{
//                   width: 32,
//                   height: 32,
//                   borderRadius: 8,
//                   flexShrink: 0,
//                   background: "var(--accent-bg)",
//                   border: "1px solid var(--accent-border)",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   color: "var(--accent-text)",
//                   fontSize: 15,
//                   fontWeight: 700,
//                 }}
//               >
//                 {a.icon}
//               </div>
//               <div>
//                 <p
//                   style={{
//                     color: "var(--text-primary)",
//                     fontSize: 12,
//                     fontWeight: 500,
//                     margin: 0,
//                   }}
//                 >
//                   {a.label}
//                 </p>
//                 <p
//                   style={{
//                     color: "var(--text-muted)",
//                     fontSize: 11,
//                     margin: 0,
//                   }}
//                 >
//                   {a.sub}
//                 </p>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>

//       {/* Recent tasks */}
//       <div
//         style={{
//           background: "var(--bg-card)",
//           border: "1px solid var(--border)",
//           borderRadius: 16,
//           padding: "20px 24px",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: 16,
//           }}
//         >
//           <div>
//             <p
//               style={{
//                 color: "var(--text-primary)",
//                 fontSize: 14,
//                 fontWeight: 600,
//                 margin: 0,
//               }}
//             >
//               Recent Tasks
//             </p>
//             <p
//               style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}
//             >
//               Your latest learning activities
//             </p>
//           </div>
//           <Link
//             href="/tasks"
//             style={{
//               textDecoration: "none",
//               color: "var(--accent-text)",
//               fontSize: 12,
//               fontWeight: 500,
//               padding: "6px 12px",
//               borderRadius: 8,
//               border: "1px solid var(--accent-border)",
//               background: "var(--accent-bg)",
//             }}
//           >
//             View all →
//           </Link>
//         </div>
//         <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//           {tasks.slice(0, 6).map((task) => {
//             const sc: Record<
//               string,
//               { color: string; bg: string; label: string }
//             > = {
//               completed: {
//                 color: "var(--green)",
//                 bg: "var(--green-bg)",
//                 label: "Done",
//               },
//               in_progress: {
//                 color: "var(--yellow)",
//                 bg: "var(--yellow-bg)",
//                 label: "In Progress",
//               },
//               todo: {
//                 color: "var(--text-secondary)",
//                 bg: "var(--border)",
//                 label: "To Do",
//               },
//             };
//             const pc: Record<string, string> = {
//               high: "var(--red)",
//               medium: "var(--yellow)",
//               low: "var(--green)",
//             };
//             const s = sc[task.status];
//             return (
//               <div
//                 key={task.id}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 12,
//                   padding: "11px 14px",
//                   borderRadius: 12,
//                   background: "var(--bg-page)",
//                   border: `1px solid ${task.priority === "high" && task.status !== "completed" ? "rgba(248,113,113,0.15)" : "var(--border)"}`,
//                   transition: "all .15s",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.background = "var(--bg-card-hover)";
//                   e.currentTarget.style.borderColor = "var(--border-hover)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.background = "var(--bg-page)";
//                   e.currentTarget.style.borderColor =
//                     task.priority === "high" && task.status !== "completed"
//                       ? "rgba(248,113,113,0.15)"
//                       : "var(--border)";
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 8,
//                     height: 8,
//                     borderRadius: "50%",
//                     background: s.color,
//                     flexShrink: 0,
//                   }}
//                 />
//                 <span
//                   style={{
//                     flex: 1,
//                     fontSize: 13,
//                     minWidth: 0,
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                     whiteSpace: "nowrap",
//                     color:
//                       task.status === "completed"
//                         ? "var(--text-hint)"
//                         : "var(--text-primary)",
//                     textDecoration:
//                       task.status === "completed" ? "line-through" : "none",
//                   }}
//                 >
//                   {task.title}
//                 </span>
//                 {task.categories && (
//                   <span
//                     style={{
//                       fontSize: 11,
//                       padding: "2px 8px",
//                       borderRadius: 6,
//                       background: "var(--border)",
//                       color: "var(--text-secondary)",
//                       flexShrink: 0,
//                     }}
//                   >
//                     {(task.categories as any).name}
//                   </span>
//                 )}
//                 <span
//                   style={{
//                     fontSize: 11,
//                     fontWeight: 500,
//                     color: pc[task.priority],
//                     flexShrink: 0,
//                   }}
//                 >
//                   {task.priority}
//                 </span>
//                 <span
//                   style={{
//                     fontSize: 10,
//                     padding: "2px 8px",
//                     borderRadius: 6,
//                     background: s.bg,
//                     color: s.color,
//                     fontWeight: 600,
//                     flexShrink: 0,
//                   }}
//                 >
//                   {s.label}
//                 </span>
//               </div>
//             );
//           })}
//           {tasks.length === 0 && (
//             <div style={{ textAlign: "center", padding: "32px 0" }}>
//               <p style={{ fontSize: 32, margin: "0 0 8px" }}>📝</p>
//               <p
//                 style={{
//                   color: "var(--text-muted)",
//                   fontSize: 13,
//                   margin: "0 0 12px",
//                 }}
//               >
//                 No tasks yet!
//               </p>
//               <Link
//                 href="/tasks"
//                 style={{
//                   textDecoration: "none",
//                   color: "var(--accent-text)",
//                   fontSize: 13,
//                   fontWeight: 500,
//                   padding: "8px 16px",
//                   borderRadius: 8,
//                   border: "1px solid var(--accent-border)",
//                   background: "var(--accent-bg)",
//                 }}
//               >
//                 Add your first task →
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//     </div>
//   );
// }

'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth }       from '@/src/hooks/useAuth'
import { useTasks }      from '@/src/hooks/useTask'
import { useAutomation } from '@/src/hooks/useAutomation'
import PomodoroTimer     from '@/components/PomodoroTimer'

const F = "'DM Sans','Segoe UI',sans-serif"

export default function DashboardPage() {
  const { userId, userName, loading: authLoading } = useAuth()
  const { tasks, loading: tasksLoading }           = useTasks(userId)
  const { suggestions, streak, autoFixed, dismissSuggestion } = useAutomation(userId, tasks)
  const [showAutoMsg, setShowAutoMsg] = useState(true)

  const stats = useMemo(() => {
    const total      = tasks.length
    const completed  = tasks.filter(t => t.status === 'completed').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const todo       = tasks.filter(t => t.status === 'todo').length
    const rate       = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, inProgress, todo, rate }
  }, [tasks])

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  if (authLoading || tasksLoading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100%', background:'var(--bg-page)', fontFamily:F }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:34, height:34, border:'3px solid var(--accent-bg)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 10px' }} />
        <p style={{ color:'var(--text-muted)', fontSize:13 }}>Loading...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const { total, completed, inProgress, todo, rate } = stats

  return (
    <div className="page-wrap" style={{ minHeight:'100%', background:'var(--bg-page)', padding:'20px 24px', fontFamily:F }}>
      <PomodoroTimer />

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, gap:12, flexWrap:'wrap' }}>
        <div>
          <p style={{ color:'var(--text-muted)', fontSize:12, margin:'0 0 3px' }}>{greeting},</p>
          <h1 style={{ color:'var(--text-primary)', fontSize:22, fontWeight:700, margin:0 }}>
            {userName} 👋
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:12, marginTop:3 }}>
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
          </p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          {/* Streak */}
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:10, background: streak.current > 0 ? 'rgba(249,115,22,0.1)' : 'var(--bg-card)', border:`1px solid ${streak.current > 0 ? 'rgba(249,115,22,0.25)' : 'var(--border)'}` }}>
            <span style={{ fontSize:15 }}>{streak.current > 0 ? '🔥' : '💤'}</span>
            <div>
              <p style={{ color: streak.current > 0 ? '#f97316' : 'var(--text-muted)', fontSize:12, fontWeight:700, margin:0, lineHeight:1 }}>{streak.current}d</p>
              <p style={{ color:'var(--text-hint)', fontSize:10, margin:0 }}>Best:{streak.longest}d</p>
            </div>
          </div>
          <Link href="/tasks" style={{ textDecoration:'none', padding:'8px 14px', borderRadius:10, background:'linear-gradient(135deg,var(--accent),var(--accent-2))', color:'#fff', fontSize:13, fontWeight:600, boxShadow:'0 4px 16px rgba(124,58,237,0.3)', whiteSpace:'nowrap' }}>
            + Add Task
          </Link>
        </div>
      </div>

      {/* Auto-prioritize notice */}
      {autoFixed > 0 && showAutoMsg && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:12, marginBottom:14, background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span>⚡</span>
            <p style={{ color:'var(--yellow)', fontSize:12, fontWeight:600, margin:0 }}>
              Auto-prioritized {autoFixed} overdue task{autoFixed > 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setShowAutoMsg(false)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:16 }}>×</button>
        </div>
      )}

      {/* Stat cards — 2x2 on mobile, 4x1 on desktop */}
      <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        {[
          { label:'Total',      value:total,      icon:'📋', color:'#818cf8', border:'rgba(129,140,248,0.2)', sub:'all time'  },
          { label:'Completed',  value:completed,  icon:'✅', color:'var(--green)',  border:'rgba(52,211,153,0.2)',  sub:`${rate}%`  },
          { label:'Active',     value:inProgress, icon:'⚡', color:'var(--yellow)', border:'rgba(251,191,36,0.2)',  sub:'in progress'},
          { label:'To Do',      value:todo,       icon:'📌', color:'var(--blue)',   border:'rgba(56,189,248,0.2)',  sub:'pending'   },
        ].map((s,i) => (
          <div key={i}
            style={{ background:'var(--bg-card)', border:`1px solid ${s.border}`, borderRadius:14, padding:'14px 16px', cursor:'default', transition:'transform .2s' }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <p style={{ color:'var(--text-secondary)', fontSize:11, margin:0 }}>{s.label}</p>
              <span style={{ fontSize:16 }}>{s.icon}</span>
            </div>
            <p style={{ color:s.color, fontSize:24, fontWeight:700, margin:'0 0 3px', lineHeight:1 }}>{s.value}</p>
            <p style={{ color:'var(--text-muted)', fontSize:10, margin:0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Smart suggestions */}
      {suggestions.length > 0 && (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'16px', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span>🤖</span>
            <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:600, margin:0 }}>Smart Suggestions</p>
            <span style={{ fontSize:11, padding:'2px 8px', borderRadius:6, background:'var(--accent-bg)', color:'var(--accent-text)' }}>AI</span>
          </div>
          <div className="suggestions-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
            {suggestions.map(s => (
              <div key={s.id} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'10px 12px', borderRadius:10, background:'var(--bg-page)', border:`1px solid ${s.priority==='high'?'rgba(248,113,113,0.2)':'var(--border)'}` }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:s.priority==='high'?'var(--red)':'var(--yellow)', flexShrink:0, marginTop:4 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:'var(--text-primary)', fontSize:12, fontWeight:600, margin:'0 0 2px' }}>{s.title}</p>
                  <p style={{ color:'var(--text-muted)', fontSize:11, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.reason}</p>
                </div>
                <button onClick={() => dismissSuggestion(s.id)} style={{ background:'none', border:'none', color:'var(--text-hint)', cursor:'pointer', fontSize:14, flexShrink:0 }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress + Quick actions */}
      <div className="two-col-grid" style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:14, marginBottom:16 }}>

        {/* Progress */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div>
              <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:600, margin:0 }}>Overall Progress</p>
              <p style={{ color:'var(--text-muted)', fontSize:11, marginTop:2 }}>{completed} of {total} done</p>
            </div>
            <div style={{ width:48, height:48, borderRadius:'50%', background:`conic-gradient(var(--accent) ${rate*3.6}deg, var(--border) 0deg)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <div style={{ width:35, height:35, borderRadius:'50%', background:'var(--bg-card)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ color:'var(--accent-text)', fontSize:10, fontWeight:700 }}>{rate}%</span>
              </div>
            </div>
          </div>
          <div style={{ height:7, borderRadius:7, background:'var(--border)', overflow:'hidden', display:'flex', marginBottom:10 }}>
            {completed>0  && <div style={{ width:`${total>0?(completed/total)*100:0}%`,  background:'linear-gradient(90deg,var(--accent),var(--accent-2))', transition:'width .8s' }} />}
            {inProgress>0 && <div style={{ width:`${total>0?(inProgress/total)*100:0}%`, background:'var(--yellow)', transition:'width .8s' }} />}
            {todo>0       && <div style={{ width:`${total>0?(todo/total)*100:0}%`,        background:'var(--border-hover)', transition:'width .8s' }} />}
          </div>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
            {[
              { color:'var(--accent)',    label:'Done',       count:completed  },
              { color:'var(--yellow)',    label:'In Progress',count:inProgress },
              { color:'var(--text-hint)', label:'To Do',      count:todo       },
            ].map(l => (
              <div key={l.label} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:l.color }} />
                <span style={{ color:'var(--text-muted)', fontSize:11 }}>{l.label} ({l.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'16px', display:'flex', flexDirection:'column', gap:8 }}>
          <p style={{ color:'var(--text-muted)', fontSize:10, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', margin:0 }}>Quick Actions</p>
          {[
            { href:'/tasks',     label:'Add new task',  sub:'Create & track', icon:'+' },
            { href:'/tasks',     label:'All tasks',     sub:`${total} total`,  icon:'✓' },
            { href:'/analytics', label:'Analytics',     sub:'Charts & stats',  icon:'↗' },
          ].map(a => (
            <Link key={a.label} href={a.href} style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:9, background:'var(--bg-page)', border:'1px solid var(--border)', transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--accent-bg)'; e.currentTarget.style.borderColor='var(--accent-border)' }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--bg-page)'; e.currentTarget.style.borderColor='var(--border)' }}
            >
              <div style={{ width:28, height:28, borderRadius:7, flexShrink:0, background:'var(--accent-bg)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent-text)', fontSize:14, fontWeight:700 }}>{a.icon}</div>
              <div>
                <p style={{ color:'var(--text-primary)', fontSize:12, fontWeight:500, margin:0 }}>{a.label}</p>
                <p style={{ color:'var(--text-muted)', fontSize:10, margin:0 }}>{a.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent tasks */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:600, margin:0 }}>Recent Tasks</p>
          <Link href="/tasks" style={{ textDecoration:'none', color:'var(--accent-text)', fontSize:12, fontWeight:500, padding:'5px 10px', borderRadius:7, border:'1px solid var(--accent-border)', background:'var(--accent-bg)' }}>View all →</Link>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {tasks.slice(0,5).map(task => {
            const sc: Record<string,{color:string;bg:string;label:string}> = {
              completed:   { color:'var(--green)',          bg:'var(--green-bg)',  label:'Done'  },
              in_progress: { color:'var(--yellow)',         bg:'var(--yellow-bg)', label:'Active'},
              todo:        { color:'var(--text-secondary)', bg:'var(--border)',    label:'Todo'  },
            }
            const pc: Record<string,string> = { high:'var(--red)', medium:'var(--yellow)', low:'var(--green)' }
            const s = sc[task.status]
            return (
              <div key={task.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:'var(--bg-page)', border:'1px solid var(--border)', transition:'all .15s', overflow:'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--bg-card-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.background='var(--bg-page)' }}
              >
                <div style={{ width:7, height:7, borderRadius:'50%', background:s.color, flexShrink:0 }} />
                <span style={{ flex:1, fontSize:13, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:task.status==='completed'?'var(--text-hint)':'var(--text-primary)', textDecoration:task.status==='completed'?'line-through':'none' }}>
                  {task.title}
                </span>
                {task.categories && (
                  <span style={{ fontSize:10, padding:'2px 7px', borderRadius:5, background:'var(--border)', color:'var(--text-secondary)', flexShrink:0, display:'var(--cat-display,inline-block)' }}>
                    {(task.categories as any).name}
                  </span>
                )}
                <span style={{ fontSize:10, fontWeight:500, color:pc[task.priority], flexShrink:0 }}>{task.priority}</span>
                <span style={{ fontSize:10, padding:'2px 7px', borderRadius:5, background:s.bg, color:s.color, fontWeight:600, flexShrink:0 }}>{s.label}</span>
              </div>
            )
          })}
          {tasks.length===0 && (
            <div style={{ textAlign:'center', padding:'24px 0' }}>
              <p style={{ fontSize:28, margin:'0 0 8px' }}>📝</p>
              <Link href="/tasks" style={{ textDecoration:'none', color:'var(--accent-text)', fontSize:12, padding:'7px 14px', borderRadius:8, border:'1px solid var(--accent-border)', background:'var(--accent-bg)' }}>Add first task →</Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){
          .stats-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}
          .two-col-grid{grid-template-columns:1fr!important}
          .suggestions-grid{grid-template-columns:1fr!important}
          .page-wrap{padding:14px!important}
        }
        @media(max-width:400px){
          .stats-grid{gap:8px!important}
        }
      `}</style>
    </div>
  )
}
