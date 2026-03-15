// Auth pages don't have the sidebar/main layout
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
