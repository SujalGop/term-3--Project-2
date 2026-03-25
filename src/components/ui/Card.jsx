/**
 * Card.jsx
 * Glassmorphism card component.
 *
 * Props:
 *   children   – content
 *   className  – additional Tailwind classes
 *   hover      – bool, enable hover effect (default: false)
 *   as         – element type (default: 'div')
 *   onClick    – click handler
 */

import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  hover = false,
  as: Tag = 'div',
  onClick,
  animate = true,
  ...props
}) {
  const base = `glass rounded-2xl p-6 ${hover ? 'glass-hover cursor-pointer' : ''} ${className}`;

  if (animate) {
    return (
      <motion.div
        className={base}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <Tag className={base} onClick={onClick} {...props}>
      {children}
    </Tag>
  );
}
