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
    <div className="flex flex-col gap-2 rounded-small bg-default-100 px-3 py-2 shadow-md w-full">
      {title || actions ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            {titleIcon && <span>{titleIcon}</span>}
            {title && <span>{title}</span>}
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      ) : null}
      {children}
    </div>
  );
};
