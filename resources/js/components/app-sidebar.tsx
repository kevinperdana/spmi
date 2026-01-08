import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, ClipboardList, FileText, Folder, Home, Image, LayoutGrid, Menu, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Home Sections',
        href: { url: '/home-sections', method: 'get' },
        icon: Home,
    },
    {
        title: 'Pages',
        href: { url: '/pages', method: 'get' },
        icon: FileText,
    },
    {
        title: 'Media',
        href: { url: '/media', method: 'get' },
        icon: Image,
    },
    {
        title: 'User Management',
        href: { url: '/users', method: 'get' },
        icon: Users,
    },
    {
        title: 'Form AMI',
        href: { url: '/ami-forms', method: 'get' },
        icon: ClipboardList,
    },
    {
        title: 'Menu Management',
        href: { url: '/menu-items', method: 'get' },
        icon: Menu,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const role = auth?.user?.role;
    const isRestricted = role === 'auditie' || role === 'auditor';
    const visibleMainNavItems = isRestricted
        ? mainNavItems.filter((item) => item.title === 'Dashboard')
        : mainNavItems;
    const visibleFooterNavItems = isRestricted ? [] : footerNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleMainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={visibleFooterNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
