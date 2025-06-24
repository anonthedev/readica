'use client';

import { usePathname } from 'next/navigation';

const pathsWithoutSidebar = ['/login'];

export const withoutSidebar = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const pathname = usePathname();
    const shouldHideSidebar = pathsWithoutSidebar.includes(pathname);

    if (shouldHideSidebar) {
      return <Component {...props} />;
    }

    return <Component {...props} />;
  };
};
