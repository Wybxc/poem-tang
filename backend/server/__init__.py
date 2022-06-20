import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial, wraps
import yaml

from fastapi import FastAPI, Path, Query, Response, Request, HTTPException

from .graph import WordsGraph

with open('server/wds.txt', 'r', encoding='utf-8') as f:
    words = [line.strip() for line in f]

with open('cipher.yml', 'r', encoding='utf-8') as f:
    cipher = yaml.safe_load(f) # 此文件包含数据库密码，出于安全考虑未打包

graph = WordsGraph(cipher['url'], cipher['passwd'], words=words)

app = FastAPI()
executor = ThreadPoolExecutor()
loop = None


async def call(func, *args, **kwargs):
    global loop
    if loop is None:
        loop = asyncio.get_running_loop()
    return await loop.run_in_executor(executor, partial(func, *args, **kwargs))


def total_to_404(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        data = await func(*args, **kwargs)
        if data.get('total') == 0:
            raise HTTPException(status_code=404, detail='Not Found')
        return data

    return wrapper


@app.middleware('http')
async def set_cache(request: Request, call_next):
    response = await call_next(request)
    if not response.headers.get('Cache-Control'):
        response.headers['Cache-Control'] = 'max-age=3600'
    return response


@app.get('/word/topic/{topic}')
@total_to_404
async def get_words_by_topic(
    topic: int, start: int = 0, count: int = Query(10, lt=50)
):
    return await call(graph.words_by_topic, topic, start=start, count=count)


@app.get('/word/{name}')
@total_to_404
async def get_word(name: str = Path(..., max_length=10)):
    return await call(graph.word_by_name, name)


@app.get('/word/{text}/similar')
@total_to_404
async def similar_words(
    text: str = Path(..., max_length=10),
    start: int = 0,
    count: int = Query(10, lt=50)
):
    return await call(graph.similar_words, text, start=start, count=count)


@app.get('/word/poem/{id}')
@total_to_404
async def words_by_poem(
    id: str = Path(..., max_length=36, min_length=36),
    start: int = 0,
    count: int = Query(10, lt=50)
):
    return await call(graph.words_by_poem, id, start=start, count=count)


@app.get('/topic')
async def get_topics():
    return await call(graph.get_topics)


@app.get('/poem/word/{word}')
async def poems_by_word(
    word: str = Path(..., max_length=38),
    start: int = 0,
    count: int = Query(10, lt=50)
):
    return await call(graph.match_poems, word, start=start, count=count)


@app.get('/poem/title/{title}')
async def poems_by_title(
    title: str = Path(..., max_length=100),
    start: int = 0,
    count: int = Query(10, lt=50)
):
    return await call(
        graph.get_poems_by_title, title, start=start, count=count
    )


@app.get('/poem/random')
async def get_random_poem(response: Response, count: int = Query(1, lt=50)):
    response.headers['Cache-Control'] = 'max-age=5'
    return await call(graph.random_poems, count=count)


@app.get('/poem/author/{author}')
async def get_poems_by_author(
    author: str = Path(..., max_length=10),
    start: int = 0,
    count: int = Query(10, lt=50)
):
    return await call(
        graph.get_poems_by_author, author, start=start, count=count
    )


@app.get('/poem/topic/{topic}')
async def get_poems_by_topic(
    topic: int, start: int = 0, count: int = Query(10, lt=50)
):
    return await call(
        graph.get_poems_by_topic, topic, start=start, count=count
    )


@app.get('/poem/{id}')
@total_to_404
async def get_poems_by_id(id: str = Path(..., max_length=36, min_length=36)):
    return await call(graph.get_poems_by_id, id)


@app.get('/poem/{id}/similar')
@total_to_404
async def similar_poems(
    id: str = Path(..., max_length=36, min_length=36),
    start: int = 0,
    count: int = Query(10, lt=50)
):
    return await call(graph.similar_poems, id, start=start, count=count)


@app.get('/author/random')
async def get_random_author(response: Response, count: int = Query(1, lt=50)):
    response.headers['Cache-Control'] = 'max-age=5'
    return await call(graph.random_authors, count=count)


@app.get('/author/{name}')
@total_to_404
async def get_author_by_name(name: str = Path(..., max_length=10)):
    return await call(graph.get_author, name)


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, port=6072)
