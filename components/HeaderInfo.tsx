const HeaderInfo = ({
  label,
  value,
  testId,
}: {
  label: string
  value: string
  testId: string
}) => (
  <p data-cy={testId}>
    <span className="font-bold">{label}</span> {value}
  </p>
)

export default HeaderInfo
