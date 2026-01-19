import React, { useRef, useEffect, useState, useMemo } from "react";
import SidebarLogo from "./Logo";
import Navmenu from "./Navmenu";
import { menuItems } from "@/mocks/data";
import SimpleBar from "simplebar-react";
import useSidebar from "@/hooks/useSidebar";
import useSemiDark from "@/hooks/useSemiDark";
import { useAuth } from "@/contexts/AuthContext";
import svgRabitImage from "@/assets/images/svg/rabit.svg";
import clsx from "clsx";

const Sidebar = () => {
  const scrollableNodeRef = useRef();
  const [scroll, setScroll] = useState(false);
  const { user } = useAuth();
  
  // Map menu links to permission values - ALL pages require permissions
  const linkToPermissionMap = {
    // Ecommerce section
    'dashboard': 'dashboard',
    'customers': 'customers',
    'products': 'products',
    'categories': 'categories',
    'banners': 'banners',
    'orders': 'orders',
    'invoices': 'invoices',
    'return-refunds': 'return-refunds',
    // Investment section
    'investment-orders': 'investment-orders',
    'autopay-subscriptions': 'autopay-subscriptions',
    'investment-invoices': 'investment-invoices',
    // Settings section
    'investment-settings': 'investment-settings',
    'shipment-settings': 'shipment-settings',
    'appointments': 'appointments',
    // Support section
    'support-tickets': 'support-tickets',
    'notifications': 'notifications',
    'referred-users': 'referred-users',
    // Admin settings section
    'admin-profile': 'admin-profile',
    'admin-list': 'admin-list',
    'maintenance': 'maintenance',
    // Policy settings section
    'privacy-policy': 'privacy-policy',
    'return-policy': 'return-policy',
    'shipping-policy': 'shipping-policy',
    'cancellation-policy': 'cancellation-policy',
    'grievance-policy': 'grievance-policy',
    'digigold-redemption-policy': 'digigold-redemption-policy',
    'terms-and-conditions': 'terms-and-conditions',
  };

  // Filter menu items based on admin permissions
  const filteredMenuItems = useMemo(() => {
    // Super admin sees everything
    if (user?.role === 'super_admin') {
      return menuItems;
    }

    // Get admin permissions (from token or user object)
    const adminPermissions = user?.permissions || [];
    
    // If no permissions array, show all (for backward compatibility)
    if (!Array.isArray(adminPermissions) || adminPermissions.length === 0) {
      return menuItems;
    }

    // Helper function to check if a menu item should be visible
    const isItemVisible = (item) => {
      // Headers are not items, skip them
      if (item.isHeadr) {
        return false;
      }

      // Check if item has children
      if (item.child && Array.isArray(item.child)) {
        // Filter children based on permissions
        const visibleChildren = item.child.filter((child) => {
          const permission = linkToPermissionMap[child.childlink];
          // If no permission mapping, don't show it (require explicit permission)
          if (permission === null || permission === undefined) {
            return false;
          }
          // Check if admin has this permission
          return adminPermissions.includes(permission);
        });
        // Only show parent if it has at least one visible child
        return visibleChildren.length > 0;
      }

      // Check single menu items
      if (item.link) {
        const permission = linkToPermissionMap[item.link];
        // If no permission mapping, don't show it (require explicit permission)
        if (permission === null || permission === undefined) {
          return false;
        }
        // Check if admin has this permission
        return adminPermissions.includes(permission);
      }

      // Items without links should not be shown
      return false;
    };

    // Group items by their preceding header
    const groupedItems = [];
    let currentGroup = { header: null, items: [] };

    menuItems.forEach((item) => {
      if (item.isHeadr) {
        // Save previous group if it has items (or if it's just a header with no items yet)
        if (currentGroup.items.length > 0 || (currentGroup.header && currentGroup.items.length === 0)) {
          // Only add group if it has items (empty groups with headers will be filtered out later)
          if (currentGroup.items.length > 0) {
            groupedItems.push(currentGroup);
          }
        }
        // Start new group with this header
        currentGroup = { header: item, items: [] };
      } else {
        // Add item to current group
        currentGroup.items.push(item);
      }
    });

    // Don't forget the last group (only if it has items)
    if (currentGroup.items.length > 0) {
      groupedItems.push(currentGroup);
    }

    // Filter groups: only show groups that have at least one visible item
    const filtered = [];
    groupedItems.forEach((group) => {
      const visibleItems = group.items.filter(isItemVisible);

      // Only show group if it has visible items
      if (visibleItems.length > 0) {
        // Add header if it exists
        if (group.header) {
          filtered.push(group.header);
        }

          // Add visible items (with filtered children if applicable)
          visibleItems.forEach((item) => {
            if (item.child && Array.isArray(item.child)) {
              const filteredChildren = item.child.filter((child) => {
                const permission = linkToPermissionMap[child.childlink];
                // If no permission mapping, don't show it
                if (permission === null || permission === undefined) {
                  return false;
                }
                return adminPermissions.includes(permission);
              });
              filtered.push({ ...item, child: filteredChildren });
            } else {
              filtered.push(item);
            }
          });
      }
    });

    return filtered;
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollableNodeRef.current.scrollTop > 0) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };
    scrollableNodeRef.current.addEventListener("scroll", handleScroll);
  }, [scrollableNodeRef]);

  const [collapsed, setMenuCollapsed] = useSidebar();
  const [menuHover, setMenuHover] = useState(false);

  // semi dark option
  const [isSemiDark] = useSemiDark();

  return (
    <div className={isSemiDark ? "dark" : ""}>
      <div
        className={clsx(
          " sidebar-wrapper bg-white dark:bg-gray-800     shadow-base  ",
          {
            "w-[72px] close_sidebar": collapsed,
            "w-[280px]": !collapsed,
            "sidebar-hovered": menuHover,
          }
        )}
        onMouseEnter={() => {
          setMenuHover(true);
        }}
        onMouseLeave={() => {
          setMenuHover(false);
        }}
      >
        <SidebarLogo menuHover={menuHover} />
        <div
          className={`h-[60px]  absolute top-[80px] nav-shadow z-[1] w-full transition-all duration-200 pointer-events-none ${
            scroll ? " opacity-100" : " opacity-0"
          }`}
        ></div>

        <SimpleBar
          className="sidebar-menu  h-[calc(100%-80px)]"
          scrollableNodeProps={{ ref: scrollableNodeRef }}
        >
          <Navmenu menus={filteredMenuItems} />
        </SimpleBar>
      </div>
    </div>
  );
};

export default Sidebar;
