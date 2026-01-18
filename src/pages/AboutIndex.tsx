import { ABOUT_INDEX_CONTENT } from "@/constants/about-content"

export function AboutIndex() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-8 mx-auto max-w-[832px]">
      <h1 className="font-title text-6xl text-primary">{ABOUT_INDEX_CONTENT.title}</h1>
      <p className="font-serif text-lg leading-relaxed">
        {ABOUT_INDEX_CONTENT.intro}
      </p>
      {ABOUT_INDEX_CONTENT.sections.map((section, index) => (
        <div key={index} className="flex flex-col gap-3">
          {section.title && (
            <h2 className="font-title text-3xl">{section.title}</h2>
          )}
          <p className="font-serif text-lg leading-relaxed whitespace-pre-line">
            {section.content}
          </p>
        </div>
      ))}
    </div>
  )
}
