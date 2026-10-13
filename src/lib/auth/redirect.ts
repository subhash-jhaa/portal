export function safeReturnTo(value: string | null) {
  if (
    !value ||
    !/^\/(dashboard|profile|payslip|projects|documents|directory(?:\/[a-zA-Z0-9-]+)?)(\?|$)/.test(
      value,
    ) ||
    value.includes("\\")
  )
    return "/dashboard";
  return value;
}
