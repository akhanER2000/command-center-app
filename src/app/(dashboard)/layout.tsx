import { Navbar } from "@/components/Navbar";
import { DataProvider } from "@/components/DataProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <div className="flex h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 transition-all duration-300 md:ml-64 relative overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </DataProvider>
  );
}

