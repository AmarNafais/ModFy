import { Link, useRoute } from "wouter";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    BarChart3,
    Bell,
    Settings,
    ChevronDown,
    Ruler,
    Mail,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    subItems?: NavItem[];
}

const navItems: NavItem[] = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
        label: "Products",
        href: "/admin/products",
        icon: <Package className="h-4 w-4" />,
        subItems: [
            {
                label: "Product List",
                href: "/admin/products",
                icon: null,
            },
            {
                label: "Categories",
                href: "/admin/categories",
                icon: null,
            },
            {
                label: "Size Charts",
                href: "/admin/size-charts",
                icon: null,
            },
        ],
    },
    {
        label: "Orders",
        href: "/admin/orders",
        icon: <ShoppingBag className="h-4 w-4" />,
    },
    {
        label: "Users",
        href: "/admin/users",
        icon: <Users className="h-4 w-4" />,
    },
    {
        label: "Analytics",
        href: "/admin/analytics",
        icon: <BarChart3 className="h-4 w-4" />,
    },
    {
        label: "Contact Us",
        href: "/admin/contact",
        icon: <Mail className="h-4 w-4" />,
    },
];

interface AdminLayoutProps {
    children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const [expandedItems, setExpandedItems] = useState<string[]>(["Products"]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleExpanded = (label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((item) => item !== label)
                : [...prev, label]
        );
    };

    return (
        <>
            <Header onCartOpen={() => setIsCartOpen(true)} />
            <div className="min-h-screen bg-gray-50 pt-16">
                {/* Sidebar */}
                <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-white">
                    <div className="flex h-full flex-col">
                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto p-4">
                            <ul className="space-y-1">
                                {navItems.map((item) => (
                                    <NavItemComponent
                                        key={item.label}
                                        item={item}
                                        expanded={expandedItems.includes(item.label)}
                                        onToggle={() => toggleExpanded(item.label)}
                                    />
                                ))}
                            </ul>
                        </nav>

                        {/* Settings */}
                        <div className="border-t p-4">
                            <Link href="/admin/settings">
                                <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <Settings className="h-4 w-4" />
                                    <span>Settings</span>
                                </a>
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="ml-64">
                    <main className="min-h-screen p-8">{children}</main>
                </div>
            </div>
        </>
    );
}

interface NavItemComponentProps {
    item: NavItem;
    expanded?: boolean;
    onToggle?: () => void;
    isSubItem?: boolean;
}

function NavItemComponent({
    item,
    expanded,
    onToggle,
    isSubItem = false,
}: NavItemComponentProps) {
    const [isActive] = useRoute(item.href);
    const hasSubItems = item.subItems && item.subItems.length > 0;

    if (hasSubItems) {
        return (
            <li>
                <button
                    onClick={onToggle}
                    className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100",
                        isActive && "bg-primary/10 text-primary"
                    )}
                >
                    <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                    </div>
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 transition-transform",
                            expanded && "rotate-180"
                        )}
                    />
                </button>
                {expanded && (
                    <ul className="ml-4 mt-1 space-y-1 border-l pl-4">
                        {item.subItems?.map((subItem) => (
                            <NavItemComponent
                                key={subItem.label}
                                item={subItem}
                                isSubItem
                            />
                        ))}
                    </ul>
                )}
            </li>
        );
    }

    return (
        <li>
            <Link href={item.href}>
                <a
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100",
                        isActive && "bg-primary/10 text-primary font-medium",
                        isSubItem && "text-xs"
                    )}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </a>
            </Link>
        </li>
    );
}
