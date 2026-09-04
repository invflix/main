import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Boxes,
  Building2,
  ChevronDown,
  ChevronRight,
  Coins,
  FileSpreadsheet,
  GitBranch,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCircle,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "./ui/sidebar";

type NavChild = {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
};

type NavItem = NavChild & {
  id?: string;
  children?: NavChild[];
};

export const Layout: React.FC = () => {
  const {
    user,
    organization,
    role,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    logout,
    impersonatedOrg,
    setImpersonatedOrg,
  } = useAuth();

  const location = useLocation();
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    inventory: true,
    organization: true,
  });

  const operationsMenu: NavItem[] = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    {
      id: "inventory",
      name: "Inventory",
      path: "/inventory",
      icon: Boxes,
      children: [
        { name: "Stock List", path: "/inventory", icon: Boxes },
        { name: "Expiry Tracking", path: "/inventory/expiry", icon: Activity, badge: 6 },
        { name: "Import Inventory", path: "/inventory/import", icon: FileSpreadsheet },
      ],
    },
    { name: "Insurance Claims", path: "/claims", icon: ShieldCheck },
    { name: "Sales", path: "/sales", icon: Coins },
  ];

  const insightsMenu: NavItem[] = [{ name: "Analytics", path: "/analytics", icon: BarChart3 }];

  const adminMenu: NavItem[] = [
    {
      id: "organization",
      name: "Organization",
      path: "/branches",
      icon: Building2,
      children: [
        { name: "Branches", path: "/branches", icon: GitBranch },
        { name: "Team", path: "/team", icon: Users },
        { name: "Settings", path: "/settings", icon: Settings },
      ],
    },
  ];

  const handleBranchChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranchId(event.target.value);
  };

  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId);
  const branchLabel = selectedBranchId === "all" ? "All Branches" : selectedBranch?.name || "Select branch";
  const accountInitial = user?.full_name?.charAt(0) ?? "U";

  const renderChildItem = (child: NavChild) => {
    const ChildIcon = child.icon;
    const isActive = location.pathname === child.path;

    return (
      <SidebarMenuButton key={child.name} asChild data-active={isActive} className="h-8 rounded-lg pl-3 text-xs">
        <Link to={child.path}>
          <ChildIcon className="h-3.5 w-3.5" />
          <span className="truncate">{child.name}</span>
          {child.badge !== undefined && child.badge > 0 && (
            <Badge
              className={`ml-auto h-5 rounded-md px-1.5 text-[10px] ${
                isActive
                  ? "border-white/20 bg-white/15 text-white hover:bg-white/15"
                  : "border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
              }`}
            >
              {child.badge}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    );
  };

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <SidebarGroup>
      <SidebarGroupLabel className="px-2 text-[11px] tracking-[0.14em] text-slate-400">{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          const childIsActive = item.children?.some((child) => location.pathname === child.path) ?? false;
          const isActive = item.children ? childIsActive : location.pathname.startsWith(item.path);
          const isOpen = item.id ? openSections[item.id] || childIsActive : false;

          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <button
                  type="button"
                  data-active={isActive}
                  onClick={() =>
                    item.id &&
                    setOpenSections((current) => ({
                      ...current,
                      [item.id as string]: !current[item.id as string],
                    }))
                  }
                  className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 data-[active=true]:bg-slate-100 data-[active=true]:text-slate-950"
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{item.name}</span>
                  <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>
                <div
                  className={`grid transition-[grid-template-rows,opacity,transform] duration-200 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100 translate-y-0" : "grid-rows-[0fr] opacity-0 -translate-y-1"
                  }`}
                >
                  <div className="ml-4 min-h-0 overflow-hidden border-l border-slate-200 pl-3">
                    <div className="space-y-1 py-1">{item.children.map(renderChildItem)}</div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <SidebarMenuButton
              key={item.name}
              asChild
              data-active={isActive}
              className="rounded-lg text-slate-600 data-[active=true]:bg-slate-100 data-[active=true]:text-slate-950 data-[active=true]:shadow-none"
            >
              <Link to={item.path}>
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.name}</span>
              </Link>
            </SidebarMenuButton>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );

  return (
    <div className="min-h-screen bg-[#f6f8fb] font-sans text-foreground">
      {impersonatedOrg && (
        <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm lg:px-8">
          <span>SUPER ADMIN MODE: Viewing {organization?.name}</span>
          <button
            type="button"
            onClick={() => setImpersonatedOrg(null)}
            className="font-semibold underline transition-all hover:text-white/80"
          >
            Exit Organisation View
          </button>
        </div>
      )}

      <div className="grid min-h-screen lg:grid-cols-[17rem_1fr]">
        <Sidebar className="fixed inset-y-0 left-0 z-20 hidden w-[17rem] border-slate-200 bg-card/95 backdrop-blur lg:flex">
          <SidebarHeader className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FAF8F7] shadow-sm p-1.5 border border-slate-200">
                <svg viewBox="0 0 24 24" className="h-full w-full" fill="none">
                  {/* Bar 1: Deep Navy */}
                  <rect x="3" y="13" width="2.5" height="7" rx="1.25" fill="#1E3949" />
                  {/* Bar 2: Primary Navy */}
                  <rect x="7" y="9" width="2.5" height="11" rx="1.25" fill="#29495C" />
                  {/* Bar 3: Primary Teal */}
                  <rect x="11" y="4" width="2.5" height="16" rx="1.25" fill="#69A6AD" />
                  {/* Triangle / Play: Soft Teal */}
                  <path d="M15 6.5 L21 12 L15 17.5 Z" fill="#9CC7CB" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="block truncate text-base font-bold tracking-tight text-slate-950 font-display">Invflix</span>
                <p className="truncate text-xs font-medium text-slate-500 font-sans">Inventory analytics</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-4">
            <nav>
              {renderNavGroup("Operations", operationsMenu)}
              {renderNavGroup("Insights", insightsMenu)}
              {renderNavGroup("Admin", adminMenu)}
            </nav>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 bg-slate-50/70 p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg border bg-card p-2.5 text-left shadow-sm transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-white">
                    {accountInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-950">{user?.full_name || "Unknown User"}</p>
                    <p className="truncate text-xs font-medium text-slate-500">{organization?.name || "No Organization"}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-64">
                <DropdownMenuLabel>
                  <div className="space-y-1">
                    <p className="truncate text-sm font-bold text-foreground">{user?.full_name || "Unknown User"}</p>
                    <p className="truncate text-xs font-medium text-muted-foreground">{user?.email || "No email"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <p className="truncate text-xs font-semibold text-foreground">{organization?.name || "No Organization"}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {role || "No Role"} · {branches.length} branch{branches.length !== 1 && "es"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <UserCircle className="h-4 w-4" />
                    Manage user profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/branches">
                    <Building2 className="h-4 w-4" />
                    Manage organization
                  </Link>
                </DropdownMenuItem>
                {user?.is_platform_admin && (
                  <DropdownMenuItem asChild>
                    <Link to="/super-admin">
                      <ShieldCheck className="h-4 w-4" />
                      Manage organizations
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex min-h-screen flex-col lg:col-start-2">
          <header className="sticky top-0 z-10 flex min-h-16 flex-col gap-3 border-b border-slate-200 bg-card/90 px-4 py-3 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open sidebar">
                <PanelLeft className="h-4 w-4" />
              </Button>
              <div className="hidden min-w-0 sm:block">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active branch</p>
                <p className="truncate text-sm font-bold text-slate-950">{branchLabel}</p>
              </div>
              <select
                value={selectedBranchId ?? ""}
                onChange={handleBranchChange}
                className="h-10 min-w-44 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {role === "OWNER" && <option value="all">All Branches</option>}
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.branch_code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search inventory, claims, sales..."
                  className="h-10 w-72 rounded-lg border-slate-200 bg-slate-50 pl-9 shadow-sm xl:w-96"
                />
              </div>
              <Button variant="outline" size="sm" className="h-10 rounded-lg bg-card">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                Insights
              </Button>
              <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out" title="Log out" className="h-10 w-10">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <main key={location.pathname} className="page-transition flex-1 p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
