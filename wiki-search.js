const WIKI_API = "https://en.wikipedia.org/w/api.php";

function buildUrl(params) {
  const url = new URL(WIKI_API);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  // Required for browser requests from GitHub Pages / other static hosts.
  url.searchParams.set("origin", "*");

  return url;
}

function stripHtml(html = "") {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.textContent || "";
}

function cleanWikiText(text = "") {
  return text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/={2,}\s*[^=]+\s*={2,}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstUsefulParagraph(text = "") {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.find((paragraph) => paragraph.length > 160) || paragraphs[0] || text;
}

export async function searchWikipedia(prompt) {
  const searchUrl = buildUrl({
    action: "query",
    list: "search",
    srsearch: prompt,
    srlimit: "1",
    format: "json",
    utf8: "1",
  });

  const searchResponse = await fetch(searchUrl);

  if (!searchResponse.ok) {
    throw new Error("Wikipedia search failed.");
  }

  const searchData = await searchResponse.json();
  const result = searchData?.query?.search?.[0];

  if (!result) {
    return {
      title: "No Wikipedia result",
      extract: "No relevant Wikipedia article was found for that prompt.",
      url: "https://en.wikipedia.org/",
    };
  }

  const pageUrl = buildUrl({
    action: "query",
    prop: "extracts|info",
    exintro: "1",
    explaintext: "1",
    redirects: "1",
    inprop: "url",
    pageids: String(result.pageid),
    format: "json",
    utf8: "1",
  });

  const pageResponse = await fetch(pageUrl);

  if (!pageResponse.ok) {
    throw new Error("Wikipedia article fetch failed.");
  }

  const pageData = await pageResponse.json();
  const page = pageData?.query?.pages?.[result.pageid];
  const rawExtract = page?.extract || stripHtml(result.snippet);
  const extract = firstUsefulParagraph(cleanWikiText(rawExtract));

  return {
    title: page?.title || result.title,
    extract: extract || "Wikipedia returned a page, but no usable article text was available.",
    url: page?.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replaceAll(" ", "_"))}`,
  };
}
