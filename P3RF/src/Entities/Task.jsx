import React from "react";

export default function Task({ task = {} }) {
  const {
    title = "Untitled Task",
    description = "",
    status = "todo",
    is_complete = false,
    color = "gray",
    tags = [],
    due_date = null,
    priority = "medium",
    estimated_pomodoros = 1,
    exp_value = 25,
    checklist_items = [],
    estimated_time = null,
    completed_at = null,
    image_url = null,
    completed_pomodoros = 0,
    exp_awarded = false,
    slain_at = null,
    master_card_id = null,
    linked_checklist_item_id = null
  } = task;

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  };

  const checklistTotal = (checklist_items || []).length;
  const checklistCompleted = (checklist_items || []).filter(i => i.completed).length;
  const checklistProgress = checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800"
  };

  const statusColors = {
    master: "bg-amber-100 text-amber-800",
    backlog: "bg-slate-100 text-slate-800",
    todo: "bg-slate-50 text-slate-800",
    in_progress: "bg-blue-50 text-blue-800",
    done: "bg-green-50 text-green-800",
    slain: "bg-red-50 text-red-800"
  };

  return (
    <article className={`w-full rounded-lg border p-4 shadow-sm bg-white dark:bg-slate-800`}>
      <header className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold text-slate-900 dark:text-slate-100 truncate`}>{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{description}</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status] || "bg-slate-100 text-slate-800"}`}>
            {status.replace("_", " ")}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${is_complete ? "bg-green-100 text-green-800" : "bg-slate-50 text-slate-700"}`}>
            {is_complete ? "Complete" : "Open"}
          </span>
        </div>
      </header>

      <div className="mt-3 flex gap-3">
        {image_url ? (
          <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
            <img src={image_url} alt={title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-md bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">
            📝
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[priority] || priorityColors.medium}`}>
                {priority}
              </span>

              {(tags || []).slice(0, 6).map((t, i) => (
                <span key={i} className="text-xs bg-purple-50 text-purple-800 px-2 py-0.5 rounded-full">{t}</span>
              ))}

              {master_card_id && (
                <span className="text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full">Master: {master_card_id}</span>
              )}
            </div>

            <div className="text-right text-xs text-slate-500">
              <div>Due: {formatDate(due_date)}</div>
              {completed_at && <div className="text-green-600">Completed: {formatDate(completed_at)}</div>}
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 grid grid-cols-2 gap-2">
            <div>
              <div className="text-xxs text-slate-500">XP</div>
              <div className="font-medium">{exp_value} {exp_awarded ? " (awarded)" : ""}</div>
            </div>

            <div>
              <div className="text-xxs text-slate-500">Pomodoros</div>
              <div className="font-medium">{completed_pomodoros} / {estimated_pomodoros}</div>
            </div>

            <div>
              <div className="text-xxs text-slate-500">Est. Time</div>
              <div className="font-medium">{estimated_time != null ? `${estimated_time}m` : "—"}</div>
            </div>

            <div>
              <div className="text-xxs text-slate-500">Linked checklist</div>
              <div className="font-medium">{linked_checklist_item_id || "—"}</div>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div>Checklist</div>
              <div>{checklistCompleted}/{checklistTotal} ({checklistProgress}%)</div>
            </div>

            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-green-400 rounded-full transition-all"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>

            {checklistTotal > 0 && (
              <ul className="mt-2 text-xs space-y-1 max-h-28 overflow-y-auto">
                {checklist_items.map((it, idx) => (
                  <li key={it.id ?? idx} className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-sm inline-flex items-center justify-center ${it.completed ? "bg-green-400 text-white" : "bg-slate-200 text-slate-600"}`}>
                      {it.completed ? "✓" : "•"}
                    </span>
                    <span className={it.completed ? "line-through text-slate-500 text-sm" : "text-sm text-slate-700 dark:text-slate-200"}>{it.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}