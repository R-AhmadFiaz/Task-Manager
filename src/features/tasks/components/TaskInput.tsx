"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTask, type TaskActionResult } from "@/features/tasks/actions";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: TaskActionResult = { error: null };

export function TaskInput() {
  const [state, formAction] = useActionState(createTask, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="space-y-2">
      <form ref={formRef} action={formAction} className="flex gap-2">
        <input
          type="text"
          name="title"
          placeholder="Add a new task..."
          required
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
        <SubmitButton
          pendingLabel="Adding..."
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Add
        </SubmitButton>
      </form>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
