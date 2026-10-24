# Bugfix Requirements Document

## Introduction

The BookLeaf frontend renders its pages completely unstyled: the login page (and register, not-found, and the entire app shell — header, sidebar, and content layout) show raw text with no card layout, spacing, colors, or field styling. Investigation confirms Tailwind CSS v4 itself is configured and working — the `@tailwindcss/vite` plugin, `@import "tailwindcss"`, the `@theme` tokens, and the base layer are all valid and resolve, and components that use standard Tailwind utility classes (e.g. `Button`) render correctly. The root cause is that the affected pages are built on a custom semantic CSS class system (classes such as `login-card`, `login-form`, `app-header`, `app-sidebar`, `page-content`, `simple-state-page`) that is never defined in any stylesheet. The only CSS file in the project, `src/index.css`, contains Tailwind imports, theme variables, and a base layer but defines none of these custom component classes. Because these classes match no CSS rules, the affected pages render with only the global base layer applied, appearing unstyled. This bugfix covers all affected pages app-wide.

## Bug Analysis

### Current Behavior (Defect)

The affected pages reference custom semantic CSS classes that have no definitions in any stylesheet, so they render unstyled.

1.1 WHEN the login page is rendered THEN the custom classes `login-card`, `login-mobile-brand`, `brand-symbol`, `login-heading`, `login-form`, `field-label`, `input-with-icon`, `input-trailing-button`, `login-submit`, `login-divider`, `login-footnote`, and `login-security` match no CSS rules, so the page renders with no card, no centered layout, no spacing, and no field/input styling — only raw text and browser-default inputs.
1.2 WHEN the register page is rendered THEN the custom classes `login-card`, `login-heading`, `login-form`, `field-label`, `input-with-icon`, `login-submit`, `login-divider`, `login-footnote`, and `login-security` match no CSS rules, so it renders unstyled identically to the login page.
1.3 WHEN the not-found page is rendered THEN the custom classes `simple-state-page`, `simple-state-icon`, `button-link`, and `button-secondary` match no CSS rules, so it renders as raw text with an unstyled link.
1.4 WHEN the app shell is rendered THEN the custom classes `app-frame`, `app-workspace`, `app-header`, `header-breadcrumb`, `header-actions`, `app-sidebar`, `sidebar-link`, `page-content`, and `app-footer` match no CSS rules, so the dashboard shell has no sidebar/header layout, no navigation styling, and no content spacing.
1.5 WHEN any affected page renders THEN only the global base layer (body `bg-background`/`text-foreground`, universal `border-border`/`outline-ring/50`) is applied, because none of the page-specific custom classes are defined in `src/index.css` or any other CSS file.

### Expected Behavior (Correct)

The custom classes used by the affected pages SHALL resolve to defined CSS rules so the pages are visually styled.

2.1 WHEN the login page is rendered THEN the system SHALL apply CSS for its custom classes so the login card, heading, form fields, inputs, submit button, divider, and footnote are visually styled with the intended layout, spacing, and colors.
2.2 WHEN the register page is rendered THEN the system SHALL apply CSS for its custom classes so it is visually styled consistently with the login page.
2.3 WHEN the not-found page is rendered THEN the system SHALL apply CSS for its custom classes so the state icon, heading, text, and link are visually styled.
2.4 WHEN the app shell is rendered THEN the system SHALL apply CSS for its custom classes so the header, sidebar navigation, and content area have the intended layout and styling.
2.5 WHEN the affected pages render THEN each referenced custom class SHALL resolve to a defined CSS rule in a stylesheet that is processed by the Vite build, and no page-specific custom class SHALL be left undefined.

### Unchanged Behavior (Regression Prevention)

Tailwind v4 and existing working styles SHALL continue to function unchanged.

3.1 WHEN the `Button` component or any other component using standard Tailwind utility classes is rendered THEN the system SHALL CONTINUE TO generate and apply those Tailwind utilities correctly.
3.2 WHEN the global base layer is applied THEN the system SHALL CONTINUE TO set `bg-background`/`text-foreground` on the body and `border-border`/`outline-ring/50` on all elements.
3.3 WHEN Tailwind theme tokens (`--background`, `--foreground`, `--primary`, `--radius`, etc.) and the `@theme inline` block are used THEN the system SHALL CONTINUE TO resolve them unchanged.
3.4 WHEN the Vite build and dev pipeline runs THEN it SHALL CONTINUE TO compile `src/index.css` and all of its imports (`tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`, `@fontsource-variable/geist`) without error.
