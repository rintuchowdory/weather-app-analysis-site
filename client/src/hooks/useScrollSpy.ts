import { useEffect, useState } from "react";

/**
 * Tracks which section id is currently in view (with a header offset),
 * so the navigation can highlight the active section.
 */
export function useScrollSpy(ids: string[]): string {
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        // Pick the topmost intersecting entry — matches reader position best.
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // A tall band starting just below the sticky header.
        rootMargin: "-96px 0px -55% 0px",
        threshold: 0,
      }
    );

    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [ids.join("|")]);

  return activeId;
}
