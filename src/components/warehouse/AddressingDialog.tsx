import { useState, useMemo } from 'react';
import { MapPin, Lightbulb, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useInventoryContext } from '@/contexts/InventoryContext';
import { PRODUCT_CATEGORIES } from '@/types/inventory';

interface AddressingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddressingDialog({ open, onOpenChange }: AddressingDialogProps) {
  const { products, locations, assignProductToLocation, getSuggestedLocation } = useInventoryContext();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const unaddressedProducts = useMemo(() => 
    products.filter(p => !p.location || p.location.trim() === ''),
    [products]
  );

  const productOptions = useMemo(() => 
    products.map(p => ({
      value: p.id,
      label: `${p.code} - ${p.description}`,
      sublabel: p.location ? `Endereço: ${p.location}` : 'Sem endereço',
    })),
    [products]
  );

  const suggestions = useMemo(() => {
    if (!selectedProductId) return [];
    return getSuggestedLocation(selectedProductId);
  }, [selectedProductId, getSuggestedLocation]);

  const filteredLocations = useMemo(() => {
    const search = searchLocation.toLowerCase();
    return locations.filter(l => {
      const code = `STNT${l.shelf}-PRAT${l.rack}`.toLowerCase();
      const desc = (l.description || '').toLowerCase();
      const types = (l.productTypes || '').toLowerCase();
      return code.includes(search) || desc.includes(search) || types.includes(search);
    });
  }, [locations, searchLocation]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleAssign = (locationId: string) => {
    if (!selectedProductId) return;
    assignProductToLocation(selectedProductId, locationId);
    setSelectedProductId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereçar Produto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Unaddressed count */}
          {unaddressedProducts.length > 0 && (
            <div className="rounded-lg bg-warning/10 border border-warning/30 p-3">
              <p className="text-sm font-medium text-warning">
                {unaddressedProducts.length} produto(s) sem endereço
              </p>
            </div>
          )}

          {/* Product selection */}
          <div className="space-y-2">
            <SearchableSelect
              options={productOptions}
              value={selectedProductId}
              onValueChange={setSelectedProductId}
              placeholder="Selecione um produto para endereçar"
              searchPlaceholder="Buscar por código ou descrição..."
            />
          </div>

          {selectedProduct && (
            <>
              {/* Product info */}
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm font-medium">{selectedProduct.code}</p>
                      <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {PRODUCT_CATEGORIES.find(c => c.value === selectedProduct.category)?.label}
                      </Badge>
                      {selectedProduct.location && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Atual: <span className="font-mono">{selectedProduct.location}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Smart suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Lightbulb className="h-4 w-4 text-warning" />
                    Sugestões inteligentes
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {suggestions.map(loc => {
                      const locProducts = products.filter(p => p.location === `STNT${loc.shelf}-PRAT${loc.rack}`);
                      return (
                        <button
                          key={loc.id}
                          onClick={() => handleAssign(loc.id)}
                          className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 text-left transition-colors hover:bg-primary/10"
                        >
                          <div>
                            <p className="font-mono text-sm font-medium">STNT{loc.shelf}-PRAT{loc.rack}</p>
                            <p className="text-xs text-muted-foreground">
                              {loc.type === 'AEREO' ? 'Aéreo' : 'Picking'}
                              {loc.productTypes && loc.productTypes !== 'N/D' && ` · ${loc.productTypes}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">
                              {locProducts.length} prod.
                              {loc.capacity ? `/${loc.capacity}` : ''}
                            </Badge>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All locations */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar endereço..."
                    value={searchLocation}
                    onChange={e => setSearchLocation(e.target.value)}
                    className="h-8"
                  />
                </div>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-1">
                    {filteredLocations.slice(0, 50).map(loc => {
                      const locProducts = products.filter(p => p.location === `STNT${loc.shelf}-PRAT${loc.rack}`);
                      const isFull = loc.capacity ? locProducts.length >= loc.capacity : false;
                      return (
                        <button
                          key={loc.id}
                          onClick={() => !isFull && handleAssign(loc.id)}
                          disabled={isFull}
                          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono">STNT{loc.shelf}-PRAT{loc.rack}</span>
                            <Badge variant={loc.type === 'AEREO' ? 'secondary' : 'default'} className="text-xs">
                              {loc.type === 'AEREO' ? 'AER' : 'PCKN'}
                            </Badge>
                            {loc.productTypes && loc.productTypes !== 'N/D' && (
                              <span className="text-xs text-muted-foreground">{loc.productTypes}</span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {locProducts.length} prod.{loc.capacity ? `/${loc.capacity}` : ''}
                            {isFull && ' (cheio)'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}