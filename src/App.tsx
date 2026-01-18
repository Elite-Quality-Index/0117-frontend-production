import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AuthProvider } from "@/hooks/use-auth"
import { Home } from "@/pages/Home"
import { CloudChat } from "@/pages/CloudChat"
import { AboutIndex } from "@/pages/AboutIndex"
import { AboutFoundation } from "@/pages/AboutFoundation"
import { Login } from "@/pages/Login"
import { Signup } from "@/pages/Signup"

function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutIndex />} />
          <Route path="/about/index" element={<AboutIndex />} />
          <Route path="/about/foundation" element={<AboutFoundation />} />
          <Route path="/cloud-chat" element={<CloudChat />} />
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
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
