import classNames from "classnames";

type ButtonProps = {
  loading?: boolean;
  label: string;
  severity?: "brand" | "gray" | "success" | "danger" | "warning",
}
  & React.ButtonHTMLAttributes<HTMLButtonElement>
  & React.HTMLAttributes<HTMLButtonElement>;

const Button: React.FunctionComponent<ButtonProps> = ({
  loading,
  className,
  label,
  severity = "brand",
  ...props
}) => {
  return (
    <button
      {...props}
      className={
        classNames(
          "border px-4 py-1 rounded-lg",
          {
            "cursor-pointer": !loading,
            "cursor-progress": loading != undefined && loading,
          },
          className,
        )}
    >
      {label}
    </button>
  )
};



export default Button;
