'use client';

type Segment = {
  start: number;
  end: number;
  prob_ai: number;
};

type SegmentHighlightProps = {
  text: string;
  segments: Segment[];
};

const mergeSegments = (segments: Segment[], textLength: number): Segment[] => {
  const normalized = segments
    .map((seg) => ({
      start: Math.max(0, Math.min(textLength, seg.start)),
      end: Math.max(0, Math.min(textLength, seg.end)),
      prob_ai: seg.prob_ai,
    }))
    .filter((seg) => seg.end > seg.start)
    .sort((a, b) => a.start - b.start);

  const merged: Segment[] = [];
  for (const seg of normalized) {
    const last = merged[merged.length - 1];
    if (last && seg.start <= last.end) {
      last.end = Math.max(last.end, seg.end);
      last.prob_ai = Math.max(last.prob_ai, seg.prob_ai);
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
};

const SegmentHighlight = ({ text, segments }: SegmentHighlightProps) => {
  if (!segments?.length) {
    return <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">{text}</p>;
  }

  const merged = mergeSegments(segments, text.length);
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  merged.forEach((seg, idx) => {
    if (cursor < seg.start) {
      parts.push(
        <span key={`text-${idx}-${cursor}`} className="text-slate-800">
          {text.slice(cursor, seg.start)}
        </span>
      );
    }

    parts.push(
      <mark
        key={`mark-${idx}`}
        className="rounded-md bg-amber-100/80 px-1.5 py-1 text-slate-900 ring-1 ring-amber-200/80"
        title={`AI probability ${seg.prob_ai.toFixed(2)}`}
      >
        {text.slice(seg.start, seg.end)}
        <span className="ml-2 inline-flex items-center rounded-full bg-amber-200 px-2 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-300/70">
          {seg.prob_ai.toFixed(2)}
        </span>
      </mark>
    );
    cursor = seg.end;
  });

  if (cursor < text.length) {
    parts.push(
      <span key={`tail-${cursor}`} className="text-slate-800">
        {text.slice(cursor)}
      </span>
    );
  }

  return <div className="whitespace-pre-wrap leading-relaxed">{parts}</div>;
};

export default SegmentHighlight;
