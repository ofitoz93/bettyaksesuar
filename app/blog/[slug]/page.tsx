import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getBlogPostBySlug } from "@/lib/data/blog";

export const revalidate = 300;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Yazı Bulunamadı" };
  }

  return {
    title: post.metaTitle || `${post.title} | Betty Aksesuar`,
    description: post.metaDescription || post.excerpt || undefined,
    keywords: post.metaKeywords || undefined,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Header variant="solid" />
      <main className="px-8 pt-32 pb-24">
        <article className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-[34px]">{post.title}</h1>
            <div className="mt-2 text-xs text-ink-faint">
              {post.author && <>{post.author} · </>}
              {new Date(post.createdAt).toLocaleDateString("tr-TR")}
            </div>
          </div>

          {post.imageUrl && (
            <div className="relative mb-8 aspect-16/9 overflow-hidden">
              <Image src={post.imageUrl} alt="" fill sizes="672px" className="object-cover" />
            </div>
          )}

          <div
            className="text-sm leading-relaxed text-ink-soft [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
