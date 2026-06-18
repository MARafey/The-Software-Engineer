# Component Checklist

Before marking a component done:
- [ ] Keyboard navigable (Tab, Enter, Escape, arrow keys where applicable)
- [ ] ARIA attributes: role, aria-label, aria-describedby as needed
- [ ] Responsive: tested at 320px, 768px, 1024px, 1440px
- [ ] Error state: shows meaningful message, not raw API error
- [ ] Loading state: skeleton or spinner, not blank
- [ ] Empty state: shown when list is empty
- [ ] No inline styles — all via CSS variables or utility classes
