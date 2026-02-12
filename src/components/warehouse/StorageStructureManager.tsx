import { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Play, Upload, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useInventoryContext } from '@/contexts/InventoryContext';
import { useToast } from '@/hooks/use-toast';
import type { StorageStructure, ProductCategory } from '@/types/inventory';
import { PRODUCT_CATEGORIES } from '@/types/inventory';

const TYPE_RULE_OPTIONS = [
  { value: 'ALL_SAME', label: 'Todas iguais (mesmo tipo)' },
  { value: 'LOWER_PICKING_UPPER_AEREO', label: 'Inferiores = Picking, Superiores = Aéreo' },
];

const TEMPLATES: Omit<StorageStructure, 'id' | 'createdAt'>[] = [
  {
    name: 'Estanteria Padrão 30x6',
    shelfPrefix: 'STNT',
    shelfStart: 1,
    shelfEnd: 30,
    racksPerShelf: 6,
    defaultType: 'PICKING',
    typeRule: 'LOWER_PICKING_UPPER_AEREO',
    pickingCutoff: 3,
    defaultCapacity: 20,
  },
  {
    name: 'Estante Compacta 10x4',
    shelfPrefix: 'STNT',
    shelfStart: 1,
    shelfEnd: 10,
    racksPerShelf: 4,
    defaultType: 'PICKING',
    typeRule: 'ALL_SAME',
    defaultCapacity: 15,
  },
  {
    name: 'Porta-Pallets Aéreo 5x3',
    shelfPrefix: 'PP',
    shelfStart: 1,
    shelfEnd: 5,
    racksPerShelf: 3,
    defaultType: 'AEREO',
    typeRule: 'ALL_SAME',
    defaultCapacity: 8,
  },
];

const emptyForm: Omit<StorageStructure, 'id' | 'createdAt'> = {
  name: '',
  shelfPrefix: 'STNT',
  shelfStart: 1,
  shelfEnd: 10,
  racksPerShelf: 6,
  defaultType: 'PICKING',
  typeRule: 'ALL_SAME',
  pickingCutoff: 3,
  defaultCapacity: 20,
  defaultCategories: [],
};

