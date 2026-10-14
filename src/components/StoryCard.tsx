import Link from "next/link";

interface Story {
  id: string;
  title: string;
  content: string;
  image: string | null;
}

export default function StoryCard({ story }: { story: Story }) {
  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/5">
      <Link href={`/stories/${story.id}`} className="flex h-full flex-col" aria-label={`Vakio: ${story.title}`}>
        {story.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={story.image} alt={story.title} className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
        ) : (
          <div className="flex h-48 items-center justify-center bg-gradient-to-br from-indigo-100 via-violet-50 to-sky-100 text-indigo-400">
            <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none" aria-hidden="true"><path d="M12 13.5A5.5 5.5 0 0 1 17.5 8H52v42H17.5A5.5 5.5 0 0 0 12 55.5v-42Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="M12 14v41.5A5.5 5.5 0 0 1 17.5 50H52M23 19h19M23 27h19M23 35h13" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
          </div>
        )}
        <div className="flex flex-1 flex-col p-5">
          <h2 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-slate-800 group-hover:text-indigo-700">{story.title}</h2>
          <p className="line-clamp-3 text-sm leading-6 text-slate-500">{story.content}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">Vakio ny tantara <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span></span>
        </div>
      </Link>
    </article>
  );
}
