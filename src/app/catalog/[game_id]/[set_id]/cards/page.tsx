import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Card } from '@/lib/supabase';
import { normalizeLanguage, translations } from '@/lib/i18n';
import { fetchGameId, fetchSet, fetchSetLocalization } from '../set-data';

export const revalidate = 60;

interface SetCardsPageProps {
  params:
    | { game_id: string; set_id: string }
    | Promise<{ game_id: string; set_id: string }>;
}

const fetchCards = async (setId: string): Promise<Card[]> => {
  const { data, error } = await supabase
    .from('cards')
    .select('id, set_id, name, number, set_code, game, rarity, condition, price, image_url')
    .eq('set_id', setId)
    .order('number');

  if (error || !data) {
    return [];
  }

  return data;
};

export default async function SetCardsPage({
  params,
  searchParams,
}: SetCardsPageProps & { searchParams?: { lang?: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const setSlug = resolvedParams.set_id;
  const gameSlug = resolvedParams.game_id;
  const language = normalizeLanguage(searchParams?.lang);
  const t = translations[language];
  const gameResult = await fetchGameId(gameSlug);
  const setResult = await fetchSet(gameResult.gameId, setSlug, language);
  const cards = setResult.set
    ? await fetchCards(setResult.set.set_id)
    : [];
  const localizedSetName = setResult.localizedName
    ? setResult.localizedName
    : setResult.set
      ? await fetchSetLocalization(setResult.set.set_id, language)
      : null;
  const errorMessage = gameResult.errorMessage ?? setResult.errorMessage;
  const set = setResult.set;
  const displayName = localizedSetName ?? set?.name;
  const langParam = language === 'en' ? '' : `?lang=${language}`;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-8">
          <div>
            <Link
              href={`/catalog/${gameSlug}/${setSlug}${langParam}`}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400"
            >
              {t.catalog.backToSet}
            </Link>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              {displayName ?? 'Set'}
            </h1>
            <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
              {t.catalog.cardsSubtitle}
            </p>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-6 text-center">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                {t.catalog.setErrorTitle}
              </p>
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            </div>
          ) : cards.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-10 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                {t.catalog.cardsEmpty}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {card.number}
                      </p>
                      <p className="text-base font-semibold text-zinc-900 dark:text-white">
                        {card.name}
                      </p>
                    </div>
                    <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {card.set_code}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
