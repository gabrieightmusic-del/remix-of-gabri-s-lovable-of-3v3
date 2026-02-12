import { useState } from 'react';
import { Package, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { Product } from '@/types/inventory';

type KanbanScenario = 'lifecycle' | 'stock_status' | 'abc_curve' | 'purchase_flow' | 'addressing';

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  filter: (product: Product) => boolean;
}

const SCENARIOS: { value: KanbanScenario; label: string }[] = [
  { value: 'lifecycle', label: 'Ciclo de Vida' },
  { value: 'stock_status', label: 'Status de Estoque' },
  { value: 'abc_curve', label: 'Curva ABC' },
  { value: 'purchase_flow', label: 'Fluxo de Compras' },
  { value: 'addressing', label: 'Status de Endereçamento' },
];

function getColumns(scenario: KanbanScenario): KanbanColumn[] {
  switch (scenario) {
    case 'lifecycle':
      return [
        { id: 'active', title: 'Ativo', color: 'bg-success/15 border-success/30', filter: p => p.currentStock >= p.minStock },
        { id: 'attention', title: 'Atenção', color: 'bg-warning/15 border-warning/30', filter: p => p.currentStock < p.minStock && p.currentStock > 0 },
        { id: 'critical', title: 'Crítico', color: 'bg-destructive/15 border-destructive/30', filter: p => p.currentStock === 0 },
        { id: 'divergent', title: 'Divergente', color: 'bg-info/15 border-info/30', filter: p => { const d = Math.abs(p.currentStock - p.stockOmie); return p.stockOmie > 0 && (d / p.stockOmie) > 0.2; } },
      ];
    case 'stock_status':
      return [
        { id: 'ok', title: 'Estoque OK', color: 'bg-success/15 border-success/30', filter: p => p.currentStock >= p.minStock && p.currentStock > 0 },
        { id: 'low', title: 'Abaixo do Mínimo', color: 'bg-warning/15 border-warning/30', filter: p => p.currentStock > 0 && p.currentStock < p.minStock },
        { id: 'out', title: 'Sem Estoque', color: 'bg-destructive/15 border-destructive/30', filter: p => p.currentStock === 0 },
      ];
    case 'abc_curve':
      return [
        { id: 'A', title: 'Curva A', color: 'bg-primary/15 border-primary/30', filter: p => p.curvaABC === 'A' },
        { id: 'B', title: 'Curva B', color: 'bg-warning/15 border-warning/30', filter: p => p.curvaABC === 'B' },
        { id: 'C', title: 'Curva C', color: 'bg-muted border-border', filter: p => p.curvaABC === 'C' },
        { id: 'none', title: 'Sem Classificação', color: 'bg-secondary border-border', filter: p => !p.curvaABC },
      ];
    case 'purchase_flow':
      return [
        { id: 'cotacao', title: 'Cotação', color: 'bg-info/15 border-info/30', filter: p => p.purchaseStatus === 'COTACAO' },
        { id: 'pedido', title: 'Pedido', color: 'bg-warning/15 border-warning/30', filter: p => p.purchaseStatus === 'PEDIDO' },
        { id: 'recebimento', title: 'Recebimento', color: 'bg-primary/15 border-primary/30', filter: p => p.purchaseStatus === 'RECEBIMENTO' },
        { id: 'conferencia', title: 'Conferência', color: 'bg-success/15 border-success/30', filter: p => p.purchaseStatus === 'CONFERENCIA' },
        { id: 'sem_status', title: 'Sem Status', color: 'bg-secondary border-border', filter: p => !p.purchaseStatus },
      ];
    case 'addressing':
      return [
        { id: 'nao_enderecado', title: 'Não Endereçado', color: 'bg-destructive/15 border-destructive/30', filter: p => !p.addressingStatus || p.addressingStatus === 'NAO_ENDERECADO' },
        { id: 'enderecado', title: 'Endereçado', color: 'bg-warning/15 border-warning/30', filter: p => p.addressingStatus === 'ENDERECADO' },
        { id: 'conferido', title: 'Conferido', color: 'bg-success/15 border-success/30', filter: p => p.addressingStatus === 'CONFERIDO' },
      ];
  }
}

interface ProductKanbanProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
}

export function ProductKanban({ products, onEditProduct }: ProductKanbanProps) {
  const [scenario, setScenario] = useState<KanbanScenario>('lifecycle');
  const columns = getColumns(scenario);

  const scenarioOptions = SCENARIOS.map(s => ({ value: s.value, label: s.label }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Cenário:</span>
        <div className="w-56">
          <SearchableSelect
            options={scenarioOptions}
            value={scenario}
            onValueChange={(v) => setScenario(v as KanbanScenario)}
            placeholder="Selecione o cenário"
            searchPlaceholder="Buscar cenário..."
          />
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map(col => {
          const items = products.filter(col.filter);
          return (
            <div key={col.id} className={`rounded-lg border p-3 ${col.color} min-h-[200px]`}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{col.title}</h3>
                <Badge variant="secondary" className="text-xs">{items.length}</Badge>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhum produto</p>
                ) : (
                  items.map(product => (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onEditProduct(product)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-xs font-medium text-primary">{product.code}</p>
                            <p className="text-xs truncate mt-0.5">{product.description}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-muted-foreground">
                                Fís: <span className={`font-medium ${product.currentStock < product.minStock ? 'text-warning' : 'text-foreground'}`}>{product.currentStock}</span>
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                Mín: {product.minStock}
                              </span>
                              {product.curvaABC && (
                                <Badge variant="outline" className="text-[10px] h-4 px-1">
                                  {product.curvaABC}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
