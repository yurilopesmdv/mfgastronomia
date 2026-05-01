"use client";

import { useCallback, useState } from "react";

/**
 * Hook simples para feedback visual de "salvo com sucesso".
 * Após chamar `markSaved()`, o estado `saved` fica true por `durationMs` (default 1500ms),
 * permitindo que o botão mostre "Salvo ✓" temporariamente antes de voltar ao normal.
 */
export function useSavedFeedback(durationMs = 1500) {
  const [saved, setSaved] = useState(false);

  const markSaved = useCallback(() => {
    setSaved(true);
    const id = window.setTimeout(() => setSaved(false), durationMs);
    return () => window.clearTimeout(id);
  }, [durationMs]);

  return { saved, markSaved };
}
