# Guia de Uso do Logo BrixAurea Valuation

## 📍 Localização dos Assets

Os logos oficiais estão salvos em:
- `public/assets/logos/brixaurea-valuation-light.png` (para fundos claros)
- `public/assets/logos/brixaurea-valuation-dark.png` (para fundos escuros)

## 🎨 Padrão de Uso

**SEMPRE use o logo apropriado para o tema:**
- ✅ Logo **light** em fundos claros
- ✅ Logo **dark** em fundos escuros
- ❌ NUNCA substitua por texto estilizado ou ícones genéricos

## 🔧 Componente Reutilizável

Use o componente `<Logo />` localizado em `src/components/ui/Logo.tsx`:

```tsx
import { Logo } from '@/components/ui/Logo';

// Exemplo básico (tamanho sm padrão)
<Logo />

// Com link
<Logo href="/" />

// Usando presets de tamanho
<Logo size="xs" />  // 24px × 144px - Mobile compact
<Logo size="sm" />  // 32px × 192px - Navbar
<Logo size="md" />  // 40px × 240px - Login/Auth
<Logo size="lg" />  // 48px × 288px - Profile pages
<Logo size="xl" />  // 64px × 384px - Hero sections

// Customizado com dimensões específicas
<Logo 
  href="/dashboard" 
  height={48} 
  width={256}
  animate={true}
  showSkeleton={true}
  className="custom-class"
/>

// Sem animações (bom para hero sections estáticas)
<Logo size="xl" animate={false} />
```

### Props do Componente

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `href` | `string` | - | URL de destino (torna o logo clicável) |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'sm'` | Tamanho pré-configurado |
| `height` | `number` | - | Altura customizada (sobrescreve size) |
| `width` | `number` | - | Largura customizada (sobrescreve size) |
| `className` | `string` | `''` | Classes CSS customizadas |
| `animate` | `boolean` | `true` (se href fornecido) | Ativa animações de hover/focus |
| `showSkeleton` | `boolean` | `true` | Mostra skeleton durante carregamento |

### Variantes de Tamanho Disponíveis

```tsx
// Extra Small - Mobile compact
<Logo size="xs" />  // 24px height

// Small - Navbar padrão
<Logo size="sm" />  // 32px height

// Medium - Login/Auth pages
<Logo size="md" />  // 40px height

// Large - Profile/Selection pages
<Logo size="lg" />  // 48px height

// Extra Large - Hero sections
<Logo size="xl" />  // 64px height
```

## ✨ Features Avançadas

### 1. Animações Automáticas

Quando `href` é fornecido, o logo automaticamente:
- ✅ Adiciona efeito hover (opacity 80% + scale 105%)
- ✅ Focus ring para acessibilidade (keyboard navigation)
- ✅ Transições suaves (300ms)

```tsx
// Animações automáticas
<Logo href="/" />  // animate=true implícito

// Forçar sem animações
<Logo href="/" animate={false} />
```

### 2. Skeleton Loading

Mostra um skeleton animado enquanto a imagem carrega:

```tsx
// Com skeleton (padrão)
<Logo showSkeleton={true} />

// Sem skeleton
<Logo showSkeleton={false} />
```

### 3. Acessibilidade

- ✅ `aria-label` automático
- ✅ `role="img"` para logos sem link
- ✅ Focus ring visível
- ✅ Alt text descritivo

## 📦 Implementação Manual (se necessário)

Se por alguma razão você não puder usar o componente `<Logo />`, siga este padrão:

```tsx
import Image from 'next/image';
import Link from 'next/link';

<Link href="/" className="relative h-10 w-48">
  <Image
    src="/assets/logos/brixaurea-valuation-light.png"
    alt="BrixAurea Valuation"
    fill
    className="object-contain dark:hidden"
    priority
  />
  <Image
    src="/assets/logos/brixaurea-valuation-dark.png"
    alt="BrixAurea Valuation"
    fill
    className="object-contain hidden dark:block"
    priority
  />
</Link>
```

## 🎯 Locais Atuais de Uso

O logo está implementado em:

1. **Navbar** (`src/components/layout/Navbar.tsx`)
   - Tamanho: `sm` (32px × 192px)
   - Clicável, redireciona para home
   - Com animações

2. **Footer** (`src/components/layout/Footer.tsx`)
   - Tamanho: `md` (40px × 240px)
   - Clicável, redireciona para home
   - Com animações

3. **Home Hero** (`src/app/[locale]/page.tsx`)
   - Tamanho: `xl` (64px × 384px)
   - Sem link, sem animações
   - Display estático

4. **Login** (`src/app/[locale]/login/page.tsx`)
   - Tamanho: `md` (40px × 240px)
   - Clicável, redireciona para home
   - Com animações

5. **Profile Selection** (`src/app/[locale]/profile-selection/page.tsx`)
   - Tamanho: `lg` (48px × 288px)
   - Clicável, redireciona para home
   - Com animações

## ✅ Checklist para Novos Componentes

Ao criar novos componentes de autenticação ou páginas standalone:

- [ ] Importar o componente `Logo` de `@/components/ui/Logo`
- [ ] Escolher tamanho apropriado usando prop `size`
- [ ] Posicionar o logo no topo da página/formulário
- [ ] Tornar clicável com `href` apropriado (geralmente `/` ou `/${locale}`)
- [ ] Decidir se precisa de animações (`animate` prop)
- [ ] Testar em **light mode** e **dark mode**
- [ ] Verificar responsividade em mobile
- [ ] Confirmar que skeleton loading funciona corretamente

## 🚫 O Que NÃO Fazer

❌ **NUNCA faça isso:**

```tsx
// ❌ Texto estilizado
<div className="text-xl font-bold">BrixAurea Valuation</div>

// ❌ Apenas um logo (sem dark mode)
<Image src="/assets/logos/brixaurea-valuation-light.png" />

// ❌ Logo não-oficial
<Image src="/logo-custom.png" />
```

## 🎨 Especificações de Design

- **Formato:** PNG com transparência
- **Aspect Ratio:** ~6:1 (largura:altura)
- **Variantes de Tamanho:**
  - Extra Small (xs): 24px × 144px - Mobile compact
  - Small (sm): 32px × 192px - Navbar
  - Medium (md): 40px × 240px - Login/Auth
  - Large (lg): 48px × 288px - Profile pages
  - Extra Large (xl): 64px × 384px - Hero sections

## 📱 Responsividade

O componente `<Logo />` é automaticamente responsivo usando containers relativos e Next.js Image `fill`. Para customizações:

```tsx
// Usando classes Tailwind utilitárias
<Logo size="sm" className="md:scale-125" />

// Ou criando variantes customizadas
<Logo 
  size="xs"  // mobile
  className="sm:hidden" 
/>
<Logo 
  size="sm"  // desktop
  className="hidden sm:block"
/>
```

## 🔄 Manutenção

Se os logos precisarem ser atualizados:

1. Substitua os arquivos PNG em `public/assets/logos/`
2. Mantenha os **mesmos nomes de arquivo**
3. Verifique que ambos (light e dark) estão sincronizados
4. Teste em todas as páginas listadas acima

---

**Última atualização:** 29 de Janeiro de 2026  
**Responsável:** Equipe BrixAurea Valuation
