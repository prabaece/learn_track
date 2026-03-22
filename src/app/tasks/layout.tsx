// // app/tasks/layout.tsx
// import Sidebar from '@/components/Sidebar'
// import Header from '@/components/Header'

// export default function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
//       <Sidebar />
//       <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
//         <Header />
//         <main style={{ flex:1, overflowY:'auto' }}>
//           {children}
//         </main>
//       </div>
//     </div>
//   )
// }

import Sidebar    from '@/components/Sidebar'
import Header     from '@/components/Header'
import MobileNav  from '@/components/MobileNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar — desktop only (hidden on mobile via CSS) */}
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Header />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only (shown via CSS) */}
      <MobileNav />
    </div>
  )
}

