import { useState } from "react";
import { Whiteboard } from "./Whiteboard";

export function WhiteboardSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="whiteboard-section">
      <div className="whiteboard-section-header">
        <h2 className="whiteboard-section-title">Whiteboard</h2>
        <button type="button" className="secondary-button" onClick={() => setIsOpen((open) => !open)}>
          {isOpen ? "Hide whiteboard" : "Open whiteboard"}
        </button>
      </div>
      {isOpen && <Whiteboard />}
    </section>
  );
}
