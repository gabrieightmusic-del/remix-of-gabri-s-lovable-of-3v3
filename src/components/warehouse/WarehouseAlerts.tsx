import { AlertTriangle, MapPin, Package, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { WarehouseAlert } from '@/types/inventory';
import { WAREHOUSE_ALERT_LABELS } from '@/types/inventory';

interface WarehouseAlertsProps {
  alerts: WarehouseAlert[];
}

const ALERT_ICONS: Record<string, typeof AlertTriangle> = {
  UNADDRESSED: Package,
  CAPACITY_EXCEEDED: Layers,
  MULTI_LOCATION: MapPin,
  EMPTY_LOCATION: MapPin,
};

const ALERT_COLORS: Record<string, string> = {
  UNADDRESSED: 'bg-warning/10 text-warning border-warning/30',
  CAPACITY_EXCEEDED: 'bg-destructive/10 text-destructive border-destructive/30',
  MULTI_LOCATION: 'bg-info/10 text-info border-info/30',
  EMPTY_LOCATION: 'bg-muted text-muted-foreground border-border',
};

export function WarehouseAlerts({ alerts }: WarehouseAlertsProps) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <Package className="h-6 w-6 text-success" />
        </div>
        <p className="mt-3 font-medium">Nenhum alerta no armazém</p>
        <p className="text-sm text-muted-foreground">Todos os produtos estão endereçados corretamente</p>
      </div>
    );
  }

  const grouped = alerts.reduce((acc, alert) => {
    if (!acc[alert.type]) acc[alert.type] = [];
    acc[alert.type].push(alert);
    return acc;
  }, {} as Record<string, WarehouseAlert[]>);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        {Object.entries(grouped).map(([type, items]) => {
          const Icon = ALERT_ICONS[type] || AlertTriangle;
          return (
            <Card key={type} className={`border ${ALERT_COLORS[type]}`}>
              <CardContent className="flex items-center gap-3 p-4">
                <Icon className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{WAREHOUSE_ALERT_LABELS[type as keyof typeof WAREHOUSE_ALERT_LABELS]}</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail list */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {alerts.map((alert) => {
            const Icon = ALERT_ICONS[alert.type] || AlertTriangle;
            return (
              <div key={alert.id} className={`flex items-start gap-3 rounded-lg border p-3 ${ALERT_COLORS[alert.type]}`}>
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {WAREHOUSE_ALERT_LABELS[alert.type]}
                    </Badge>
                    {alert.productCode && (
                      <span className="font-mono text-xs">{alert.productCode}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm">{alert.message}</p>
                  {alert.details && (
                    <p className="mt-1 text-xs opacity-70">{alert.details}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}