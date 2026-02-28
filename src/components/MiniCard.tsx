import type { FC, ReactNode } from "react";

export type MiniCardProps = {
  title?: ReactNode;
  titleIcon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

export const MiniCard: FC<MiniCardProps> = (props) => {
  const { title, titleIcon, actions, children } = props;
  return (
    <div className="flex flex-col gap-2 rounded-small bg-default-100 px-3 py-2 shadow-md w-full min-w-0">
      {title || actions ? (
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex min-w-0 shrink-0 items-center gap-2 text-sm font-medium text-foreground">
            {titleIcon && <span>{titleIcon}</span>}
            {title && <span className="truncate">{title}</span>}
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
};
