import { useState, useEffect, useMemo } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInventoryContext } from '@/contexts/InventoryContext';
import { CollaboratorManagementDialog } from '@/components/collaborators/CollaboratorManagementDialog';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { alerts, currentUser, collaborators, setUser, products, compositions } = useInventoryContext();
  const navigate = useNavigate();
  const unreadAlerts = alerts.filter(a => !a.isRead).length;
  const activeCollaborators = collaborators.filter(c => !c.isBlocked);
  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const productResults = useMemo(() =>
    products.map(p => ({
      id: p.id,
      label: `${p.code} — ${p.description}`,
      sublabel: `Estoque: ${p.currentStock} ${p.unit} · ${p.location || 'Sem endereço'}`,
      type: 'product' as const,
    })),
    [products]
  );

  const compositionResults = useMemo(() =>
    compositions.map(c => ({
      id: c.id,
      label: `${c.code} — ${c.name}`,
      sublabel: `${c.items.length} itens · ${c.isActive ? 'Ativa' : 'Inativa'}`,
      type: 'composition' as const,
    })),
    [compositions]
  );

  const handleSelect = (type: string) => {
    setSearchOpen(false);
    if (type === 'product') navigate('/produtos');
    else if (type === 'composition') navigate('/composicoes');
  };

  return (
    <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-border/60 bg-background/80 px-8 backdrop-blur-xl">
      <div>
        <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-[13px] text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search Trigger */}
        <Button
          variant="ghost"
          onClick={() => setSearchOpen(true)}
          className="relative hidden h-9 w-60 justify-start rounded-lg border border-border/60 bg-muted/50 px-3 text-[13px] text-muted-foreground/60 hover:bg-background lg:flex"
        >
          <Search className="mr-2 h-4 w-4" />
          Buscar produto ou código...
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </Button>

        {/* Command Palette */}
        <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
          <CommandInput placeholder="Buscar produto, composição..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup heading="Produtos">
              {productResults.map(item => (
                <CommandItem key={item.id} onSelect={() => handleSelect('product')}>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Composições">
              {compositionResults.map(item => (
                <CommandItem key={item.id} onSelect={() => handleSelect('composition')}>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        {/* Collaborator Management */}
        <CollaboratorManagementDialog />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground">
          <Bell className="h-[18px] w-[18px]" />
          {unreadAlerts > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadAlerts}
            </span>
          )}
        </Button>

        {/* Separator */}
        <div className="mx-1 h-6 w-px bg-border/60" />

        {/* User selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2.5 rounded-lg px-2 text-[13px] font-medium text-muted-foreground hover:text-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="hidden md:inline">
                {currentUser || 'Selecionar'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Colaborador</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {activeCollaborators.map((collab) => (
              <DropdownMenuItem 
                key={collab.id}
                onClick={() => setUser(collab.name)}
                className={currentUser === collab.name ? 'bg-primary/10 text-primary font-medium' : ''}
              >
                {collab.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
