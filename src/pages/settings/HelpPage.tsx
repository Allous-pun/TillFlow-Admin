import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Plus, Save, Trash2, Edit, BookOpen, Video, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'pdf';
  url: string;
  category: string;
}

const mockFAQs: FAQ[] = [
  {
    id: 'faq-1',
    question: 'How do I create a new business account?',
    answer: 'To create a new business account, go to the Businesses page and click the "Add Business" button. Fill in all required information including business name, type, and location. Once submitted, your business will be pending approval.',
    category: 'Getting Started',
    order: 1
  },
  {
    id: 'faq-2',
    question: 'What payment methods are supported?',
    answer: 'TillFlow supports various payment methods including credit/debit cards, bank transfers, mobile money, and digital wallets. The available methods depend on your business location and configuration.',
    category: 'Payments',
    order: 2
  },
  {
    id: 'faq-3',
    question: 'How do I generate API tokens?',
    answer: 'Navigate to the Tokenization page in your admin dashboard. Click "Generate Token", provide a name and description, and the system will create a secure token for API integration.',
    category: 'Security',
    order: 3
  },
  {
    id: 'faq-4',
    question: 'How can I activate or deactivate users?',
    answer: 'In the Users management page, locate the user you want to manage. Click the three-dot menu next to their name and select either "Activate" or "Deactivate". Deactivated users cannot log in until reactivated.',
    category: 'User Management',
    order: 4
  },
  {
    id: 'faq-5',
    question: 'What should I do if I forget my password?',
    answer: 'On the login page, click "Forgot Password" and enter your registered email address. You will receive a password reset link via email. Follow the instructions to create a new password.',
    category: 'Account',
    order: 5
  }
];

const mockGuides: Guide[] = [
  {
    id: 'guide-1',
    title: 'Getting Started with TillFlow',
    description: 'A comprehensive guide to set up your account and start accepting payments',
    type: 'article',
    url: '#',
    category: 'Getting Started'
  },
  {
    id: 'guide-2',
    title: 'API Integration Tutorial',
    description: 'Step-by-step video tutorial on integrating TillFlow API into your application',
    type: 'video',
    url: '#',
    category: 'Development'
  },
  {
    id: 'guide-3',
    title: 'Security Best Practices',
    description: 'Learn how to secure your account and protect sensitive data',
    type: 'pdf',
    url: '#',
    category: 'Security'
  },
  {
    id: 'guide-4',
    title: 'Managing Transactions',
    description: 'How to view, filter, and manage your business transactions',
    type: 'article',
    url: '#',
    category: 'Payments'
  }
];

