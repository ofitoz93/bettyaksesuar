import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getContentPage } from "@/lib/data/contentPages";

export const revalidate = 300;

interface ContentPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ContentPageProps) {
  const { slug } = await params;
  const page = await getContentPage(slug);
  return { title: page ? `${page.title} | Betty Aksesuar` : "Sayfa Bulunamadı" };
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { slug } = await params;
  const page = await getContentPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <>
      <Header variant="solid" />
      <main className="px-8 pt-32 pb-24">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display mb-8 text-[34px]">{page.title}</h1>
          <div className="flex flex-col gap-4 text-sm leading-relaxed whitespace-pre-line text-ink-soft">
            {page.body}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
