import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DollarSign, Plus, Save, Trash2, Edit, TrendingUp, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isEnabled: boolean;
  isDefault: boolean;
  lastUpdated: string;
}

const mockCurrencies: Currency[] = [
  {
    id: 'cur-1',
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    exchangeRate: 1.00,
    isEnabled: true,
    isDefault: true,
    lastUpdated: '2025-01-15T10:00:00'
  },
  {
    id: 'cur-2',
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    exchangeRate: 0.92,
    isEnabled: true,
    isDefault: false,
    lastUpdated: '2025-01-15T10:00:00'
  },
  {
    id: 'cur-3',
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    exchangeRate: 0.79,
    isEnabled: true,
    isDefault: false,
    lastUpdated: '2025-01-15T10:00:00'
  },
  {
    id: 'cur-4',
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    exchangeRate: 149.50,
    isEnabled: true,
    isDefault: false,
    lastUpdated: '2025-01-15T10:00:00'
  },
  {
    id: 'cur-5',
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    exchangeRate: 1.35,
    isEnabled: false,
    isDefault: false,
    lastUpdated: '2025-01-15T10:00:00'
  },
  {
    id: 'cur-6',
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    exchangeRate: 1.52,
    isEnabled: false,
    isDefault: false,
    lastUpdated: '2025-01-15T10:00:00'
  }
];

