'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@src/shared/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@src/shared/components/ui/sidebar';
import { Link, useLocation } from '@tanstack/react-router';
import { ArrowRight, ChevronRightIcon } from 'lucide-react';

import { cn } from '../lib';

import { buttonVariants } from './ui/button';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = useLocation().pathname;
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isActive =
            item.url === pathname || item?.items?.some((subItem) => subItem.url === pathname);

          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  data-active={item.url === pathname}
                  className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium"
                >
                  <Link preload="intent" to={item.url}>
                    {item.icon}
                    <span
                      className={cn(
                        'flex items-center',
                        item.url === pathname ? 'font-bold underline' : 'font-normal',
                      )}
                    >
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon}
                    <span>{item.title}</span>
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link
                            className={cn(
                              buttonVariants({
                                variant: subItem.url === pathname ? 'link' : 'ghost',
                                size: 'xs',
                                className: cn(
                                  'w-full justify-start text-muted',
                                  subItem.url === pathname ? 'font-bold' : 'font-normal',
                                ),
                              }),
                            )}
                            to={subItem.url}
                          >
                            {subItem.url === pathname && <ArrowRight className="mr-2 font-bold" />}
                            <span className="text-secondary-foreground capitalize">
                              {subItem.title}
                            </span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
