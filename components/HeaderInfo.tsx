const HeaderInfo = ({
  label,
  value,
  testId,
  className,
}: {
  label: string
  value: string
  testId: string
  className?: string
}) => (
  <p data-cy={testId} className={`${className && className}`}>
    <span className={`font-bold`}>{label}</span> {value}
  </p>
)

export default HeaderInfo
