import { CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react';
import { type WorkflowStep } from '../data/documentData';

interface WorkflowStepperProps {
  workflow: WorkflowStep[];
  type: 'incoming' | 'outgoing' | 'internal';
}

// Define standard workflow stages per document type
const WORKFLOW_STAGES: Record<string, { key: string; label: string; shortLabel: string }[]> = {
  incoming: [
    { key: 'receive', label: 'Tiếp nhận', shortLabel: 'Tiếp nhận' },
    { key: 'assign', label: 'Phân công', shortLabel: 'Phân công' },
    { key: 'process', label: 'Xử lý', shortLabel: 'Xử lý' },
    { key: 'report', label: 'Hoàn thành', shortLabel: 'Hoàn thành' },
  ],
  outgoing: [
    { key: 'draft', label: 'Soạn thảo', shortLabel: 'Soạn thảo' },
    { key: 'dept_review', label: 'TP xem xét', shortLabel: 'TP duyệt' },
    { key: 'leader_review', label: 'LĐ phê duyệt', shortLabel: 'LĐ duyệt' },
    { key: 'publish', label: 'Phát hành', shortLabel: 'Phát hành' },
  ],
  internal: [
    { key: 'draft', label: 'Soạn thảo', shortLabel: 'Soạn thảo' },
    { key: 'review', label: 'Xem xét', shortLabel: 'Xem xét' },
    { key: 'approve', label: 'Phê duyệt', shortLabel: 'Phê duyệt' },
    { key: 'distribute', label: 'Phân phối', shortLabel: 'Phân phối' },
  ],
};

function mapWorkflowToStages(workflow: WorkflowStep[], type: string) {
  const stages = WORKFLOW_STAGES[type] || WORKFLOW_STAGES.outgoing;
  const completedCount = workflow.filter((w) => w.status === 'completed').length;
  const hasRejected = workflow.some((w) => w.status === 'rejected');
  const currentIdx = workflow.findIndex((w) => w.status === 'current');

  return stages.map((stage, idx) => {
    let status: 'completed' | 'current' | 'pending' | 'rejected' = 'pending';
    let timestamp = '';
    let actorName = '';
    let comment = '';

    if (hasRejected && idx >= completedCount) {
      // Find the rejected step
      const rejectedStep = workflow.find((w) => w.status === 'rejected');
      if (rejectedStep && idx === completedCount) {
        status = 'rejected';
        timestamp = rejectedStep.timestamp;
        actorName = rejectedStep.actorName;
        comment = rejectedStep.comment;
      }
    } else if (idx < completedCount) {
      status = 'completed';
      const wfStep = workflow[idx];
      if (wfStep) {
        timestamp = wfStep.timestamp;
        actorName = wfStep.actorName;
        comment = wfStep.comment;
      }
    } else if (idx === completedCount && currentIdx >= 0) {
      status = 'current';
      const wfStep = workflow[currentIdx];
      if (wfStep) {
        actorName = wfStep.actorName;
      }
    }

    return { ...stage, status, timestamp, actorName, comment };
  });
}

export function WorkflowStepper({ workflow, type }: WorkflowStepperProps) {
  const stages = mapWorkflowToStages(workflow, type);

  return (
    <div className="flex items-center w-full overflow-x-auto py-3 px-1 gap-0">
      {stages.map((stage, idx) => (
        <div key={stage.key} className="flex items-center flex-1 min-w-0">
          {/* Step node */}
          <div className="flex flex-col items-center flex-1 min-w-0 group relative">
            {/* Icon */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all border-2 ${
                stage.status === 'completed'
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40'
                  : stage.status === 'current'
                  ? 'bg-primary/10 border-primary text-primary shadow-sm shadow-primary/20 animate-pulse'
                  : stage.status === 'rejected'
                  ? 'bg-red-500 border-red-500 text-white shadow-sm shadow-red-200 dark:shadow-red-900/40'
                  : 'bg-muted border-border text-muted-foreground'
              }`}
            >
              {stage.status === 'completed' ? (
                <CheckCircle2 className="w-4.5 h-4.5" />
              ) : stage.status === 'current' ? (
                <Clock className="w-4 h-4" />
              ) : stage.status === 'rejected' ? (
                <XCircle className="w-4.5 h-4.5" />
              ) : (
                <span className="text-[11px]">{idx + 1}</span>
              )}
            </div>

            {/* Label */}
            <p
              className={`text-[11px] mt-1.5 text-center truncate max-w-full px-1 ${
                stage.status === 'completed'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : stage.status === 'current'
                  ? 'text-primary'
                  : stage.status === 'rejected'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-muted-foreground'
              }`}
            >
              {stage.shortLabel}
            </p>

            {/* Actor name */}
            {stage.actorName && (
              <p className="text-[9px] text-muted-foreground truncate max-w-full px-1 mt-0.5">
                {stage.actorName}
              </p>
            )}

            {/* Tooltip on hover */}
            {(stage.timestamp || stage.comment) && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border border-border rounded-lg shadow-xl p-3 text-[11px] w-52 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <p className="text-foreground mb-1">{stage.label}</p>
                {stage.actorName && (
                  <p className="text-muted-foreground">Người thực hiện: {stage.actorName}</p>
                )}
                {stage.timestamp && (
                  <p className="text-muted-foreground">
                    {new Date(stage.timestamp).toLocaleString('vi-VN')}
                  </p>
                )}
                {stage.comment && (
                  <p className="text-foreground mt-1.5 border-t border-border pt-1.5 leading-relaxed">
                    "{stage.comment}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Connector */}
          {idx < stages.length - 1 && (
            <div className="flex items-center px-0.5 shrink-0 -mt-5">
              <div
                className={`h-0.5 w-6 md:w-10 lg:w-14 rounded-full ${
                  stage.status === 'completed'
                    ? 'bg-emerald-400 dark:bg-emerald-600'
                    : stage.status === 'rejected'
                    ? 'bg-red-300 dark:bg-red-700'
                    : 'bg-border'
                }`}
              />
              <ChevronRight
                className={`w-3.5 h-3.5 -ml-1 shrink-0 ${
                  stage.status === 'completed'
                    ? 'text-emerald-400 dark:text-emerald-600'
                    : stage.status === 'rejected'
                    ? 'text-red-300 dark:text-red-700'
                    : 'text-border'
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
