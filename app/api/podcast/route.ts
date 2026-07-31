import { NextResponse } from "next/server";

const RSS_URL = "https://anchor.fm/s/10e709180/podcast/rss";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

function firstSentence(text: string): string {
  const clean = stripHtml(text);
  const match = clean.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : clean.slice(0, 120).trim();
}

function parseDuration(dur: string): string {
  // handles HH:MM:SS or MM:SS or plain seconds
  if (!dur) return "";
  const parts = dur.split(":").map(Number);
  if (parts.length === 3) {
    const [h, m, s] = parts;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return `${m}m ${s}s`;
  }
  const secs = parseInt(dur, 10);
  if (!isNaN(secs)) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  }
  return dur;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export async function GET() {
  try {
    const res = await fetch(RSS_URL, {
      next: { revalidate: 3600 }, // cache 1 hour
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);

    const xml = await res.text();

    // Parse cover art
    const coverMatch = xml.match(/<itunes:image[^>]+href="([^"]+)"/);
    const coverArt = coverMatch ? coverMatch[1] : "";

    // Parse episodes
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const episodes: {
      number: number;
      title: string;
      date: string;
      duration: string;
      description: string;
      link: string;
      thumbnail: string;
    }[] = [];

    let match;
    let idx = 0;
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];

      const titleMatch = block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || block.match(/<title>([\s\S]*?)<\/title>/);
      const pubMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const durMatch = block.match(/<itunes:duration>([\s\S]*?)<\/itunes:duration>/);
      const descMatch = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || block.match(/<description>([\s\S]*?)<\/description>/);
      const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/) || block.match(/<enclosure[^>]+url="([^"]+)"/);
      const guidMatch = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/);
      const thumbMatch = block.match(/<itunes:image[^>]+href="([^"]+)"/);

      const rawTitle = titleMatch ? titleMatch[1].trim() : `Episode ${idx + 1}`;
      // Extract episode number from title like "E22: ..."
      const epNumMatch = rawTitle.match(/^E(\d+)[:\s]/i);
      const epNum = epNumMatch ? parseInt(epNumMatch[1]) : episodes.length + 1;

      const rawLink = linkMatch ? linkMatch[1].trim() : "";

      // podcasters.spotify.com links open the creator dashboard — redirect to open.spotify.com show instead
      const cleanLink = rawLink.includes("podcasters.spotify.com")
        ? `https://open.spotify.com/show/4pVFhhByhjraeeDSiXGzKo`
        : rawLink || `https://open.spotify.com/show/4pVFhhByhjraeeDSiXGzKo`;

      episodes.push({
        number: epNum,
        title: rawTitle,
        date: pubMatch ? formatDate(pubMatch[1].trim()) : "",
        duration: durMatch ? parseDuration(durMatch[1].trim()) : "",
        description: descMatch ? firstSentence(descMatch[1]) : "",
        link: cleanLink,
        thumbnail: thumbMatch ? thumbMatch[1] : coverArt,
      });

      idx++;
    }

    return NextResponse.json({ coverArt, episodes });
  } catch (err) {
    console.error("Podcast RSS error:", err);
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 });
  }
}
