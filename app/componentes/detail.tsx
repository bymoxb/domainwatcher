import classNames from "classnames";
import { useState } from "react";

type DetailProps = {
  type?: "info" | "error"
  className?: string
} & React.PropsWithChildren;

const Detail: React.FunctionComponent<DetailProps> = ({
  type = "info",
  children,
  className,
}) => {
  return (
    <div className={classNames("", className)}>{children}</div>
  )
}

export default Detail;
