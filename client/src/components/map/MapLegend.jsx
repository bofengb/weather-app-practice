import { Card, CardContent } from '@/components/ui/card';

// Draw legend
export default function MapLegend() {
  const legendItems = [
    {
      color: '#facc15',
      icon: '★',
      label: 'Favorites',
    },
    {
      color: '#94a3b8',
      icon: '●',
      label: 'Search History',
    },
  ];

  return (
    <Card className="absolute bottom-4 right-4 z-[1000] shadow-lg">
      <CardContent className="p-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">Legend</p>
        <div className="space-y-1.5">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{ backgroundColor: item.color }}
              >
                <span className="text-white">{item.icon}</span>
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
