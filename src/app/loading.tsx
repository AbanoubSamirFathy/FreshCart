import { Spinner } from "@/components/ui/spinner"

export default function loading() {
  return (
    <div className="flex items-center justify-center py-50 gap-2 text-2xl">
      <Spinner /> Loading...
    </div>
  )
}
