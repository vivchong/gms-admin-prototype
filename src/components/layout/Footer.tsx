export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full bg-white border-t border-neutral-200 px-6 py-4 flex items-center justify-between text-xs text-neutral-500">
      <div className="flex items-center gap-4">
        <a href="#" className="hover:text-neutral-700">Privacy Statement</a>
        <a href="#" className="hover:text-neutral-700">Terms of Use</a>
        <a href="#" className="hover:text-neutral-700">Report Vulnerability</a>
      </div>
      <div>
        &copy; {year} Government of Singapore. Last updated 27 May 2026
      </div>
    </footer>
  )
}
