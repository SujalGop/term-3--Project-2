/**
 * Button.jsx
 * Styled button component with multiple variants.
 *
 * Variants:
 *   primary  – indigo gradient (default)
 *   success  – emerald, for completed/positive actions
 *   danger   – red, for destructive actions
 *   ghost    – transparent with border
 *   outline  – transparent with primary border
 *
 * Sizes: sm | md (default) | lg
 */

import { motion } from 'framer-motion';

const VARIANT_CLASSES = {
  primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/30',
  success: 'bg-accent-600 hover:bg-accent-500 text-white shadow-lg shadow-accent-900/30',
  danger:  'bg-red-600/80 hover:bg-red-500/80 text-white shadow-lg shadow-red-900/30',
  ghost:   'bg-white/5 hover:bg-white/10 text-surface-300 border border-white/10',
  outline: 'bg-transparent hover:bg-primary-600/20 text-primary-300 border border-primary-500/50',
};

const SIZE_CLASSES = {
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-6 py-3 rounded-xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) {
  const variantCls = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary;
  const sizeCls    = SIZE_CLASSES[size]    ?? SIZE_CLASSES.md;

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/50
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantCls} ${sizeCls} ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="shrink-0" />
      ) : null}
      {children}
    </motion.button>
  );
}
