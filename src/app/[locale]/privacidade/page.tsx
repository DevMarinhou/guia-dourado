import { setRequestLocale } from 'next-intl/server';

export const metadata = { title: 'Privacidade' };

// RF-30 / LGPD (docs/11 §11.5). TODO(i18n): versões em inglês e espanhol; contato do encarregado (DPO).
export default async function Privacidade({ params }: PageProps<'/[locale]/privacidade'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <article className="space-y-4">
      <h1 className="text-2xl font-bold">Privacidade</h1>
      <ul className="list-disc space-y-2 pl-6">
        <li>Você não precisa de cadastro nem de login.</li>
        <li>Suas preferências (como letra grande ou evitar escadas) ficam <strong>só neste celular</strong>.</li>
        <li>
          Quando você pede ajuda, enviamos à equipe do shopping <strong>onde você está</strong> e <strong>como prefere se
          comunicar</strong>, só se você concordar. Esses dados são apagados em 30 dias.
        </li>
        <li>O áudio da conversa não é gravado. No Chrome, o reconhecimento de fala pode usar servidores do Google.</li>
        <li>Não usamos cookies de rastreamento.</li>
      </ul>
    </article>
  );
}
