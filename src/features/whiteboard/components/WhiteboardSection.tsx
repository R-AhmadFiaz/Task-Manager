"use client";

import { useState } from "react";
import { Whiteboard } from "@/features/whiteboard/components/Whiteboard";

export function WhiteboardSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Whiteboard</h2>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          className="cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {isOpen ? "Hide whiteboard" : "Open whiteboard"}
        </button>
      </div>
      {isOpen && <Whiteboard />}
    </section>
  );
}
