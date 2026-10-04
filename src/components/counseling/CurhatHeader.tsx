import React from 'react';

export function CurhatHeader() {
  return (
    <div className="max-w-3xl space-y-2">
      <h1
        className="text-3xl sm:text-4xl lg:text-[2.65rem] font-medium text-[var(--color-ink)] leading-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Ruang Curhat Anonim
      </h1>
      <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-relaxed">
        Tumpahkan apa pun yang membuat dadamu terasa sesak tanpa takut dinilai atau dihakimi. Identitasmu 100% anonim dan terlindungi.
      </p>
    </div>
  );
}
