import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function HesabimLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header variant="solid" />
      <main className="px-8 pt-32 pb-24">
        <div className="mx-auto max-w-2xl">{children}</div>
      </main>
      <Footer />
    </>
  );
}
