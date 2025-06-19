// Lazy load heavy components
import { lazy } from 'react';

// Lazy load admin components (heavy but rarely used by public)
export const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
export const AdminLogin = lazy(() => import('../pages/AdminLogin'));

// Lazy load portfolio detail (heavy animations)
export const ProjectDetail = lazy(() => import('../pages/ProjectDetail'));

// Lazy load testimonials (if not needed immediately)
export const TestimonialSection = lazy(() => import('./home/TestimonialSection'));

// Lazy load review system (heavy form components)
export const ReviewSystem = lazy(() => import('./portfolio/ReviewSystem'));