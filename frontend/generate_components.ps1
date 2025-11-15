# Script to generate basic component stubs
$components = @(
    'AuthPage', 'HomePage', 'SearchPage', 'LibraryPage', 'PlaylistDetail',
    'ArtistDashboard', 'AdminDashboard', 'Header', 'Sidebar', 'MusicPlayer',
    'SongCard', 'SongRow', 'PlaylistCard', 'Toast', 'Logo',
    'LoginForm', 'RegisterForm', 'CreatePlaylistModal', 'EditPlaylistModal',
    'AddToPlaylistMenu', 'SongActionsMenu', 'QueuePanel', 'LibraryFilters',
    'PlaylistCoverCollage'
)

foreach ($comp in $components) {
    $content = @"
export default function {0}() {{
  return <div>{0} Component - TODO: Implement</div>;
}}
"@ -f $comp
    Set-Content -Path "src\components\$comp.tsx" -Value $content
}

Write-Host 'Generated' $components.Count 'components'
