export const employee = {
  emergencyContact: "",
  accountEnd: "4821",
  name: "Aarav Mehta",
  initials: "AM",
  id: "GR-1042",
  role: "Product Designer",
  department: "Product & Design",
  manager: "Neha Kapoor",
  location: "Bengaluru, India",
  email: "aarav.mehta@example.com",
  phone: "+91 90000 01234",
  joined: "15 January 2024",
};
export const payroll = {
  period: "September 2026",
  paid: "30 September 2026",
  account: "•••• 4821",
  earnings: [
    { label: "Basic salary", amount: 45000 },
    { label: "House rent allowance", amount: 18000 },
    { label: "Special allowance", amount: 12000 },
  ],
  deductions: [
    { label: "Provident fund", amount: 5400 },
    { label: "Professional tax", amount: 200 },
    { label: "Income tax", amount: 4400 },
  ],
};
export const gross = payroll.earnings.reduce(
  (total, item) => total + item.amount,
  0,
);
export const deductions = payroll.deductions.reduce(
  (total, item) => total + item.amount,
  0,
);
export const net = gross - deductions;
export const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
