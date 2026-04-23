import { AppSidebar } from "./_sidebar/app-sidebar"
import { ResizableSidebar } from "./_sidebar/resizable-sidebar"

export default function Page() {
  return (
    <div className="flex h-full w-fit pointer-events-auto">
      <ResizableSidebar defaultWidth={320} minWidth={300} maxWidth={480}>
        <AppSidebar />
      </ResizableSidebar>
    </div>
  )
}