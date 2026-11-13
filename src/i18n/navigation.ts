import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Link/redirect que preservam o idioma atual.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
