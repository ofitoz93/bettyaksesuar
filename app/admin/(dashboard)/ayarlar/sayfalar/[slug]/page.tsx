import { notFound } from "next/navigation";
import { getContentPage } from "@/lib/data/contentPages";
import { updateContentPage } from "@/app/admin/actions";
import ContentPageForm from "./ContentPageForm";

interface EditSayfaPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditSayfaPage({ params }: EditSayfaPageProps) {
  const { slug } = await params;
  const page = await getContentPage(slug);

  if (!page) {
    notFound();
  }

  const updateWithSlug = updateContentPage.bind(null, slug);

  return (
    <div>
      <h1 className="font-display mb-2 text-[28px]">{page.title}</h1>
      <p className="mb-8 text-xs text-ink-faint">Sitede /{page.slug} adresinde görünür.</p>
      <ContentPageForm action={updateWithSlug} page={page} />
    </div>
  );
}
