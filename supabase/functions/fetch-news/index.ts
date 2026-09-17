// Fetches today's real news from NewsData.io, scoped to the topics/regions
// the user picked. Key stays server-side; the client never sees it.
const NEWSDATA_API_KEY = Deno.env.get('NEWSDATA_API_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Our Topic values line up almost 1:1 with NewsData's own category taxonomy.
const TOPIC_TO_CATEGORY: Record<string, string> = {
  Sports: 'sports',
  Tech: 'technology',
  Politics: 'politics',
  Business: 'business',
  Entertainment: 'entertainment',
  Science: 'science',
}

// NewsData has no single "EU" or "SEA" country code, so each region maps to
// a small cluster of representative country codes.
const REGION_TO_COUNTRIES: Record<string, string[]> = {
  World: [],
  Thai: ['th'],
  SEA: ['th', 'sg', 'my', 'id', 'ph', 'vn'],
  EU: ['de', 'fr', 'it', 'es', 'nl'],
  USA: ['us'],
};

const COUNTRY_TO_REGION: Record<string, string> = {
  th: 'Thai', sg: 'SEA', my: 'SEA', id: 'SEA', ph: 'SEA', vn: 'SEA',
  de: 'EU', fr: 'EU', it: 'EU', es: 'EU', nl: 'EU',
  us: 'USA',
};

interface NewsDataArticle {
  title: string;
  description: string | null;
  link: string;
  source_name?: string;
  source_id?: string;
  category?: string[];
  country?: string[];
  pubDate?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { topics, regions } = await req.json();
    if (!Array.isArray(topics) || topics.length === 0 || !Array.isArray(regions) || regions.length === 0) {
      return new Response(JSON.stringify({ error: 'topics and regions must be non-empty arrays' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const categories = topics.map((t: string) => TOPIC_TO_CATEGORY[t]).filter(Boolean);
    const countries = [...new Set(regions.flatMap((r: string) => REGION_TO_COUNTRIES[r] ?? []))];

    const params = new URLSearchParams({
      apikey: NEWSDATA_API_KEY,
      category: categories.join(','),
      language: 'en,th',
    });
    // Omitting `country` entirely means "World" coverage; only add it when
    // at least one region narrows things down.
    if (countries.length > 0) params.set('country', countries.join(','));

    const res = await fetch(`https://newsdata.io/api/1/latest?${params.toString()}`);
    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: `NewsData.io error ${res.status}: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    const results: NewsDataArticle[] = data.results ?? [];

    const articles = results.map((item) => {
      const matchedCategory = item.category?.find((c) => Object.values(TOPIC_TO_CATEGORY).includes(c));
      const topic = Object.keys(TOPIC_TO_CATEGORY).find((k) => TOPIC_TO_CATEGORY[k] === matchedCategory) ?? topics[0];
      const matchedCountry = item.country?.find((c) => COUNTRY_TO_REGION[c]);
      const region = (matchedCountry && COUNTRY_TO_REGION[matchedCountry]) ?? regions[0];

      return {
        headline: item.title,
        summary: item.description ?? item.title,
        topic,
        region,
        source: item.source_name ?? item.source_id ?? 'Unknown source',
        sourceUrl: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate.replace(' ', 'T') + 'Z').toISOString() : new Date().toISOString(),
      };
    });

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
