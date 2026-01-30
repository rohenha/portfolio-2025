const variants = {
  xl: "text-xlg",
  lg: "text-lg",
  md: "text-md",
  sm: "text-sm",
  pmd: "text-pmd",
};

export const getFont = (variant: string = "pmd") => {
  return variants[variant as keyof typeof variants] || variants.pmd;
};
