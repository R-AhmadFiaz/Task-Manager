"use client";

import { useActionState, useCallback, useEffect, useRef } from "react";
import { createTask, type TaskActionResult } from "@/features/tasks/actions";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: TaskActionResult = { error: null };

export function TaskInput() {
  const [state, formAction] = useActionState(createTask, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const submittedTitleRef = useRef<string | null>(null);

  useEffect(() => {
    // Only clear the field if it still holds exactly what was just
    // submitted. Realtime can make the previous task appear (and this
    // effect fire) fast enough that a user already typing the next title
    // would otherwise have it silently wiped out from under them.
    const input = formRef.current?.elements.namedItem("title");
    if (!state.error && input instanceof HTMLInputElement && input.value === submittedTitleRef.current) {
      formRef.current?.reset();
    }
  }, [state]);

  // A new inline function on every render (this component re-renders often
  // now, since a realtime event anywhere updates the shared task list) is
  // not safe to pass directly as a form's `action` — stabilize it so the
  // form's action identity doesn't change out from under an in-flight
  // submission.
  const handleSubmit = useCallback(
    (formData: FormData) => {
      submittedTitleRef.current = String(formData.get("title") ?? "");
      formAction(formData);
    },
    [formAction],
  );

  return (
    <div className="space-y-2">
      <form ref={formRef} action={handleSubmit} className="flex gap-2">
        <input
          type="text"
          name="title"
          placeholder="Add a new task..."
          required
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <SubmitButton
          pendingLabel="Adding..."
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Add
        </SubmitButton>
      </form>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
