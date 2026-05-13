# DESIGN.md - PromptBench Apple-Style Product Intro

## Style Prompt
Cupertino: True black canvas. White text only. Thin ultralight weight. Wide letter-spacing that breathes. Single words command the screen. Nothing competes for attention. Like an Apple keynote title card - premium, deliberate, quiet confidence.

## Colors
- Canvas: #000000 (true black)
- Text: #FFFFFF (pure white)
- Subtle: #86868B (Apple gray)
- Accent glow: #FFFFFF at 5 percent opacity

## Typography
- Primary: Inter Thin (100) or Light (300)
- Letter-spacing: 0.15em normal, animating to 0.05em tight
- Line-height: 1.0 for single words, 1.2 for phrases

## Motion Rules
- Entrances: power4.out - slow acceleration, precise landing
- Exits: power3.in - gradual fade
- Stagger: 0.4s minimum between independent elements
- Duration: 1.2s single word to 2.5s hero phrase
- Pause: 1.0s minimum between scenes
- No bounce, no elastic, no back

## Transitions
- Crossfade through black, 1.5s with 0.8s overlap

## Anti-patterns
- NO color accents - white on black only
- NO bold text - thin and light weights exclusively
- NO multiple elements entering simultaneously
- NO fast cuts - minimum 3s per scene
- NO text smaller than 24px on 1920x1080
- NO gradients, particles, or glow effects