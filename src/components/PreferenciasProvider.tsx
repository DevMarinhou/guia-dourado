"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Perfil = {
  visual: boolean;
  auditivo: boolean;
  motorio: boolean;
  cognitivo: boolean;
  idioma: "pt" | "en" | "es";
  libras: boolean;
  altoContraste: boolean;
  vozLigada: boolean;
};

const PADRAO: Perfil = {
  visual: false,
  auditivo: false,
  motorio: false,
  cognitivo: false,
  idioma: "pt",
  libras: false,
  altoContraste: false,
  vozLigada: true,
};

type Ctx = { perfil: Perfil; setPerfil: (p: Perfil) => void };

const PreferenciasContext = createContext<Ctx>({
  perfil: PADRAO,
  setPerfil: () => {},
});

export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfilState] = useState<Perfil>(PADRAO);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("gd-perfil");
      if (salvo) setPerfilState({ ...PADRAO, ...JSON.parse(salvo) });
    } catch {
      /* perfil novo */
    }
  }, []);

  function setPerfil(p: Perfil) {
    setPerfilState(p);
    try {
      localStorage.setItem("gd-perfil", JSON.stringify(p));
    } catch {
      /* sem armazenamento */
    }
    document.documentElement.dataset.contraste = p.altoContraste
      ? "alto"
      : "padrao";
  }

  return (
    <PreferenciasContext.Provider value={{ perfil, setPerfil }}>
      {children}
    </PreferenciasContext.Provider>
  );
}

export function usePreferencias() {
  return useContext(PreferenciasContext);
}
