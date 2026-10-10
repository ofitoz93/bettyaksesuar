import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function HesabimLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header variant="solid" />
      <main className="px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
      <Footer />
    </>
  );
}
