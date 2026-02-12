import { useState, useMemo } from 'react';
import { MapPin, Plus, Package, Layers, Thermometer, AlertTriangle, Settings, Target } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useInventoryContext } from '@/contexts/InventoryContext';
import { WarehouseAlerts } from '@/components/warehouse/WarehouseAlerts';
import { AddressingDialog } from '@/components/warehouse/AddressingDialog';
import { StorageStructureManager } from '@/components/warehouse/StorageStructureManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { WarehouseLocation } from '@/types/inventory';

export default function Armazem() {
  const { locations, products, addLocation, getWarehouseAlerts } = useInventoryContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddressingOpen, setIsAddressingOpen] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState<string>('all');
  const [formData, setFormData] = useState({
    shelf: '',
    rack: '',
    type: 'PICKING' as 'AEREO' | 'PICKING',
    capacity: '',
    description: '',
  });

  const warehouseAlerts = useMemo(() => getWarehouseAlerts(), [getWarehouseAlerts]);

  // Group locations by shelf
  const shelves = [...new Set(locations.map(l => l.shelf))].sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  // Get products for a location
  const getProductsForLocation = (location: WarehouseLocation) => {
    const locationCode = `STNT${location.shelf}-PRAT${location.rack}`;
    return products.filter(p => p.location === locationCode);
  };

  const filteredLocations = selectedShelf === 'all' 
    ? locations 
    : locations.filter(l => l.shelf === selectedShelf);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shelfPadded = formData.shelf.padStart(2, '0');
    const rackPadded = formData.rack.padStart(2, '0');
    addLocation({
      shelf: shelfPadded,
      rack: rackPadded,
      type: formData.type,
      description: `STNT${shelfPadded} - PRAT${rackPadded} - ${formData.type === 'AEREO' ? 'AER' : 'PCKN'}`,
      products: [],
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
    });
    setIsDialogOpen(false);
    setFormData({ shelf: '', rack: '', type: 'PICKING', capacity: '', description: '' });
  };

  // Stats
  const pickingCount = locations.filter(l => l.type === 'PICKING').length;
  const aereoCount = locations.filter(l => l.type === 'AEREO').length;
  const unaddressedCount = products.filter(p => !p.location || p.location.trim() === '').length;

  return (
    <AppLayout title="Mapa do Armazém" subtitle="Endereçamento, estruturas e alertas">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" /> Endereços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{locations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Layers className="h-4 w-4" /> Estantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{shelves.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Package className="h-4 w-4" /> Picking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pickingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Thermometer className="h-4 w-4" /> Aéreo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{aereoCount}</div>
            </CardContent>
          </Card>
          <Card className={unaddressedCount > 0 ? 'border-warning/30' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <AlertTriangle className="h-4 w-4" /> Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${unaddressedCount > 0 ? 'text-warning' : ''}`}>
                {warehouseAlerts.length}
              </div>
              {unaddressedCount > 0 && (
                <p className="text-xs text-warning">{unaddressedCount} sem endereço</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main tabs */}
        <Tabs defaultValue="map">
          <TabsList>
            <TabsTrigger value="map" className="gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Mapa
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> 
              Alertas
              {warehouseAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-xs">
                  {warehouseAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="structures" className="gap-1.5">
              <Settings className="h-3.5 w-3.5" /> Estruturas
            </TabsTrigger>
          </TabsList>

          {/* MAP TAB */}
          <TabsContent value="map" className="mt-4">
            <div className="space-y-4">
              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-48">
                  <SearchableSelect
                    options={[
                      { value: 'all', label: 'Todas as Estantes' },
                      ...shelves.map(shelf => ({ value: shelf, label: `STNT${shelf}` })),
                    ]}
                    value={selectedShelf}
                    onValueChange={setSelectedShelf}
                    placeholder="Filtrar por estante"
                    searchPlaceholder="Buscar estante..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsAddressingOpen(true)}>
                    <Target className="mr-2 h-4 w-4" />
                    Endereçar Produto
                  </Button>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Endereço
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cadastrar Novo Endereço</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="shelf">Estante (Nº)</Label>
                            <Input
                              id="shelf"
                              value={formData.shelf}
                              onChange={e => setFormData(f => ({ ...f, shelf: e.target.value }))}
                              placeholder="01, 02... 30"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rack">Prateleira</Label>
                            <Input
                              id="rack"
                              value={formData.rack}
                              onChange={e => setFormData(f => ({ ...f, rack: e.target.value }))}
                              placeholder="01, 02, 02B..."
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo de Armazenagem</Label>
                          <SearchableSelect
                            options={[
                              { value: 'AEREO', label: 'Aéreo (AER)' },
                              { value: 'PICKING', label: 'Picking (PCKN)' },
                            ]}
                            value={formData.type}
                            onValueChange={(value) => setFormData(f => ({ ...f, type: value as 'AEREO' | 'PICKING' }))}
                            placeholder="Selecione"
                            searchPlaceholder="Buscar tipo..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Capacidade (opcional)</Label>
                          <Input
                            type="number"
                            min={0}
                            value={formData.capacity}
                            onChange={e => setFormData(f => ({ ...f, capacity: e.target.value }))}
                            placeholder="Máx. de produtos"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                          <Button type="submit">Cadastrar</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Sub-tabs by storage type */}
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">Todos ({filteredLocations.length})</TabsTrigger>
                  <TabsTrigger value="PICKING">Picking</TabsTrigger>
                  <TabsTrigger value="AEREO">Aéreo</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <LocationGrid locations={filteredLocations} getProducts={getProductsForLocation} />
                </TabsContent>
                <TabsContent value="PICKING" className="mt-4">
                  <LocationGrid locations={filteredLocations.filter(l => l.type === 'PICKING')} getProducts={getProductsForLocation} />
                </TabsContent>
                <TabsContent value="AEREO" className="mt-4">
                  <LocationGrid locations={filteredLocations.filter(l => l.type === 'AEREO')} getProducts={getProductsForLocation} />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {/* ALERTS TAB */}
          <TabsContent value="alerts" className="mt-4">
            <WarehouseAlerts alerts={warehouseAlerts} />
          </TabsContent>

          {/* STRUCTURES TAB */}
          <TabsContent value="structures" className="mt-4">
            <StorageStructureManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Addressing dialog */}
      <AddressingDialog open={isAddressingOpen} onOpenChange={setIsAddressingOpen} />
    </AppLayout>
  );
}

interface LocationGridProps {
  locations: WarehouseLocation[];
  getProducts: (location: WarehouseLocation) => import('@/types/inventory').Product[];
}

function LocationGrid({ locations, getProducts }: LocationGridProps) {
  if (locations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">Nenhum endereço encontrado</p>
      </div>
    );
  }

  // Group by shelf
  const grouped = locations.reduce((acc, loc) => {
    if (!acc[loc.shelf]) acc[loc.shelf] = [];
    acc[loc.shelf].push(loc);
    return acc;
  }, {} as Record<string, WarehouseLocation[]>);

  return (
    <div className="space-y-6">
      {Object.entries(grouped)
        .sort(([a], [b]) => {
          const numA = parseInt(a);
          const numB = parseInt(b);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.localeCompare(b);
        })
        .map(([shelf, locs]) => (
          <div key={shelf}>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <div className="flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-primary-foreground font-mono">
                STNT{shelf}
              </div>
              {locs[0]?.productTypes && locs[0].productTypes !== 'N/D' && (
                <span className="text-sm font-normal text-muted-foreground">{locs[0].productTypes}</span>
              )}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {locs.sort((a, b) => a.rack.localeCompare(b.rack)).map((location) => {
                const locationProducts = getProducts(location);
                const isSpecial = parseInt(location.shelf) >= 100;
                const isOverCapacity = location.capacity ? locationProducts.length > location.capacity : false;
                return (
                  <Card key={location.id} className={`overflow-hidden ${isSpecial ? 'border-warning/30' : ''} ${isOverCapacity ? 'border-destructive/50' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-mono text-base">
                          PRAT{location.rack}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          {location.capacity && (
                            <span className={`text-xs ${isOverCapacity ? 'font-medium text-destructive' : 'text-muted-foreground'}`}>
                              {locationProducts.length}/{location.capacity}
                            </span>
                          )}
                          <Badge variant={location.type === 'AEREO' ? 'secondary' : 'default'} className="text-xs">
                            {location.type === 'AEREO' ? 'AER' : 'PCKN'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {locationProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Vazio</p>
                      ) : (
                        <div className="space-y-1">
                          {locationProducts.slice(0, 3).map((product) => (
                            <div key={product.id} className="flex items-center justify-between text-sm">
                              <span className="truncate font-mono text-xs text-muted-foreground">
                                {product.code}
                              </span>
                              <span className={`font-medium ${product.currentStock < product.minStock ? 'text-warning' : ''}`}>
                                {product.currentStock}
                              </span>
                            </div>
                          ))}
                          {locationProducts.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{locationProducts.length - 3} produto(s)
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}