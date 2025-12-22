'use client';

type ProblemAlertProps = {
  message?: string | null;
};

const ProblemAlert = ({ message }: ProblemAlertProps) => {
  if (!message) return null;
  return (
    <div className="mt-3 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      <span className="mt-[2px] inline-flex h-2 w-2 shrink-0 rounded-full bg-rose-400" />
      <p className="leading-relaxed">{message}</p>
    </div>
  );
};

export default ProblemAlert;
