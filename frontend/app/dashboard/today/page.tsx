// frontend/app/dashboard/today/page.tsx
// @ts-nocheck

"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import "./style.css";

type Task = {
  id: string;
  title: string;
  related_id: string;
  due_at: string;
  status: string;
};

const fetchTodayTasks = async (): Promise<Task[]> => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from<Task>("tasks")
    .select("*")
    .gte("due_at", start.toISOString())
    .lte("due_at", end.toISOString())
    .order("due_at", { ascending: true });

  if (error) throw error;
  return data || [];
};

export default function TodayTasks() {
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["todayTasks"],
    queryFn: fetchTodayTasks,
  });

  const mutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "completed" })
        .eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries(["todayTasks"]),
  });

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks</div>;

  return (
    <div className="tasks-wrapper">
      <div className="tasks-container">
        <h1 className="tasks-title">Tasks Due Today</h1>

        <table className="tasks-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Application ID</th>
              <th>Due At</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {data?.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td style={{ fontFamily: "monospace" }}>{t.related_id}</td>
                <td>{new Date(t.due_at).toLocaleString()}</td>

                <td>
                  <span
                    className={`status-badge ${
                      t.status === "completed"
                        ? "status-completed"
                        : "status-pending"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>

                <td>
                  <button
                    onClick={() => mutation.mutate(t.id)}
                    disabled={t.status === "completed"}
                    className={`complete-btn ${
                      t.status === "completed"
                        ? "complete-btn-disabled"
                        : "complete-btn-active"
                    }`}
                  >
                    Mark Complete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.length === 0 && <p className="no-tasks">No tasks due today.</p>}
      </div>
    </div>
  );
}
