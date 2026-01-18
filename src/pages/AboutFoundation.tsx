import { Link } from "react-router-dom"
import { BotMessageSquare } from "lucide-react"
import { ABOUT_FOUNDATION_CONTENT } from "@/constants/about-content"

export function AboutFoundation() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-8 mx-auto max-w-[832px]">
      <h1 className="font-title text-6xl text-primary">{ABOUT_FOUNDATION_CONTENT.title}</h1>
      <p className="font-serif text-lg leading-relaxed">
        {ABOUT_FOUNDATION_CONTENT.intro}
      </p>
      {ABOUT_FOUNDATION_CONTENT.sections.map((section, index) => (
        <div key={index} className="flex flex-col gap-3">
          {section.title && (
            <h2 className="font-title text-3xl">{section.title}</h2>
          )}
          <p className="font-serif text-lg leading-relaxed">
            {section.content}
          </p>
        </div>
      ))}
      <Link
        to="/cloud-chat"
        className="group flex items-center gap-6 p-8 mt-4 rounded-xl border bg-card hover:bg-sidebar-accent transition-colors"
      >
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <BotMessageSquare className="size-8 text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-title text-2xl">Click to try out the EQx Chatbot</h3>
          <p className="text-muted-foreground">Ask questions about the Elite Quality Index and get instant answers</p>
        </div>
      </Link>
    </div>
  )
}
