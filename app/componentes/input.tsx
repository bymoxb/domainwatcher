import classNames from "classnames";

type InputProps = {}
  & React.HTMLAttributes<HTMLInputElement>
  & React.InputHTMLAttributes<HTMLInputElement>

const Input: React.FunctionComponent<InputProps> = ({
  className,
  ...props
}) => {
  return (
    <input
      {...props}
      className={classNames("border rounded px-2 py-1", className)}
    />
  )
}

export default Input;
