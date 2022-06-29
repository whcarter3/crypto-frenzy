import classNames from "classnames";

interface ButtonProps {
  color: string;
  margin?: number;
  onClick: () => void;
  xPadding: number;
  yPadding: number;
  children?: string;
  id?: string;
}

export const Button = ({
  color,
  margin,
  onClick,
  xPadding, 
  yPadding,
  children, 
  id
}): ButtonProps => {

  const btnClasses = classNames(
    "rounded-full",
    `px-${xPadding} py-${yPadding}`,
    margin ? `mt-${margin}` : "",
    color
  )

  return (
    <button className={btnClasses} onClick={onClick} id={id}>{children}</button>
  )
}

export default Button