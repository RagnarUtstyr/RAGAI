import requests

def search_wikipedia(query)
    url = httpsen.wikipedia.orgwapi.php
    params = {
        action opensearch,
        search query,
        limit 1,
        namespace 0,
        format json
    }
    r = requests.get(url, params=params, timeout=10)
    r.raise_for_status()
    data = r.json()
    return data[1][0] if data[1] else None

def get_summary(title)
    url = fhttpsen.wikipedia.orgapirest_v1pagesummary{title}
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    data = r.json()
    return data.get(extract, )

def answer_from_sentence(sentence)
    # Simple version use the whole sentence as the search query.
    # Later, replace this with an LLMNLP topic extractor.
    title = search_wikipedia(sentence)
    if not title
        return No relevant Wikipedia page found.

    summary = get_summary(title)
    return fBased on Wikipedia page '{title}'nn{summary}

print(answer_from_sentence(Who was Alan Turing))