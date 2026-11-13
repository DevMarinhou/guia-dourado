// Layout raiz "passa-adiante": cada área tem seu próprio <html> (visitante em [locale], Central em /central).
// Padrão recomendado pelo next-intl quando existe not-found.tsx na raiz.
export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return children;
}