export function StorageStructureManager() {
  const { storageStructures, addStorageStructure, updateStorageStructure, deleteStorageStructure, generateLocationsFromStructure } = useInventoryContext();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<StorageStructure, 'id' | 'createdAt'>>(emptyForm);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleOpenNew = (template?: typeof TEMPLATES[number]) => {
    setEditingId(null);
    setForm(template || emptyForm);
    setIsFormOpen(true);
  };

  const handleEdit = (structure: StorageStructure) => {
    setEditingId(structure.id);
    const { id, createdAt, ...rest } = structure;
    setForm(rest);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' });
      return;
    }
    if (editingId) {
      updateStorageStructure(editingId, form);
      toast({ title: 'Estrutura atualizada' });
    } else {
      addStorageStructure(form);
      toast({ title: 'Estrutura criada' });
    }
    setIsFormOpen(false);
  };

  const handleGenerate = (structure: StorageStructure) => {
    const count = generateLocationsFromStructure(structure);
    toast({
      title: `${count} endereços gerados`,
      description: `A partir da estrutura "${structure.name}"`,
    });
  };

  const handleDelete = (id: string) => {
    deleteStorageStructure(id);
    toast({ title: 'Estrutura removida' });
  };

  const handleDownloadTemplate = () => {
    const data = [
      { 'Nome': 'Estante A', 'Prefixo': 'STNT', 'Estante Início': 1, 'Estante Fim': 10, 'Prateleiras': 6, 'Tipo Padrão': 'PICKING', 'Capacidade': 20 },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estruturas');
    XLSX.writeFile(wb, 'modelo-estruturas-armazem.xlsx');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const json = XLSX.utils.sheet_to_json<Record<string, string | number>>(wb.Sheets[wb.SheetNames[0]], { defval: '' });
        
        let count = 0;
        for (const row of json) {
          const name = String(row['Nome'] || row['name'] || '').trim();
          if (!name) continue;
          addStorageStructure({
            name,
            shelfPrefix: String(row['Prefixo'] || row['prefix'] || 'STNT'),
            shelfStart: Number(row['Estante Início'] || row['shelfStart'] || 1),
            shelfEnd: Number(row['Estante Fim'] || row['shelfEnd'] || 10),
            racksPerShelf: Number(row['Prateleiras'] || row['racksPerShelf'] || 6),
            defaultType: String(row['Tipo Padrão'] || row['type'] || 'PICKING').toUpperCase() as 'AEREO' | 'PICKING',
            typeRule: 'ALL_SAME',
            defaultCapacity: Number(row['Capacidade'] || row['capacity'] || 20),
          });
          count++;
        }
        toast({ title: `${count} estrutura(s) importada(s)` });
      } catch {
        toast({ title: 'Erro ao importar', variant: 'destructive' });
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => handleOpenNew()}>
          <Plus className="mr-2 h-4 w-4" /> Nova Estrutura
        </Button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportFile} />
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" /> Importar
        </Button>
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="mr-2 h-4 w-4" /> Modelo
        </Button>
      </div>

      {/* Templates */}
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Templates sugeridos</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              onClick={() => handleOpenNew(tpl)}
              className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 text-left transition-colors hover:bg-primary/10"
            >
              <p className="text-sm font-medium">{tpl.name}</p>
              <p className="text-xs text-muted-foreground">
                {tpl.shelfPrefix}{String(tpl.shelfStart).padStart(2, '0')} a {tpl.shelfPrefix}{String(tpl.shelfEnd).padStart(2, '0')} · {tpl.racksPerShelf} prat/est
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Existing structures */}
      {storageStructures.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Estruturas Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Faixa</TableHead>
                  <TableHead>Prateleiras</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storageStructures.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {s.shelfPrefix}{String(s.shelfStart).padStart(2, '0')}-{s.shelfPrefix}{String(s.shelfEnd).padStart(2, '0')}
                    </TableCell>
                    <TableCell>{s.racksPerShelf}/est</TableCell>
                    <TableCell>
                      <Badge variant={s.defaultType === 'AEREO' ? 'secondary' : 'default'} className="text-xs">
                        {s.defaultType === 'AEREO' ? 'Aéreo' : 'Picking'}
                      </Badge>
                    </TableCell>
                    <TableCell>{s.defaultCapacity || '—'}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleGenerate(s)} title="Gerar endereços">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(s)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-muted-foreground">Nenhuma estrutura cadastrada</p>
          <p className="text-sm text-muted-foreground">Crie uma nova ou use um template acima</p>
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar' : 'Nova'} Estrutura de Armazenagem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Estrutura</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Estanteria Principal" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prefixo</Label>
                <Input value={form.shelfPrefix} onChange={e => setForm(f => ({ ...f, shelfPrefix: e.target.value }))} placeholder="STNT" />
              </div>
              <div className="space-y-2">
                <Label>Prateleiras/Estante</Label>
                <Input type="number" min={1} max={20} value={form.racksPerShelf} onChange={e => setForm(f => ({ ...f, racksPerShelf: parseInt(e.target.value) || 1 }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estante Início</Label>
                <Input type="number" min={1} value={form.shelfStart} onChange={e => setForm(f => ({ ...f, shelfStart: parseInt(e.target.value) || 1 }))} />
              </div>
              <div className="space-y-2">
                <Label>Estante Fim</Label>
                <Input type="number" min={1} value={form.shelfEnd} onChange={e => setForm(f => ({ ...f, shelfEnd: parseInt(e.target.value) || 1 }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Regra de Tipo</Label>
              <SearchableSelect
                options={TYPE_RULE_OPTIONS}
                value={form.typeRule || 'ALL_SAME'}
                onValueChange={v => setForm(f => ({ ...f, typeRule: v as StorageStructure['typeRule'] }))}
                placeholder="Regra de tipo"
                searchPlaceholder="Buscar..."
              />
            </div>
            {form.typeRule === 'ALL_SAME' && (
              <div className="space-y-2">
                <Label>Tipo Padrão</Label>
                <SearchableSelect
                  options={[
                    { value: 'PICKING', label: 'Picking (PCKN)' },
                    { value: 'AEREO', label: 'Aéreo (AER)' },
                  ]}
                  value={form.defaultType}
                  onValueChange={v => setForm(f => ({ ...f, defaultType: v as 'AEREO' | 'PICKING' }))}
                  placeholder="Tipo"
                  searchPlaceholder="Buscar..."
                />
              </div>
            )}
            {form.typeRule === 'LOWER_PICKING_UPPER_AEREO' && (
              <div className="space-y-2">
                <Label>Prateleiras Picking (até nº)</Label>
                <Input type="number" min={1} max={form.racksPerShelf} value={form.pickingCutoff || 3} onChange={e => setForm(f => ({ ...f, pickingCutoff: parseInt(e.target.value) || 3 }))} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Capacidade padrão (produtos/endereço)</Label>
              <Input type="number" min={0} value={form.defaultCapacity || 0} onChange={e => setForm(f => ({ ...f, defaultCapacity: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>Categorias permitidas (opcional)</Label>
              <div className="flex flex-wrap gap-1">
                {PRODUCT_CATEGORIES.map(cat => {
                  const selected = form.defaultCategories?.includes(cat.value);
                  return (
                    <Badge
                      key={cat.value}
                      variant={selected ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => {
                        setForm(f => ({
                          ...f,
                          defaultCategories: selected
                            ? (f.defaultCategories || []).filter(c => c !== cat.value)
                            : [...(f.defaultCategories || []), cat.value],
                        }));
                      }}
                    >
                      {cat.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground">Prévia</p>
              <p className="text-sm">
                {(form.shelfEnd - form.shelfStart + 1) * form.racksPerShelf} endereços serão gerados:
                {' '}{form.shelfPrefix}{String(form.shelfStart).padStart(2, '0')}-PRAT01 até {form.shelfPrefix}{String(form.shelfEnd).padStart(2, '0')}-PRAT{String(form.racksPerShelf).padStart(2, '0')}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>{editingId ? 'Salvar' : 'Criar'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}