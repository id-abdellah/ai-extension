/** @type {import('tailwindcss').Config} */

export default {
   content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
   ],
   theme: {
      extend: {
         colors: {
            bg: "rgba(var(--bg))",
            surface: "rgba(var(--surface))",
            primary: "rgba(var(--primary))",
            secondary: "rgba(var(--secondary))",

            on_bg: "rgba(var(--on-bg))",
            on_surface: "rgba(var(--on-surface))",
            on_primary: "rgba(var(--on-primary))",
            on_secondary: "rgba(var(--on-secondary))",

            hover_bg: "rgba(var(--hover-bg))",
            hover_surface: "rgba(var(--hover-surface))",
            hover_primary: "rgba(var(--hover-primary))",
            hover_secondary: "rgba(var(--hover-secondary))",

            error: "rgba(var(--error))",
            hover_error: "rgba(var(--hover-error))",

            warning: "rgba(var(--warning))",
            on_warning: "rgba(var(--on-warning))",
            hover_warning: "rgba(var(--hover-warning))",

            focus: "rgba(var(--focus))",

            divider: "rgba(var(--divider))",

            link: "rgba(var(--link))",
            hover_link: "rgba(var(--hover-link))",

            disabled: "rgba(var(--disabled))",
            on_disables: "rgba(var(--on-disabled))",

         },
      },
   },
   plugins: [],
}

