# 🎯 Exemplos Práticos de Uso do Logo

## Casos de Uso Comuns

### 1. Navbar Fixo (Header)
```tsx
import { Logo } from '@/components/ui/Logo';

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-black">
      <Logo href="/" size="sm" />
    </nav>
  );
}
```

**Resultado:** Logo de 32px com animações de hover, clicável para home.

---

### 2. Footer com Logo Centralizado
```tsx
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-zinc-900">
      <div className="flex justify-center mb-8">
        <Logo href="/" size="md" />
      </div>
      {/* Links do footer */}
    </footer>
  );
}
```

**Resultado:** Logo de 40px centralizado, com animações.

---

### 3. Hero Section (Landing Page)
```tsx
import { Logo } from '@/components/ui/Logo';

export default function Home() {
  return (
    <section className="hero-section">
      <div className="flex justify-center mb-8">
        <Logo size="xl" animate={false} className="drop-shadow-2xl" />
      </div>
      <h1>Bem-vindo ao BrixAurea Valuation</h1>
    </section>
  );
}
```

**Resultado:** Logo grande (64px) sem animações, para destaque visual.

---

### 4. Página de Login/Auth
```tsx
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex justify-center mb-6">
        <Logo href="/" size="md" />
      </div>
      <form>{/* Formulário de login */}</form>
    </div>
  );
}
```

**Resultado:** Logo de 40px acima do formulário, clicável.

---

### 5. Página de Seleção de Perfil
```tsx
import { Logo } from '@/components/ui/Logo';

export default function ProfileSelection() {
  return (
    <div className="min-h-screen">
      <div className="flex justify-center mb-8">
        <Logo href="/" size="lg" />
      </div>
      <h1>Escolha seu perfil</h1>
      {/* Cards de seleção */}
    </div>
  );
}
```

**Resultado:** Logo de 48px, tamanho intermediário para páginas importantes.

---

### 6. Mobile Compact (Sidebar/Menu)
```tsx
import { Logo } from '@/components/ui/Logo';

export function MobileSidebar() {
  return (
    <aside className="mobile-sidebar">
      <Logo href="/" size="xs" />
      {/* Menu items */}
    </aside>
  );
}
```

**Resultado:** Logo compacto de 24px para espaços reduzidos.

---

### 7. Logo sem Link (Display apenas)
```tsx
import { Logo } from '@/components/ui/Logo';

export function BrandDisplay() {
  return (
    <div className="brand-showcase">
      <Logo size="lg" />
      <p>Parceiro Oficial</p>
    </div>
  );
}
```

**Resultado:** Logo de 48px sem interação, role="img" para acessibilidade.

---

### 8. Logo com Skeleton Desabilitado
```tsx
import { Logo } from '@/components/ui/Logo';

export function InstantLogo() {
  return <Logo href="/" size="sm" showSkeleton={false} />;
}
```

**Resultado:** Sem animação de carregamento, aparece instantaneamente.

---

### 9. Dimensões Customizadas
```tsx
import { Logo } from '@/components/ui/Logo';

export function CustomSizeLogo() {
  return (
    <Logo 
      href="/" 
      height={56}
      width={336}
      className="my-custom-class"
    />
  );
}
```

**Resultado:** Logo com dimensões específicas (56px × 336px).

---

### 10. Responsivo com Breakpoints
```tsx
import { Logo } from '@/components/ui/Logo';

export function ResponsiveLogo() {
  return (
    <>
      {/* Mobile */}
      <Logo href="/" size="xs" className="sm:hidden" />
      
      {/* Desktop */}
      <Logo href="/" size="sm" className="hidden sm:block" />
    </>
  );
}
```

**Resultado:** Logo pequeno no mobile, normal no desktop.

---

## Comparação Visual de Tamanhos

```
xs:  ▓▓▓▓▓▓▓▓▓▓▓▓ (24px × 144px)
sm:  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ (32px × 192px)
md:  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ (40px × 240px)
lg:  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ (48px × 288px)
xl:  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ (64px × 384px)
```

## Matriz de Decisão

| Contexto | Tamanho | Link? | Animação? | Skeleton? |
|----------|---------|-------|-----------|-----------|
| Navbar/Header | `sm` | ✅ Sim | ✅ Sim | ✅ Sim |
| Footer | `md` | ✅ Sim | ✅ Sim | ✅ Sim |
| Hero/Landing | `xl` | ❌ Não | ❌ Não | ✅ Sim |
| Login/Auth | `md` | ✅ Sim | ✅ Sim | ✅ Sim |
| Perfil | `lg` | ✅ Sim | ✅ Sim | ✅ Sim |
| Mobile Menu | `xs` | ✅ Sim | ✅ Sim | ❌ Não |
| Display/Showcase | custom | ❌ Não | ❌ Não | ❌ Não |

## Tips & Tricks

### 🎨 Adicionar Sombras
```tsx
<Logo size="xl" className="drop-shadow-2xl" />
```

### 🔄 Animações Customizadas
```tsx
<Logo 
  size="md" 
  className="hover:rotate-3 transition-transform duration-500"
/>
```

### 📱 Hidden em Mobile
```tsx
<Logo size="sm" className="hidden md:block" />
```

### 🎯 Focus Ring Customizado
```tsx
<Logo 
  href="/" 
  size="sm"
  className="focus:ring-4 focus:ring-emerald-500"
/>
```

### 💫 Fade In Animation
```tsx
<Logo 
  size="lg"
  className="animate-fade-in"
/>
```

## Troubleshooting

### Logo não aparece?
- ✅ Verifique se os arquivos PNG existem em `public/assets/logos/`
- ✅ Confirme que o componente tem `'use client'` se usar estado
- ✅ Teste dark mode: `className="dark"`

### Animações não funcionam?
- ✅ Confirme que `href` está fornecido ou `animate={true}` explícito
- ✅ Verifique conflitos de CSS na prop `className`

### Skeleton não desaparece?
- ✅ Verifique console de erros de carregamento de imagem
- ✅ Confirme que paths das imagens estão corretos
- ✅ Desabilite com `showSkeleton={false}` se necessário

### Dark mode não alterna?
- ✅ Confirme que o tema está configurado corretamente no projeto
- ✅ Teste manualmente: adicione `dark` ao elemento pai

---

**Última atualização:** 29 de Janeiro de 2026
