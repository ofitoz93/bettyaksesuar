import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getPublishedBlogPosts } from "@/lib/data/blog";

export const metadata = {
  title: "Blog | Betty Aksesuar",
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <>
      <Header variant="solid" />
      <main className="px-8 pt-32 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
              BLOG
            </div>
            <h1 className="font-display mt-2.5 text-[34px]">Yazılarımız</h1>
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-sm text-ink-soft">Henüz yazı yayınlanmadı.</p>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                  <div className="relative mb-4 aspect-4/3 overflow-hidden bg-linear-to-br from-[#EDE3D2] to-[#D9C7A6]">
                    {post.imageUrl && (
                      <Image
                        src={post.imageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                  </div>
                  <h2 className="text-[15px] tracking-wide group-hover:text-gold-deep">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-1.5 line-clamp-2 text-xs text-ink-soft">{post.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