export default function CurrencyPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currencies, setCurrencies] = useState<Currency[]>(mockCurrencies);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState<string | null>(null);

  const [newCurrency, setNewCurrency] = useState({
    code: '',
    name: '',
    symbol: '',
    exchangeRate: 1.00
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleCreateCurrency = () => {
    if (!newCurrency.code || !newCurrency.name || !newCurrency.symbol) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    const currency: Currency = {
      id: `cur-${Date.now()}`,
      ...newCurrency,
      code: newCurrency.code.toUpperCase(),
      isEnabled: false,
      isDefault: false,
      lastUpdated: new Date().toISOString()
    };

    setCurrencies([...currencies, currency]);
    setCreateDialogOpen(false);
    setNewCurrency({ code: '', name: '', symbol: '', exchangeRate: 1.00 });
    toast({
      title: "Currency Added",
      description: "New currency has been added successfully"
    });
  };

  const handleUpdateCurrency = () => {
    if (!editingCurrency) return;

    setCurrencies(currencies.map(cur => 
      cur.id === editingCurrency.id 
        ? { ...editingCurrency, lastUpdated: new Date().toISOString() }
        : cur
    ));
    setEditingCurrency(null);
    toast({
      title: "Currency Updated",
      description: "Currency has been updated successfully"
    });
  };

  const handleToggleEnabled = (currencyId: string) => {
    setCurrencies(currencies.map(cur =>
      cur.id === currencyId ? { ...cur, isEnabled: !cur.isEnabled } : cur
    ));
    toast({
      title: "Status Updated",
      description: "Currency status has been changed"
    });
  };

  const handleSetDefault = (currencyId: string) => {
    setCurrencies(currencies.map(cur => ({
      ...cur,
      isDefault: cur.id === currencyId
    })));
    toast({
      title: "Default Currency Set",
      description: "Default currency has been updated"
    });
  };

  const handleDeleteCurrency = () => {
    if (currencyToDelete) {
      const currency = currencies.find(c => c.id === currencyToDelete);
      if (currency?.isDefault) {
        toast({
          title: "Cannot Delete",
          description: "Cannot delete the default currency",
          variant: "destructive"
        });
        setDeleteDialogOpen(false);
        setCurrencyToDelete(null);
        return;
      }

      setCurrencies(currencies.filter(cur => cur.id !== currencyToDelete));
      setDeleteDialogOpen(false);
      setCurrencyToDelete(null);
      toast({
        title: "Currency Deleted",
        description: "Currency has been removed"
      });
    }
  };

  const handleRefreshRates = () => {
    // Simulate updating exchange rates
    setCurrencies(currencies.map(cur => ({
      ...cur,
      lastUpdated: new Date().toISOString()
    })));
    toast({
      title: "Rates Updated",
      description: "Exchange rates have been refreshed"
    });
  };

  const stats = {
    total: currencies.length,
    enabled: currencies.filter(c => c.isEnabled).length,
    disabled: currencies.filter(c => !c.isEnabled).length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Currency Settings</h1>
            <p className="text-muted-foreground">
              Manage supported currencies and exchange rates
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefreshRates} className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Refresh Rates
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Currency
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Currency</DialogTitle>
                  <DialogDescription>Add a new currency to your platform</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Currency Code</Label>
                    <Input
                      id="code"
                      placeholder="e.g., USD"
                      value={newCurrency.code}
                      onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value })}
                      maxLength={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Currency Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., US Dollar"
                      value={newCurrency.name}
                      onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="e.g., $"
                      value={newCurrency.symbol}
                      onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exchangeRate">Exchange Rate (to USD)</Label>
                    <Input
                      id="exchangeRate"
                      type="number"
                      step="0.01"
                      placeholder="1.00"
                      value={newCurrency.exchangeRate}
                      onChange={(e) => setNewCurrency({ ...newCurrency, exchangeRate: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateCurrency}>Add Currency</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Currencies</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enabled</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enabled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disabled</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.disabled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Currency List */}
        <Card>
          <CardHeader>
            <CardTitle>Supported Currencies</CardTitle>
            <CardDescription>
              Manage currencies available for transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currencies.map((currency) => (
                <div key={currency.id} className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary text-xl font-bold">
                    {currency.symbol}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{currency.name}</h3>
                      <Badge variant="outline">{currency.code}</Badge>
                      {currency.isDefault && (
                        <Badge className="bg-primary">Default</Badge>
                      )}
                      {currency.isEnabled ? (
                        <Badge className="bg-green-500">Enabled</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-500/10">Disabled</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Rate: {currency.exchangeRate.toFixed(4)} USD</span>
                      <span>Updated: {new Date(currency.lastUpdated).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`enabled-${currency.id}`} className="text-sm">Enabled</Label>
                      <Switch
                        id={`enabled-${currency.id}`}
                        checked={currency.isEnabled}
                        onCheckedChange={() => handleToggleEnabled(currency.id)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(currency.id)}
                      disabled={currency.isDefault}
                    >
                      Set Default
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCurrency(currency)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrencyToDelete(currency.id);
                        setDeleteDialogOpen(true);
                      }}
                      disabled={currency.isDefault}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exchange Rate Information */}
        <Card>
          <CardHeader>
            <CardTitle>Exchange Rate Information</CardTitle>
            <CardDescription>Understanding currency conversion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Exchange rates are relative to USD (United States Dollar) as the base currency.
              All transaction amounts are converted using these rates.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="font-medium">Default Currency:</span>
                <span className="text-muted-foreground">
                  The primary currency for your platform. This is used for reporting and base calculations.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="font-medium">Enabled Currencies:</span>
                <span className="text-muted-foreground">
                  Currencies that users can select for transactions and payments.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <span className="font-medium">Disabled Currencies:</span>
                <span className="text-muted-foreground">
                  Currencies that are configured but not currently available to users.
                </span>
              </div>
            </div>
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Exchange rates should be updated regularly to reflect current market conditions.
                Use the "Refresh Rates" button to update all rates at once.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingCurrency} onOpenChange={(open) => !open && setEditingCurrency(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Currency</DialogTitle>
              <DialogDescription>Update currency information and exchange rate</DialogDescription>
            </DialogHeader>
            {editingCurrency && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editCode">Currency Code</Label>
                  <Input
                    id="editCode"
                    value={editingCurrency.code}
                    onChange={(e) => setEditingCurrency({ ...editingCurrency, code: e.target.value.toUpperCase() })}
                    maxLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editName">Currency Name</Label>
                  <Input
                    id="editName"
                    value={editingCurrency.name}
                    onChange={(e) => setEditingCurrency({ ...editingCurrency, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSymbol">Symbol</Label>
                  <Input
                    id="editSymbol"
                    value={editingCurrency.symbol}
                    onChange={(e) => setEditingCurrency({ ...editingCurrency, symbol: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editExchangeRate">Exchange Rate (to USD)</Label>
                  <Input
                    id="editExchangeRate"
                    type="number"
                    step="0.01"
                    value={editingCurrency.exchangeRate}
                    onChange={(e) => setEditingCurrency({ ...editingCurrency, exchangeRate: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCurrency(null)}>Cancel</Button>
              <Button onClick={handleUpdateCurrency} className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Currency</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this currency? This action cannot be undone and may affect existing transactions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCurrency}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
