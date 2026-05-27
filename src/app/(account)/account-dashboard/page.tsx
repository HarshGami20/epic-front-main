import { redirect } from "next/navigation";

export default function AccountDashboardPage() {
  redirect("/account-orders");
  return null;
}