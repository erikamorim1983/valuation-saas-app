'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type LogoVariant = 'default' | 'hero' | 'outline';
type LogoFormat = 'svg' | 'png';

interface LogoProps {
    href?: string;
    className?: string;
    height?: number;
    width?: number;
    size?: LogoSize;
    animate?: boolean;
    showSkeleton?: boolean;
    variant?: LogoVariant;
    preferFormat?: LogoFormat;
}

const SIZE_PRESETS: Record<LogoSize, { height: number; width: number }> = {
    xs: { height: 24, width: 144 },  // Mobile compact
    sm: { height: 32, width: 192 },  // Navbar padrão
    md: { height: 40, width: 240 },  // Login/Auth
    lg: { height: 48, width: 288 },  // Hero sections
    xl: { height: 64, width: 384 },  // Landing pages
};

/**
 * Logo oficial do BrixAurea Valuation com suporte a dark mode e múltiplas variantes.
 * 
 * Usa automaticamente:
 * - brixaurea-valuation-light.svg/png em fundos claros
 * - brixaurea-valuation-dark.svg/png em fundos escuros
 * - brixaurea-valuation-hero.svg para hero sections (com glow)
 * - brixaurea-valuation-outline.svg para overlays
 * 
 * Detecta automaticamente SVG disponível e faz fallback para PNG.
 * 
 * @param href - URL de destino ao clicar (opcional, cria Link se fornecido)
 * @param className - Classes CSS customizadas para o container
 * @param height - Altura customizada em pixels (sobrescreve size)
 * @param width - Largura customizada em pixels (sobrescreve size)
 * @param size - Tamanho pré-configurado: xs, sm, md, lg, xl
 * @param animate - Adiciona animações de hover/focus (padrão: true se href fornecido)
 * @param showSkeleton - Mostra skeleton durante carregamento (padrão: true)
 * @param variant - Variante do logo: 'default' | 'hero' | 'outline' (padrão: 'default')
 * @param preferFormat - Formato preferido: 'svg' | 'png' (padrão: 'svg')
 */
export function Logo({ 
    href, 
    className = '', 
    height, 
    width, 
    size = 'sm',
    animate,
    showSkeleton = true,
    variant = 'default',
    preferFormat = 'png' // Changed from 'svg' to 'png' as default since we only have PNGs
}: LogoProps) {
    const [isLoading, setIsLoading] = useState(showSkeleton);
    const [mounted, setMounted] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [useSvg, setUseSvg] = useState(preferFormat === 'svg');
    
    useEffect(() => {
        setMounted(true);
        // Auto-hide skeleton after 2s as fallback
        if (showSkeleton) {
            const timer = setTimeout(() => setIsLoading(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showSkeleton]);
    
    // Determine logo paths based on variant and format
    const getLogoPaths = () => {
        const format = useSvg ? 'svg' : 'png';
        const basePath = '/assets/logos/brixaurea-valuation';
        
        // Hero and outline variants fallback to default light/dark if specific files don't exist
        // Since we only have PNG light/dark versions currently, use those for all variants
        if (variant === 'hero' || variant === 'outline') {
            return {
                light: `${basePath}-light.${format}`,
                dark: `${basePath}-dark.${format}`,
            };
        }
        
        // Default variant uses light/dark versions
        return {
            light: `${basePath}-light.${format}`,
            dark: `${basePath}-dark.${format}`,
        };
    };

    const logoPaths = getLogoPaths();
    
    // Use custom dimensions or preset
    const dimensions = (height && width) 
        ? { height, width }
        : SIZE_PRESETS[size];

    // Enable animations by default if href is provided
    const shouldAnimate = animate !== undefined ? animate : !!href;

    const animationClass = shouldAnimate 
        ? 'transition-all duration-300 hover:opacity-80 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-black rounded-sm'
        : '';

    const handleLoadComplete = () => {
        setIsLoading(false);
        setHasError(false);
    };

    const handleError = (imageName: string) => {
        console.error(`Failed to load ${imageName}`);
        
        // If SVG failed and we're using SVG, fallback to PNG
        if (useSvg) {
            console.warn('SVG not available, falling back to PNG');
            setUseSvg(false);
            setHasError(false); // Reset error to try PNG
            return;
        }
        
        setIsLoading(false);
        setHasError(true);
    };

    // Fallback usando <img> se Next.js Image falhar
    const logoContent = hasError ? (
        <>
            <img
                src={logoPaths.light}
                alt="BrixAurea Valuation"
                className="w-full h-full object-contain dark:hidden"
            />
            <img
                src={logoPaths.dark}
                alt="BrixAurea Valuation"
                className="w-full h-full object-contain hidden dark:block"
            />
        </>
    ) : (
        <>
            {/* Light mode logo */}
            <Image
                src={logoPaths.light}
                alt="BrixAurea Valuation"
                fill
                sizes={`${dimensions.width}px`}
                className="object-contain dark:hidden"
                priority
                onLoad={handleLoadComplete}
                onError={() => handleError(`${variant} light logo`)}
            />
            
            {/* Dark mode logo */}
            <Image
                src={logoPaths.dark}
                alt="BrixAurea Valuation"
                fill
                sizes={`${dimensions.width}px`}
                className="object-contain hidden dark:block"
                priority
                onLoad={handleLoadComplete}
                onError={() => handleError(`${variant} dark logo`)}
            />
            
            {/* Skeleton loader - only show if still loading and skeleton enabled */}
            {isLoading && mounted && (
                <div 
                    className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700 animate-pulse rounded z-10"
                    aria-hidden="true"
                />
            )}
        </>
    );

    const containerClass = `relative block ${animationClass} ${className}`;
    const style = { 
        height: `${dimensions.height}px`, 
        width: `${dimensions.width}px` 
    };

    if (href) {
        return (
            <Link 
                href={href} 
                className={containerClass} 
                style={style}
                aria-label="BrixAurea Valuation - Voltar para home"
            >
                {logoContent}
            </Link>
        );
    }

    return (
        <div className={containerClass} style={style} role="img" aria-label="BrixAurea Valuation">
            {logoContent}
        </div>
    );
}
