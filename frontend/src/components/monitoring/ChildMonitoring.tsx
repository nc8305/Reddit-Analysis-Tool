import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { FilterBar } from "../shared/FilterBar";
import { RiskIndicator, RiskLevel } from "../shared/RiskIndicator";
import { SubredditCard } from "../shared/SubredditCard";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  ExternalLink,
  FileDown,
  MessageSquare,
  FileText,
  AlertTriangle,
  Loader2,
  Plus,
  Trash2,
  UserPlus
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

// Interface for Child (Backend)
interface Child {
  id: number;
  name: string;
  age: number;
  reddit_username: string;
  avatar_url?: string;
}

// Interface for Interaction (New API)
interface Interaction {
  id: string;
  type: "post" | "comment";
  content: string;
  subreddit: string;
  timestamp: string;
  score: number;
  sentiment: string;
  risk: RiskLevel;
  url: string;
}

// Interface for Subreddit Data (PRAW)
interface SubredditData {
  name: string;
  activityLevel: number;
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  riskRationale: string;
  dominantTopics: string[];
  url: string;
}

export function ChildMonitoring() {
  // --- STATES ---
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [interactionsList, setInteractionsList] = useState<Interaction[]>([]);
  const [subredditsList, setSubredditsList] = useState<SubredditData[]>([]);
  
  // Loading States for separate sections
  const [isFetchingInteractions, setIsFetchingInteractions] = useState(false);
  const [isFetchingSubreddits, setIsFetchingSubreddits] = useState(false);

  // Add Child Form States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("");
  const [newChildUsername, setNewChildUsername] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Filter States
  const [searchValue, setSearchValue] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("7days");
  const [subredditFilter, setSubredditFilter] = useState("all");
  const [anonymizeReport, setAnonymizeReport] = useState(false);

  // --- FUNCTIONS ---

  // 1. Fetch Child List
  const fetchChildren = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:8000/api/children/", {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setChildrenList(data);
        
        // Default selection logic
        if (data.length > 0) {
            const currentExists = data.find((c: Child) => c.id.toString() === selectedChildId);
            if (!selectedChildId || !currentExists) {
                setSelectedChildId(data[0].id.toString());
            }
        } else {
            setSelectedChildId("");
            setInteractionsList([]);
            setSubredditsList([]);
        }
      }
    } catch (error) {
      toast.error("Server connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch Interactions (Posts/Comments)
  const fetchInteractions = async () => {
    if (!selectedChildId) return;
    setIsFetchingInteractions(true);
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8000/api/children/${selectedChildId}/interactions`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setInteractionsList(data);
        } else {
            setInteractionsList([]);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsFetchingInteractions(false);
    }
  };

  // 3. Fetch Reddit Data (Subreddits via PRAW)
  const fetchSubreddits = async () => {
    if (!selectedChildId) return;
    
    setIsFetchingSubreddits(true);
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8000/api/children/${selectedChildId}/subreddits`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            setSubredditsList(data);
        } else {
            setSubredditsList([]);
        }
    } catch (error) {
        console.error("Error fetching Reddit data:", error);
    } finally {
        setIsFetchingSubreddits(false);
    }
  };

  // 4. Add New Child
  const handleAddChild = async () => {
    if (!newChildName || !newChildUsername) {
        toast.error("Please enter a name and Reddit username.");
        return;
    }

    setIsAdding(true);
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/api/children/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: newChildName,
                age: parseInt(newChildAge) || 0,
                reddit_username: newChildUsername.replace("u/", "") // Strip u/ if present
            })
        });

        if (response.ok) {
            toast.success("Account added successfully!");
            setIsAddDialogOpen(false);
            setNewChildName("");
            setNewChildAge("");
            setNewChildUsername("");
            fetchChildren(); // Reload list
        } else {
            const err = await response.json();
            toast.error(err.detail || "Failed to add account.");
        }
    } catch (e) {
        toast.error("Connection error.");
    } finally {
        setIsAdding(false);
    }
  };

  // 5. Delete Child
  const handleDeleteChild = async () => {
    if (!selectedChildId) return;

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8000/api/children/${selectedChildId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
            toast.success("Account deleted successfully.");
            fetchChildren(); // Reload list
        } else {
            toast.error("Failed to delete account.");
        }
    } catch (e) {
        toast.error("Connection error.");
    }
  };

  // --- EFFECTS ---

  // Initial fetch
  useEffect(() => {
    fetchChildren();
  }, []);

  // Fetch data when selected child changes
  useEffect(() => {
    fetchInteractions();
    fetchSubreddits();
  }, [selectedChildId]);

  const currentChild = childrenList.find(c => c.id.toString() === selectedChildId);

  // --- UI LOADING ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <p className="text-muted-foreground">Loading data...</p>
      </div>
    );
  }

  // --- UI EMPTY (NO CHILDREN) ---
  if (!isLoading && childrenList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="p-5 bg-red-50 rounded-full">
            <UserPlus className="h-12 w-12 text-red-500" />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Welcome to Reddit Monitor</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
            You are not monitoring any accounts. Add your child's Reddit account to start.
            </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 gap-2 shadow-lg shadow-red-200">
                    <Plus className="h-4 w-4" /> Add First Account
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Profile</DialogTitle>
                    <DialogDescription>Enter the exact Reddit username for the system to scan.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Display Name</Label>
                        <Input placeholder="Ex: Son, Alex" value={newChildName} onChange={(e) => setNewChildName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Age</Label>
                        <Input type="number" placeholder="15" value={newChildAge} onChange={(e) => setNewChildAge(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Reddit Username</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">u/</span>
                            <Input className="pl-8" placeholder="username123" value={newChildUsername} onChange={(e) => setNewChildUsername(e.target.value)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddChild} disabled={isAdding} className="bg-red-600 hover:bg-red-700">
                        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Account"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    );
  }

  // --- MAIN UI ---
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-red-50 to-white p-6 rounded-2xl border border-red-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Activity Monitor
          </h1>
          <p className="text-red-800/80 mt-1">
            Viewing data for <span className="font-semibold text-red-700">{currentChild?.name}</span> (u/{currentChild?.reddit_username})
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border shadow-sm">
          <Avatar className="h-10 w-10 border-2 border-red-100">
            <AvatarFallback className="bg-red-50 text-red-600 font-bold">
              {currentChild?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex items-center gap-2">
            {/* Child Dropdown */}
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger className="w-[180px] h-8 border-none shadow-none bg-transparent focus:ring-0">
                    <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                    {childrenList.map((child) => (
                    <SelectItem key={child.id} value={child.id.toString()}>
                        {child.name}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Add Button */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Plus className="h-5 w-5" /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Profile</DialogTitle>
                        <DialogDescription>Enter the Reddit username to monitor.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Name</Label>
                            <Input placeholder="Ex: My Son" value={newChildName} onChange={(e) => setNewChildName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Age</Label>
                            <Input type="number" placeholder="15" value={newChildAge} onChange={(e) => setNewChildAge(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Reddit Username</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">u/</span>
                                <Input className="pl-8" placeholder="username123" value={newChildUsername} onChange={(e) => setNewChildUsername(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddChild} disabled={isAdding} className="bg-red-600 hover:bg-red-700">
                            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Button */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will remove <strong>{currentChild?.name}</strong> from your monitoring list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteChild} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="interactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="interactions" className="rounded-lg">Interactions</TabsTrigger>
          <TabsTrigger value="subreddits" className="rounded-lg">Subreddits</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg">Reports</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: INTERACTIONS --- */}
        <TabsContent value="interactions" className="space-y-6 mt-0">
          <Card className="border-t-4 border-t-red-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-red-500" />
                Activity Timeline
              </CardTitle>
              <CardDescription>Recent posts and comments from u/{currentChild?.reddit_username}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FilterBar searchValue={searchValue} onSearchChange={setSearchValue} showRiskFilter riskFilter={riskFilter} onRiskFilterChange={setRiskFilter} />

              {isFetchingInteractions ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-red-600"/></div>
              ) : interactionsList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No recent interaction data found.</div>
              ) : (
                  <div className="space-y-4">
                    {interactionsList.map((interaction) => (
                      <div key={interaction.id} className="relative group p-4 rounded-xl border bg-card transition-all hover:shadow-md">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Badge variant="outline" className="bg-white">
                                        {interaction.type === 'post' ? <FileText className="h-3 w-3 mr-1"/> : <MessageSquare className="h-3 w-3 mr-1"/>}
                                        {interaction.type === 'post' ? "Post" : "Comment"}
                                    </Badge>
                                    <span>in <span className="font-semibold text-foreground">{interaction.subreddit}</span></span>
                                    <span>• {interaction.timestamp}</span>
                                </div>
                                <RiskIndicator level={interaction.risk} showIcon={true} />
                            </div>
                            <p className="text-base text-foreground/90 pl-1 border-l-2 border-muted">
                                "{interaction.content}"
                            </p>
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium uppercase text-muted-foreground">Sentiment</span>
                                    <Badge variant="secondary" className={interaction.sentiment === 'Negative' ? 'bg-red-100 text-red-700' : ''}>
                                        {interaction.sentiment}
                                    </Badge>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => window.open(interaction.url, "_blank")}>
                                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> View on Reddit
                                </Button>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2: SUBREDDITS --- */}
        <TabsContent value="subreddits" className="space-y-6 mt-0">
            {isFetchingSubreddits ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-red-600" />
                    <p className="text-muted-foreground">Analyzing Reddit data for u/{currentChild?.reddit_username}...</p>
                </div>
            ) : subredditsList.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50">
                    <p className="text-muted-foreground">No community participation found. This account may not have public activity.</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-semibold text-slate-700">Top 10 Most Active Communities</h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {subredditsList.map((sub, index) => (
                            <SubredditCard key={index} {...sub} />
                        ))}
                    </div>
                </>
            )}
        </TabsContent>

        {/* --- TAB 3: REPORTS --- */}
        <TabsContent value="reports" className="space-y-6 mt-0">
            <Card className="shadow-sm">
                <CardHeader><CardTitle>Export Report</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                         <Checkbox id="anon" checked={anonymizeReport} onCheckedChange={(c) => setAnonymizeReport(c as boolean)}/>
                         <label htmlFor="anon">Anonymize username</label>
                    </div>
                    <Button className="bg-red-600"><FileDown className="mr-2 h-4 w-4"/> Download PDF</Button>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}