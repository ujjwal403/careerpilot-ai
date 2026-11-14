export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fffaf3] relative">
      <div className="w-full max-w-lg p-6 sm:p-10 rounded-3xl border border-[#eadcc9] bg-white shadow-xl text-[#29231e] relative z-10">
        {children}
      </div>
    </div>
  )
}
