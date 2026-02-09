import classNames from "classnames";

type DetailProps = {
  type?: "info" | "danger" | "success" | "warning";
  title?: string;
  className?: string;
} & React.PropsWithChildren;

const Detail: React.FunctionComponent<DetailProps> = ({
  type = "info",
  children,
  className,
  title,
}) => {
  const alertClasses = classNames(
    "p-4 text-sm rounded-md",
    {
      "bg-blue-100 text-blue-800": type === "info",
      "bg-red-100 text-red-800": type === "danger",
      "bg-green-100 text-green-800": type === "success",
      "bg-yellow-100 text-yellow-800": type === "warning",
    },
    className
  );

  return (
    <div role="alert" className={alertClasses}>
      {title && <span className="font-bold">{title}:</span>} {children}
    </div>
  );
};

export default Detail;
