// app/dashboard/layout.tsx

// biome-ignore assist/source/organizeImports: <explanation>
import { redirect } from "next/navigation";
import { auth } from "@/auth"; // your NextAuth export
import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Optional: protect the route on server
  if (!session) redirect("/"); // or show public layout

  // Make sure session is serializable — avoid Date/complex objects
  const safeSession = JSON.parse(JSON.stringify(session));

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      {/* header is a client component — receives only serializable props */}
      <main>{children}</main>
    </div>
  );
}
