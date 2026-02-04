# Logo Assets - BrixAurea Valuation

## 📁 Estrutura de Arquivos

### Arquivos Atuais (PNG):
- ✅ `brixaurea-valuation-light.png` - Logo para fundos claros (~2.5MB)
- ✅ `brixaurea-valuation-dark.png` - Logo para fundos escuros (~2.5MB)

### Arquivos SVG (Aguardando):
Para melhor performance e qualidade, adicione as versões SVG:

- ⏳ `brixaurea-valuation-light.svg` - Logo vetorial para fundos claros (< 50KB)
- ⏳ `brixaurea-valuation-dark.svg` - Logo vetorial para fundos escuros (< 50KB)
- ⏳ `brixaurea-valuation-hero.svg` - Logo especial para hero section com efeito glow (< 80KB)
- ⏳ `brixaurea-valuation-outline.svg` - Versão outline (opcional, < 30KB)

---

## 🔄 Sistema de Fallback Automático

O componente `Logo.tsx` implementa detecção inteligente:

1. **Tenta carregar SVG primeiro** (formato preferido)
2. **Se SVG não existir**, faz fallback automático para PNG
3. **Se PNG falhar**, usa tag `<img>` nativa
4. **Se tudo falhar**, mostra skeleton loader

Isso significa que você pode adicionar os arquivos SVG **quando estiverem prontos**, sem quebrar o site.

---

## 🚀 Como Adicionar SVGs

### Método 1: Vectorizer.AI (Rápido)
1. Acesse: https://vectorizer.ai/
2. Upload do PNG
3. Download do SVG gerado
4. Salve nesta pasta com o nome correto

### Método 2: Figma/Illustrator
1. Abra o PNG na ferramenta
2. Converta para vetor (trace/vectorize)
3. Exporte como SVG otimizado
4. Salve nesta pasta

### Método 3: Criar Hero Variant
Para criar `brixaurea-valuation-hero.svg`:
1. Comece com `brixaurea-valuation-dark.svg`
2. Adicione filtro de glow no SVG:
```svg
<defs>
  <filter id="glow">
    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
    <feMerge>
      <feMergeNode in="coloredBlur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>
```
3. Aplique `filter="url(#glow)"` nos elementos principais
4. Ajuste cores para versão mais vibrante

---

## 🎨 Especificações Recomendadas

### Dimensões:
- **ViewBox**: `0 0 400 120` (ou manter proporção atual)
- **Aspect Ratio**: ~10:3

### Cores:
**Light Mode (`*-light.svg`)**:
- Dourado: `#D4AF37` ou `#B8941C`
- Azul: `#1E40AF` ou `#3B82F6`
- Texto: `#1F2937`

**Dark Mode (`*-dark.svg`)**:
- Dourado brilhante: `#FFD700` ou `#FDB931`
- Azul claro: `#60A5FA` ou `#93C5FD`
- Texto: `#F9FAFB`

**Hero Mode (`*-hero.svg`)**:
- Cores vibrantes com alto contraste
- Dourado: `#FFEB3B`
- Azul: `#00D9FF`
- Glow: `rgba(255, 255, 255, 0.8)`

### Otimização:
- Remova metadata desnecessária
- Simplifique paths (decimals: 2)
- Converta texto para paths
- Minifique com SVGOMG: https://jakearchibald.github.io/svgomg/

### Contraste:
- Mínimo **4.5:1** (WCAG AA)
- Teste em fundos preto e branco
- Verifique legibilidade em 24px (mobile)

---

## 📊 Comparação de Performance

| Formato | Tamanho | Escalabilidade | Tempo de Load |
|---------|---------|----------------|---------------|
| PNG     | ~2.5MB  | ❌ Pixeliza    | ~200-300ms    |
| SVG     | ~50KB   | ✅ Infinita    | ~10-20ms      |

**Ganho esperado**: 50x menor, 15x mais rápido 🚀

---

## ✅ Checklist de Qualidade

Antes de salvar SVG nesta pasta:
- [ ] ViewBox configurado corretamente
- [ ] Cores seguem paleta recomendada
- [ ] Background transparente
- [ ] Arquivo < 100KB
- [ ] Testado em fundo claro E escuro
- [ ] Legível em 24px (mobile)
- [ ] Otimizado com SVGOMG

---

## 🔗 Links Úteis

- **Guia Completo**: Ver `LOGO_OPTIMIZATION_GUIDE.md` na raiz do projeto
- **Vectorizer.AI**: https://vectorizer.ai/
- **SVGOMG** (otimizador): https://jakearchibald.github.io/svgomg/
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/

---

## 📝 Notas

- Os arquivos PNG serão mantidos como fallback permanente
- Não delete os PNGs mesmo após adicionar SVGs
- O sistema detecta automaticamente qual formato usar
- Para variante `hero`, CSS adicional já está aplicado em `page.tsx`

**Status**: ⏳ Aguardando conversão PNG → SVG
