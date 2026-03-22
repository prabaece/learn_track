// src/app/categories/layout.tsx
import Sidebar   from '@/components/Sidebar'
import Header    from '@/components/Header'
import MobileNav from '@/components/MobileNav'

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar />
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
        <Header />
        <main style={{ flex:1, overflowY:'auto' }}>{children}</main>
      </div>
      <MobileNav />
    </div>
  )
}


// ─────────────────────────────────────────────────────────
// src/components/Sidebar.tsx — navItems-ல இதை add பண்ணு
// ─────────────────────────────────────────────────────────
// {
//   href: '/categories', label: 'Categories',
//   icon: (
//     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
//     </svg>
//   ),
// },
//
// src/components/MobileNav.tsx — navItems-ல இதை add பண்ணு
// {
//   href: '/categories', label: 'Categories',
//   icon: (active: boolean) => (
//     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active?'var(--accent)':'var(--text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
//     </svg>
//   ),
// },
