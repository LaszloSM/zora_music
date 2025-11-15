import { LayoutGrid, List, ArrowUpDown } from 'lucide-react';

export type FilterType = 'all' | 'playlists' | 'albums' | 'artists' | 'favorites';
export type SortType = 'recent' | 'alphabetical';
export type ViewType = 'grid' | 'list';

interface LibraryFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  viewType: ViewType;
  onViewTypeChange: (view: ViewType) => void;
}

export function LibraryFilters({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  viewType,
  onViewTypeChange,
}: LibraryFiltersProps) {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Todo' },
    { value: 'playlists', label: 'Playlists' },
    { value: 'albums', label: 'Álbumes' },
    { value: 'artists', label: 'Artistas' },
    { value: 'favorites', label: 'Favoritos' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      {/* Filtros de tipo */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: activeFilter === filter.value ? '700' : '600',
              borderRadius: '0.5rem',
              border: activeFilter === filter.value ? 'none' : '2px solid #2C5F7D',
              background: activeFilter === filter.value ? 'linear-gradient(90deg, #4A9FB8 0%, #5BC0DE 100%)' : 'transparent',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: activeFilter === filter.value ? '0 10px 30px rgba(74, 159, 184, 0.4)' : 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (activeFilter !== filter.value) {
                e.currentTarget.style.background = 'rgba(74, 159, 184, 0.2)';
                e.currentTarget.style.borderColor = '#5BC0DE';
              } else {
                e.currentTarget.style.background = 'linear-gradient(90deg, #5BC0DE 0%, #6DD0F0 100%)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(91, 192, 222, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== filter.value) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#2C5F7D';
              } else {
                e.currentTarget.style.background = 'linear-gradient(90deg, #4A9FB8 0%, #5BC0DE 100%)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(74, 159, 184, 0.4)';
              }
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Controles de vista y orden */}
      <div className="flex items-center gap-3">
        {/* Selector de orden */}
        <div style={{ position: 'relative' }}>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortType)}
            style={{
              padding: '0.75rem 2.5rem 0.75rem 1rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '0.5rem',
              border: '2px solid #2C5F7D',
              background: 'transparent',
              color: '#FFFFFF',
              cursor: 'pointer',
              appearance: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(74, 159, 184, 0.2)';
              e.currentTarget.style.borderColor = '#5BC0DE';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#2C5F7D';
            }}
          >
            <option value="recent" style={{ background: '#0A1628' }}>
              Recientes
            </option>
            <option value="alphabetical" style={{ background: '#0A1628' }}>
              A-Z
            </option>
          </select>
          <ArrowUpDown style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#B8D4E8', pointerEvents: 'none' }} />
        </div>

        {/* Botones de vista */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onViewTypeChange('grid')}
            style={{
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: viewType === 'grid' ? 'none' : '2px solid #2C5F7D',
              background: viewType === 'grid' ? 'linear-gradient(90deg, #4A9FB8 0%, #5BC0DE 100%)' : 'transparent',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: viewType === 'grid' ? '0 10px 30px rgba(74, 159, 184, 0.4)' : 'none',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (viewType !== 'grid') {
                e.currentTarget.style.background = 'rgba(74, 159, 184, 0.2)';
                e.currentTarget.style.borderColor = '#5BC0DE';
              } else {
                e.currentTarget.style.background = 'linear-gradient(90deg, #5BC0DE 0%, #6DD0F0 100%)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(91, 192, 222, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (viewType !== 'grid') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#2C5F7D';
              } else {
                e.currentTarget.style.background = 'linear-gradient(90deg, #4A9FB8 0%, #5BC0DE 100%)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(74, 159, 184, 0.4)';
              }
            }}
          >
            <LayoutGrid style={{ width: '1rem', height: '1rem' }} />
          </button>
          <button
            onClick={() => onViewTypeChange('list')}
            style={{
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: viewType === 'list' ? 'none' : '2px solid #2C5F7D',
              background: viewType === 'list' ? 'linear-gradient(90deg, #4A9FB8 0%, #5BC0DE 100%)' : 'transparent',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: viewType === 'list' ? '0 10px 30px rgba(74, 159, 184, 0.4)' : 'none',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (viewType !== 'list') {
                e.currentTarget.style.background = 'rgba(74, 159, 184, 0.2)';
                e.currentTarget.style.borderColor = '#5BC0DE';
              } else {
                e.currentTarget.style.background = 'linear-gradient(90deg, #5BC0DE 0%, #6DD0F0 100%)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(91, 192, 222, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (viewType !== 'list') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#2C5F7D';
              } else {
                e.currentTarget.style.background = 'linear-gradient(90deg, #4A9FB8 0%, #5BC0DE 100%)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(74, 159, 184, 0.4)';
              }
            }}
          >
            <List style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
