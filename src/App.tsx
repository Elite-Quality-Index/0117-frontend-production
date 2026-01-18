import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AuthProvider } from "@/hooks/use-auth"
import { ChatProvider } from "@/hooks/use-chat"
import { DataVisualsProvider } from "@/hooks/use-data-visuals"
import { Home } from "@/pages/Home"
import { CloudChat } from "@/pages/CloudChat"
import { AboutIndex } from "@/pages/AboutIndex"
import { AboutFoundation } from "@/pages/AboutFoundation"
import { Login } from "@/pages/Login"
import { Signup } from "@/pages/Signup"
import { DataVisuals } from "@/pages/DataVisuals"

function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overscroll-none">
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 bg-background">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          <div className="absolute -bottom-4 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent pointer-events-none" />
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutIndex />} />
          <Route path="/about/index" element={<AboutIndex />} />
          <Route path="/about/foundation" element={<AboutFoundation />} />
          <Route path="/cloud-chat" element={<CloudChat />} />
          <Route path="/data-visuals" element={<DataVisuals />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <DataVisualsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/*" element={<MainLayout />} />
            </Routes>
          </BrowserRouter>
        </DataVisualsProvider>
      </ChatProvider>
    </AuthProvider>
  )
}

export default App