export default function HelpPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [faqs, setFaqs] = useState<FAQ[]>(mockFAQs);
  const [guides, setGuides] = useState<Guide[]>(mockGuides);
  const [createFAQDialogOpen, setCreateFAQDialogOpen] = useState(false);
  const [createGuideDialogOpen, setCreateGuideDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'faq' | 'guide', id: string } | null>(null);

  const [newFAQ, setNewFAQ] = useState({
    question: '',
    answer: '',
    category: 'Getting Started'
  });

  const [newGuide, setNewGuide] = useState({
    title: '',
    description: '',
    type: 'article' as Guide['type'],
    url: '',
    category: 'Getting Started'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleCreateFAQ = () => {
    if (!newFAQ.question || !newFAQ.answer) {
      toast({
        title: "Validation Error",
        description: "Question and answer are required",
        variant: "destructive"
      });
      return;
    }

    const faq: FAQ = {
      id: `faq-${Date.now()}`,
      ...newFAQ,
      order: faqs.length + 1
    };

    setFaqs([...faqs, faq]);
    setCreateFAQDialogOpen(false);
    setNewFAQ({ question: '', answer: '', category: 'Getting Started' });
    toast({
      title: "FAQ Created",
      description: "New FAQ has been added successfully"
    });
  };

  const handleUpdateFAQ = () => {
    if (!editingFAQ) return;

    setFaqs(faqs.map(faq => faq.id === editingFAQ.id ? editingFAQ : faq));
    setEditingFAQ(null);
    toast({
      title: "FAQ Updated",
      description: "FAQ has been updated successfully"
    });
  };

  const handleCreateGuide = () => {
    if (!newGuide.title || !newGuide.description || !newGuide.url) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    const guide: Guide = {
      id: `guide-${Date.now()}`,
      ...newGuide
    };

    setGuides([...guides, guide]);
    setCreateGuideDialogOpen(false);
    setNewGuide({ title: '', description: '', type: 'article', url: '', category: 'Getting Started' });
    toast({
      title: "Guide Created",
      description: "New guide has been added successfully"
    });
  };

  const handleDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'faq') {
      setFaqs(faqs.filter(faq => faq.id !== itemToDelete.id));
    } else {
      setGuides(guides.filter(guide => guide.id !== itemToDelete.id));
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
    toast({
      title: "Item Deleted",
      description: `${itemToDelete.type === 'faq' ? 'FAQ' : 'Guide'} has been removed`
    });
  };

  const categories = [...new Set([...faqs.map(f => f.category), ...guides.map(g => g.category)])];

  const getGuideIcon = (type: Guide['type']) => {
    switch (type) {
      case 'article': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'pdf': return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help & Documentation</h1>
          <p className="text-muted-foreground">
            Manage FAQs, guides, and documentation for users
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{faqs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Guides</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{guides.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Manage common questions and answers</CardDescription>
              </div>
              <Dialog open={createFAQDialogOpen} onOpenChange={setCreateFAQDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add FAQ
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New FAQ</DialogTitle>
                    <DialogDescription>Add a new frequently asked question</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newFAQ.category}
                        onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                        placeholder="e.g., Getting Started"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="question">Question</Label>
                      <Input
                        id="question"
                        value={newFAQ.question}
                        onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                        placeholder="Enter the question"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="answer">Answer</Label>
                      <Textarea
                        id="answer"
                        value={newFAQ.answer}
                        onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                        placeholder="Enter the answer"
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateFAQDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateFAQ}>Create FAQ</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {categories.map(category => {
                const categoryFAQs = faqs.filter(faq => faq.category === category);
                if (categoryFAQs.length === 0) return null;
                
                return (
                  <div key={category} className="mb-4">
                    <h3 className="font-semibold mb-2 text-sm text-muted-foreground">{category}</h3>
                    {categoryFAQs.map((faq, index) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <div className="flex items-center gap-2">
                          <AccordionTrigger className="flex-1">{faq.question}</AccordionTrigger>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingFAQ(faq)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setItemToDelete({ type: 'faq', id: faq.id });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </div>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>

        {/* Guides Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Help Guides & Tutorials</CardTitle>
                <CardDescription>Manage detailed guides and documentation</CardDescription>
              </div>
              <Dialog open={createGuideDialogOpen} onOpenChange={setCreateGuideDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Guide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Guide</DialogTitle>
                    <DialogDescription>Add a new help guide or tutorial</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="guideCategory">Category</Label>
                        <Input
                          id="guideCategory"
                          value={newGuide.category}
                          onChange={(e) => setNewGuide({ ...newGuide, category: e.target.value })}
                          placeholder="e.g., Getting Started"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <select
                          id="type"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          value={newGuide.type}
                          onChange={(e) => setNewGuide({ ...newGuide, type: e.target.value as Guide['type'] })}
                        >
                          <option value="article">Article</option>
                          <option value="video">Video</option>
                          <option value="pdf">PDF</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newGuide.title}
                        onChange={(e) => setNewGuide({ ...newGuide, title: e.target.value })}
                        placeholder="Guide title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newGuide.description}
                        onChange={(e) => setNewGuide({ ...newGuide, description: e.target.value })}
                        placeholder="Brief description"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        value={newGuide.url}
                        onChange={(e) => setNewGuide({ ...newGuide, url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateGuideDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateGuide}>Create Guide</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map(category => {
                const categoryGuides = guides.filter(guide => guide.category === category);
                if (categoryGuides.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="font-semibold mb-3 text-sm text-muted-foreground">{category}</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {categoryGuides.map(guide => (
                        <div key={guide.id} className="flex items-start gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                          <div className={`p-2 rounded-lg ${
                            guide.type === 'article' ? 'bg-blue-500/10 text-blue-600' :
                            guide.type === 'video' ? 'bg-purple-500/10 text-purple-600' :
                            'bg-green-500/10 text-green-600'
                          }`}>
                            {getGuideIcon(guide.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{guide.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{guide.description}</p>
                            <Badge variant="outline" className="mt-2">
                              {guide.type}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setItemToDelete({ type: 'guide', id: guide.id });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Edit FAQ Dialog */}
        <Dialog open={!!editingFAQ} onOpenChange={(open) => !open && setEditingFAQ(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit FAQ</DialogTitle>
              <DialogDescription>Update the question and answer</DialogDescription>
            </DialogHeader>
            {editingFAQ && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editCategory">Category</Label>
                  <Input
                    id="editCategory"
                    value={editingFAQ.category}
                    onChange={(e) => setEditingFAQ({ ...editingFAQ, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editQuestion">Question</Label>
                  <Input
                    id="editQuestion"
                    value={editingFAQ.question}
                    onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editAnswer">Answer</Label>
                  <Textarea
                    id="editAnswer"
                    value={editingFAQ.answer}
                    onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingFAQ(null)}>Cancel</Button>
              <Button onClick={handleUpdateFAQ} className="gap-2">
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
              <AlertDialogTitle>Delete {itemToDelete?.type === 'faq' ? 'FAQ' : 'Guide'}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
