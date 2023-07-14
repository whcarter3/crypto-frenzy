const HeaderInfo = ({ label, value }: { label: string; value: string }) => (
  <p>
    <span className="font-bold">{label}:</span> {value}
  </p>
)

export default HeaderInfo
