---
name: Comic Universe Editorial
colors:
  surface: '#141313'
  surface-dim: '#141313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2b2a2a'
  surface-container-highest: '#353434'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c8c6c5'
  primary: '#c8c6c5'
  on-primary: '#303030'
  primary-container: '#1d1d1d'
  on-primary-container: '#868584'
  inverse-primary: '#5f5e5e'
  secondary: '#c6c7c5'
  on-secondary: '#2f3130'
  secondary-container: '#454746'
  on-secondary-container: '#b4b5b4'
  tertiary: '#cac6c4'
  on-tertiary: '#31302f'
  tertiary-container: '#1e1d1c'
  on-tertiary-container: '#878583'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e2e3e1'
  secondary-fixed-dim: '#c6c7c5'
  on-secondary-fixed: '#1a1c1b'
  on-secondary-fixed-variant: '#454746'
  tertiary-fixed: '#e6e2df'
  tertiary-fixed-dim: '#cac6c4'
  on-tertiary-fixed: '#1c1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#141313'
  on-background: '#e5e2e1'
  surface-variant: '#353434'
  black: '#1D1D1D'
  black-deep: '#151515'
  white: '#F8F8F6'
  paper: '#FFFFFF'
  accent-yellow: '#F3F000'
  accent-red: '#E62429'
  muted-gray: '#B7B7B7'
  border-gray: '#555555'
typography:
  headline-xl:
    fontFamily: Anton
    fontSize: 72px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.15'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Anton
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.25'
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
  label-md:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
spacing:
  column-gutter: 24px
  section-margin: 64px
  container-padding: 40px
  content-spacing: 16px
---

# DESIGN.md
# Comic Universe Editorial Website
# Visual System & Interface Specification

> Design direction: Premium comic-book editorial / modern superhero media platform
> Reference viewport: 1600 × 925
> Primary experience: Desktop-first
> Visual character: Bold, cinematic, editorial, asymmetric, collectible
> Core principle: The website should feel like a physical comic-book spread transformed into an interactive digital interface.

---

# 01. DESIGN PHILOSOPHY

The interface is not a conventional SaaS dashboard or standard entertainment website.

It should feel like:

- a comic-book page
- a magazine spread
- a collector's archive
- a cinematic promotional site
- an editorial publication
- a premium entertainment portal

The design deliberately combines:

1. Large editorial typography
2. Strong black/white contrast
3. Comic artwork
4. Asymmetric layouts
5. Overlapping content blocks
6. Physical-print-like composition
7. Bright accent CTAs
8. Hard-edged rectangular UI
9. Large negative space
10. Controlled visual chaos

The website should appear carefully composed rather than grid-generated.

---

# 02. CORE VISUAL PRINCIPLES

## 2.1 Editorial First

Content should feel curated rather than dumped into cards.

Avoid:

- generic card grids
- excessive rounded cards
- glassmorphism
- gradients everywhere
- dashboard-like spacing
- excessive shadows
- generic hero sections

Prefer:

- asymmetric compositions
- oversized headlines
- image crops
- overlapping sections
- strong visual anchors
- editorial columns
- horizontal rules
- intentional whitespace

---

## 2.2 Comic Book DNA

The interface should visually reference comic publishing without becoming a literal comic-book parody.

Use:

- monochrome comic panels
- halftone textures
- ink-style artwork
- rectangular image crops
- bold display typography
- yellow accent blocks
- hard borders
- panel-like content sections

Avoid:

- speech bubbles everywhere
- excessive POW/BAM graphics
- cartoon UI
- childish illustrations
- overuse of comic sound effects

The result should feel like a modern premium interpretation of comics.

---

# 03. COLOR SYSTEM

## Primary Colors

```css
--black: #1D1D1D;
--black-deep: #151515;
--white: #F8F8F6;
--paper: #FFFFFF;
--accent-yellow: #F3F000;
--accent-red: #E62429;
--muted-gray: #B7B7B7;
--border-gray: #555555;
```
