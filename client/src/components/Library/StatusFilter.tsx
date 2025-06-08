"use client";

import type React from "react";
import { useLibraryStore } from "@/store/libraryStore";
import { Badge } from "@/components/ui/badge";

const STATUS_OPTIONS = [
  { value: "reading", label: "Reading" },
  { value: "read", label: "Read" },
  { value: "later", label: "Later" },
  { value: "none", label: "No Status" },
];

export default function StatusFilter() {
  const selectedStatuses = useLibraryStore((state) => state.selectedStatuses);
  const setSelectedStatuses = useLibraryStore((state) => state.setSelectedStatuses);

  const handleStatusClick = (statusValue: string) => {
    const newStatuses = new Set(selectedStatuses);
    if (newStatuses.has(statusValue)) {
      newStatuses.delete(statusValue);
    } else {
      newStatuses.add(statusValue);
    }
    setSelectedStatuses(newStatuses);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {STATUS_OPTIONS.map((statusOption) => (
        <Badge
          key={statusOption.value}
          variant={
            selectedStatuses.has(statusOption.value) ? "default" : "outline"
          }
          className={`px-3 py-1 cursor-pointer transition-all ${
            selectedStatuses.has(statusOption.value)
              ? "bg-purple text-white hover:bg-dark-purple"
              : "hover:border-purple/50 hover:text-purple"
          }`}
          onClick={() => handleStatusClick(statusOption.value)}
        >
          {statusOption.label}
        </Badge>
      ))}
    </div>
  );
}
