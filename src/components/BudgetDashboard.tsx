import { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  PiggyBank, 
  CreditCard, 
  Target,
  Calendar,
  Users,
  Wallet,
  Settings,
  Lock,
  Home,
  Music,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import SalaryConfig from "./SalaryConfig";

interface BudgetAllocation {
  need: number;
  want: number;
  savings: number;
  investments: number;
}

interface CategorySpending {
  need: number;
  want: number;
  savings: number;
  investments: number;
}

interface ExpenseEntry {
  id: string;
  date: string;
  spentFor: string;
  amount: number;
  notes: string;
  category: 'need' | 'want' | 'savings' | 'investments';
}

const BudgetDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [actualSalary, setActualSalary] = useState(20000);
  const [budgetPercentage, setBudgetPercentage] = useState(70);
  const [showConfigHint, setShowConfigHint] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterDate, setFilterDate] = useState('');
  const { toast } = useToast();
  
  const [budgetAllocation, setBudgetAllocation] = useState<BudgetAllocation>({
    need: 50,
    want: 30,
    savings: 15,
    investments: 5
  });
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const calculatedTotalBudget = Math.round(actualSalary * budgetPercentage / 100);

  const getAllocatedAmounts = () => {
    return {
      need: Math.round(calculatedTotalBudget * budgetAllocation.need / 100),
      want: Math.round(calculatedTotalBudget * budgetAllocation.want / 100),
      savings: Math.round(calculatedTotalBudget * budgetAllocation.savings / 100),
      investments: Math.round(calculatedTotalBudget * budgetAllocation.investments / 100)
    };
  };

  const allocatedAmounts = getAllocatedAmounts();

  // Calculate spending from expenses
  const getSpendingByCategory = () => {
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === selectedMonth;
    });

    return {
      need: currentMonthExpenses.filter(e => e.category === 'need').reduce((sum, e) => sum + e.amount, 0),
      want: currentMonthExpenses.filter(e => e.category === 'want').reduce((sum, e) => sum + e.amount, 0),
      savings: currentMonthExpenses.filter(e => e.category === 'savings').reduce((sum, e) => sum + e.amount, 0),
      investments: currentMonthExpenses.filter(e => e.category === 'investments').reduce((sum, e) => sum + e.amount, 0)
    };
  };

  const categorySpending = getSpendingByCategory();
  
  // Corrected total spent calculation: Total Budget - Need - Savings - Investments
  const totalSpent = calculatedTotalBudget - categorySpending.need - categorySpending.savings - categorySpending.investments;
  const totalSaved = categorySpending.savings + categorySpending.investments;

  const handleSalaryUpdate = (salary: number, percentage: number) => {
    setActualSalary(salary);
    setBudgetPercentage(percentage);
    localStorage.setItem('budgetConfig', JSON.stringify({ salary, percentage }));
  };

  useEffect(() => {
    const saved = localStorage.getItem('budgetConfig');
    if (saved) {
      const { salary, percentage } = JSON.parse(saved);
      setActualSalary(salary);
      setBudgetPercentage(percentage);
    }
    
    const savedAllocation = localStorage.getItem('budgetAllocation');
    if (savedAllocation) {
      setBudgetAllocation(JSON.parse(savedAllocation));
    }

    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  const saveExpenses = (newExpenses: ExpenseEntry[]) => {
    setExpenses(newExpenses);
    localStorage.setItem('expenses', JSON.stringify(newExpenses));
  };

  const addExpense = (category: string, spentFor: string, amount: number, notes: string) => {
    const newExpense: ExpenseEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      spentFor,
      amount,
      notes,
      category: category as 'need' | 'want' | 'savings' | 'investments'
    };
    
    const updatedExpenses = [...expenses, newExpense];
    saveExpenses(updatedExpenses);
    
    toast({
      title: "Expense Added",
      description: `Added ₹${amount} for ${spentFor}`,
    });
  };

  const updateExpense = (id: string, spentFor: string, amount: number, notes: string) => {
    const updatedExpenses = expenses.map(expense =>
      expense.id === id ? { ...expense, spentFor, amount, notes } : expense
    );
    saveExpenses(updatedExpenses);
    
    toast({
      title: "Expense Updated",
      description: `Updated expense for ${spentFor}`,
    });
  };

  const deleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    saveExpenses(updatedExpenses);
    
    toast({
      title: "Expense Deleted",
      description: "Expense has been removed",
    });
  };

  const QuickStatsCard = ({ title, amount, icon: Icon, variant = "default", change }: any) => (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-br from-card to-muted/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${
          variant === 'success' ? 'text-success' : 
          variant === 'warning' ? 'text-warning' : 
          variant === 'destructive' ? 'text-destructive' : 
          'text-primary'
        }`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          ₹{amount.toLocaleString()}
        </div>
        {change && (
          <p className={`text-xs ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
            {change >= 0 ? '+' : ''}{change}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );

  const CategoryProgressCard = ({ 
    title, 
    icon: Icon, 
    allocated, 
    spent, 
    variant = "default" 
  }: {
    title: string;
    icon: any;
    allocated: number;
    spent: number;
    variant?: string;
  }) => {
    const remaining = allocated - spent;
    const progressPercentage = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;
    const isOverBudget = spent > allocated;
    
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${
                variant === 'need' ? 'text-destructive' :
                variant === 'want' ? 'text-warning' :
                variant === 'savings' ? 'text-success' :
                variant === 'investments' ? 'text-primary' :
                'text-muted-foreground'
              }`} />
              <span className="text-sm font-medium">{title}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {progressPercentage.toFixed(0)}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress 
            value={progressPercentage} 
            className={`h-2 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
          />
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground">Planned</p>
              <p className="font-semibold">₹{allocated.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Spent</p>
              <p className={`font-semibold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
                ₹{spent.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Remaining</p>
              <p className={`font-semibold ${
                remaining >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                ₹{remaining.toLocaleString()}
              </p>
            </div>
          </div>
          {isOverBudget && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
              Over budget by ₹{(spent - allocated).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const ExpenseEntryDialog = ({ category, categoryTitle, icon: Icon }: { 
    category: string; 
    categoryTitle: string; 
    icon: any; 
  }) => {
    const [open, setOpen] = useState(false);
    const [spentFor, setSpentFor] = useState('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!spentFor || !amount) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      addExpense(category, spentFor, parseFloat(amount), notes);
      setSpentFor('');
      setAmount('');
      setNotes('');
      setOpen(false);
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="mb-4">
            <Plus className="h-4 w-4 mr-2" />
            Add {categoryTitle} Entry
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              Add {categoryTitle} Entry
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spentFor">Spent For *</Label>
              <Input
                id="spentFor"
                value={spentFor}
                onChange={(e) => setSpentFor(e.target.value)}
                placeholder="What did you spend on?"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes (optional)"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Entry</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const EditExpenseDialog = ({ expense }: { expense: ExpenseEntry }) => {
    const [open, setOpen] = useState(false);
    const [spentFor, setSpentFor] = useState(expense.spentFor);
    const [amount, setAmount] = useState(expense.amount.toString());
    const [notes, setNotes] = useState(expense.notes);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!spentFor || !amount) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      updateExpense(expense.id, spentFor, parseFloat(amount), notes);
      setOpen(false);
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-spentFor">Spent For *</Label>
              <Input
                id="edit-spentFor"
                value={spentFor}
                onChange={(e) => setSpentFor(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount *</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Entry</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const ExpenseTable = ({ category, categoryTitle }: { category: string; categoryTitle: string }) => {
    const categoryExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const matchesCategory = expense.category === category;
      const matchesMonth = expenseDate.getMonth() === selectedMonth;
      const matchesDateFilter = !filterDate || expense.date === filterDate;
      
      return matchesCategory && matchesMonth && matchesDateFilter;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{categoryTitle} Entries</h3>
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-auto"
              placeholder="Filter by date"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterDate('')}
            >
              Clear
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">S.No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Spent For</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No entries found for {categoryTitle.toLowerCase()}
                  </TableCell>
                </TableRow>
              ) : (
                categoryExpenses.map((expense, index) => (
                  <TableRow key={expense.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>{expense.spentFor}</TableCell>
                    <TableCell>₹{expense.amount.toLocaleString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{expense.notes || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <EditExpenseDialog expense={expense} />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this expense entry? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteExpense(expense.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <div className="bg-card shadow-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Budget Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date().getFullYear()}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats - Budget Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <QuickStatsCard
            title="Total Budget"
            amount={calculatedTotalBudget}
            icon={Target}
            variant="default"
            change={5.2}
          />
          <QuickStatsCard
            title="Need (Essential)"
            amount={allocatedAmounts.need}
            icon={Home}
            variant="destructive"
          />
          <QuickStatsCard
            title="Want (Discretionary)"
            amount={allocatedAmounts.want}
            icon={Music}
            variant="warning"
          />
          <QuickStatsCard
            title="Savings"
            amount={allocatedAmounts.savings}
            icon={PiggyBank}
            variant="success"
          />
          <QuickStatsCard
            title="Investments"
            amount={allocatedAmounts.investments}
            icon={TrendingUp}
            variant="default"
          />
        </div>

        {/* Salary Configuration Info */}
        <div className="mb-6 flex justify-between items-center p-4 bg-gradient-to-r from-primary/5 to-success/5 rounded-lg border">
          <div>
            <p className="text-sm text-muted-foreground">
              Budget calculated from <strong>{budgetPercentage}%</strong> of monthly salary
            </p>
            <p className="text-xs text-muted-foreground">
              Current budget: ₹{calculatedTotalBudget.toLocaleString()}
              {actualSalary > 0 && ` (from ₹${actualSalary.toLocaleString()} salary)`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfigHint(!showConfigHint)}
            className="text-xs"
          >
            <Settings className="h-3 w-3 mr-1" />
            Configure
          </Button>
        </div>

        {showConfigHint && (
          <div className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-lg">
            <p className="text-sm text-warning-foreground">
              💡 <strong>Tip:</strong> You can access salary configuration through the hidden "Configuration" tab. 
              Look for the lock icon in the tab bar below.
            </p>
          </div>
        )}

        {/* Main Navigation Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-muted p-1 rounded-lg">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="need" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Need</span>
            </TabsTrigger>
            <TabsTrigger value="want" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Want</span>
            </TabsTrigger>
            <TabsTrigger value="savings" className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              <span className="hidden sm:inline">Savings</span>
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Investments</span>
            </TabsTrigger>
            <TabsTrigger value="wife-expenses" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Wife's Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2 text-warning" title="Salary Configuration (Password Protected)">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Budget Category Progress Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CategoryProgressCard
                  title="Need (Essential)"
                  icon={Home}
                  allocated={allocatedAmounts.need}
                  spent={categorySpending.need}
                  variant="need"
                />
                <CategoryProgressCard
                  title="Want (Discretionary)"
                  icon={Music}
                  allocated={allocatedAmounts.want}
                  spent={categorySpending.want}
                  variant="want"
                />
                <CategoryProgressCard
                  title="Savings"
                  icon={PiggyBank}
                  allocated={allocatedAmounts.savings}
                  spent={categorySpending.savings}
                  variant="savings"
                />
                <CategoryProgressCard
                  title="Investments"
                  icon={TrendingUp}
                  allocated={allocatedAmounts.investments}
                  spent={categorySpending.investments}
                  variant="investments"
                />
              </div>

              {/* Overall Summary */}
              <Card className="shadow-card bg-gradient-to-r from-primary/5 to-success/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Monthly Budget Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Allocated</p>
                      <p className="text-2xl font-bold text-primary">₹{calculatedTotalBudget.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-bold text-destructive">₹{totalSpent.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Budget - Need - Savings - Investments</p>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Saved</p>
                      <p className="text-2xl font-bold text-success">₹{totalSaved.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className="text-2xl font-bold text-accent">₹{(calculatedTotalBudget - categorySpending.need - categorySpending.want).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="need">
            <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Home className="h-6 w-6" />
                    Need (Essential Expenses)
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track your essential expenses like rent, utilities, groceries, insurance
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <CategoryProgressCard
                      title="Need Progress"
                      icon={Home}
                      allocated={allocatedAmounts.need}
                      spent={categorySpending.need}
                      variant="need"
                    />
                  </div>
                  <ExpenseEntryDialog category="need" categoryTitle="Need" icon={Home} />
                  <ExpenseTable category="need" categoryTitle="Need" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="want">
            <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warning">
                    <Music className="h-6 w-6" />
                    Want (Discretionary Expenses)
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track your discretionary spending like entertainment, dining out, hobbies
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <CategoryProgressCard
                      title="Want Progress"
                      icon={Music}
                      allocated={allocatedAmounts.want}
                      spent={categorySpending.want}
                      variant="want"
                    />
                  </div>
                  <ExpenseEntryDialog category="want" categoryTitle="Want" icon={Music} />
                  <ExpenseTable category="want" categoryTitle="Want" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="savings">
            <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <PiggyBank className="h-6 w-6" />
                    Savings (Emergency Fund)
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track your savings contributions and emergency fund building
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <CategoryProgressCard
                      title="Savings Progress"
                      icon={PiggyBank}
                      allocated={allocatedAmounts.savings}
                      spent={categorySpending.savings}
                      variant="savings"
                    />
                  </div>
                  <ExpenseEntryDialog category="savings" categoryTitle="Savings" icon={PiggyBank} />
                  <ExpenseTable category="savings" categoryTitle="Savings" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="investments">
            <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <TrendingUp className="h-6 w-6" />
                    Investments (Long-term Growth)
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track your investment contributions like stocks, mutual funds, retirement
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <CategoryProgressCard
                      title="Investment Progress"
                      icon={TrendingUp}
                      allocated={allocatedAmounts.investments}
                      spent={categorySpending.investments}
                      variant="investments"
                    />
                  </div>
                  <ExpenseEntryDialog category="investments" categoryTitle="Investments" icon={TrendingUp} />
                  <ExpenseTable category="investments" categoryTitle="Investments" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="wife-expenses">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Wife's Daily Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Wife's expense tracking coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <SalaryConfig 
              onSalaryUpdate={handleSalaryUpdate}
              currentSalary={actualSalary}
              currentBudgetPercentage={budgetPercentage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BudgetDashboard;