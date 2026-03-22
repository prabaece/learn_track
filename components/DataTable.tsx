'use client'

// src/components/DataTable.tsx
// Reusable table with search, filter, sort, pagination
// Usage: <DataTable columns={cols} data={rows} searchFields={['title','status']} />

import { useState, useMemo } from 'react'

const F = "'DM Sans','Segoe UI',sans-serif"

export interface Column<T> {
  key:       keyof T | string
  label:     string
  width?:    string
  sortable?: boolean
  render?:   (row: T) => React.ReactNode
  filterOptions?: string[]  // for dropdown filter
}

interface DataTableProps<T> {
  columns:       Column<T>[]
  data:          T[]
  searchFields?: (keyof T)[]
  rowsPerPage?:  number
  onRowClick?:   (row: T) => void
  emptyText?:    string
  loading?:      boolean
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchFields = [],
  rowsPerPage  = 10,
  onRowClick,
  emptyText = 'No data found',
  loading   = false,
}: DataTableProps<T>) {
  const [search,     setSearch]     = useState('')
  const [sortKey,    setSortKey]    = useState<string>('')
  const [sortDir,    setSortDir]    = useState<'asc' | 'desc'>('asc')
  const [page,       setPage]       = useState(1)
  const [filters,    setFilters]    = useState<Record<string, string>>({})

  // ── Search + Filter ──────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...data]

    // Global search
    if (search && searchFields.length > 0) {
      const q = search.toLowerCase()
      rows = rows.filter(row =>
        searchFields.some(f => String(row[f] ?? '').toLowerCase().includes(q))
      )
    }

    // Column filters
    Object.entries(filters).forEach(([key, val]) => {
      if (!val) return
      rows = rows.filter(row => String(row[key] ?? '').toLowerCase() === val.toLowerCase())
    })

    // Sort
    if (sortKey) {
      rows.sort((a, b) => {
        const av = String(a[sortKey] ?? '').toLowerCase()
        const bv = String(b[sortKey] ?? '').toLowerCase()
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    }

    return rows
  }, [data, search, searchFields, filters, sortKey, sortDir])

  // ── Pagination ───────────────────────────────────────
  const totalPages  = Math.ceil(filtered.length / rowsPerPage)
  const paginated   = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const handleFilter = (key: string, val: string) => {
    setFilters(p => ({ ...p, [key]: val }))
    setPage(1)
  }

  const clearAll = () => {
    setSearch('')
    setFilters({})
    setSortKey('')
    setPage(1)
  }

  const hasActiveFilter = search || Object.values(filters).some(Boolean)

  return (
    <div style={{ fontFamily: F }}>

      {/* Search + Filters bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Global search */}
        {searchFields.length > 0 && (
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search..."
              style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: F, boxSizing: 'border-box' }}
            />
          </div>
        )}

        {/* Column filter dropdowns */}
        {columns.filter(c => c.filterOptions?.length).map(col => (
          <select
            key={String(col.key)}
            value={filters[String(col.key)] || ''}
            onChange={e => handleFilter(String(col.key), e.target.value)}
            style={{ padding: '7px 10px', background: 'var(--bg-card)', border: `1px solid ${filters[String(col.key)] ? 'var(--accent-border)' : 'var(--border)'}`, borderRadius: 9, color: filters[String(col.key)] ? 'var(--accent-text)' : 'var(--text-muted)', fontSize: 12, outline: 'none', fontFamily: F, cursor: 'pointer' }}
          >
            <option value="">All {col.label}</option>
            {col.filterOptions!.map(opt => (
              <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1).replace('_', ' ')}</option>
            ))}
          </select>
        ))}

        {/* Clear filters */}
        {hasActiveFilter && (
          <button onClick={clearAll}
            style={{ padding: '7px 12px', borderRadius: 9, border: '1px solid var(--red)', background: 'var(--red-bg)', color: 'var(--red)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap' }}
          >
            ✕ Clear
          </button>
        )}

        {/* Result count */}
        <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table wrapper — horizontal scroll on small screens */}
      <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>

          {/* Head */}
          <thead>
            <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
                  style={{
                    padding: '11px 14px', textAlign: 'left',
                    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    cursor: col.sortable ? 'pointer' : 'default',
                    whiteSpace: 'nowrap', userSelect: 'none',
                    width: col.width,
                    background: sortKey === String(col.key) ? 'var(--accent-bg)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {col.label}
                    {col.sortable && (
                      <span style={{ fontSize: 10, opacity: sortKey === String(col.key) ? 1 : 0.3 }}>
                        {sortKey === String(col.key) ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, border: '2px solid var(--accent-bg)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  <div>
                    <p style={{ fontSize: 28, margin: '0 0 8px' }}>📭</p>
                    {emptyText}
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: i % 2 === 0 ? 'var(--bg-page)' : 'var(--bg-card)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = 'var(--bg-card-hover)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? 'var(--bg-page)' : 'var(--bg-card)' }}
                >
                  {columns.map(col => (
                    <td key={String(col.key)} style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-primary)', verticalAlign: 'middle', whiteSpace: 'nowrap', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            Page {page} of {totalPages} · {filtered.length} total
          </span>
          <div style={{ display: 'flex', gap: 5 }}>
            <PagBtn label="«" onClick={() => setPage(1)}           disabled={page === 1} />
            <PagBtn label="‹" onClick={() => setPage(p => p - 1)} disabled={page === 1} />
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = page - 2 + i
              if (p < 1) p = i + 1
              if (p > totalPages) p = totalPages - (4 - i)
              if (p < 1 || p > totalPages) return null
              return (
                <PagBtn key={p} label={String(p)} onClick={() => setPage(p)} active={page === p} />
              )
            })}
            <PagBtn label="›" onClick={() => setPage(p => p + 1)} disabled={page === totalPages} />
            <PagBtn label="»" onClick={() => setPage(totalPages)} disabled={page === totalPages} />
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input::placeholder{color:var(--text-muted)}`}</style>
    </div>
  )
}

function PagBtn({ label, onClick, disabled, active }: { label: string; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        width: 30, height: 30, borderRadius: 7, border: 'none',
        background: active ? 'var(--accent)' : 'var(--bg-card)',
        color: active ? '#fff' : disabled ? 'var(--text-hint)' : 'var(--text-secondary)',
        outline: active ? 'none' : '1px solid var(--border)',
        fontSize: 12, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'DM Sans',sans-serif", transition: 'all .15s',
      }}
    >{label}</button>
  )
}
