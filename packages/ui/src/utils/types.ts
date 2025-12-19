import type { VariantProps } from 'class-variance-authority';

/**
 * Extracts the variant prop types from a CVA variant function.
 * Example: `ExtractVariants<typeof buttonVariants>`
 */
export type ExtractVariants<T extends (...args: any[]) => any> = VariantProps<T>;
