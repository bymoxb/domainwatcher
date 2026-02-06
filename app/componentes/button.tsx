import classNames from "classnames";

type ButtonProps = {
  loading?: boolean;
  label: string;
}
  & React.ButtonHTMLAttributes<HTMLButtonElement>
  & React.HTMLAttributes<HTMLButtonElement>;

const Button: React.FunctionComponent<ButtonProps> = ({
  loading,
  className,
  label,
  ...props
}) => {
  return (
    <button
      {...props}
      className={classNames("border px-4 py-1 rounded-lg", {
        "cursor-pointer": !loading,
        "cursor-progress": loading != undefined && loading,
      })}
    >
      {label}
    </button>
  )
};

export default Button;
