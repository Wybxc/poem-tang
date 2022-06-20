from functools import lru_cache
from itertools import chain
from typing import Iterable, List

import pandas as pd
import py2neo


class WordsGraph():
    def __init__(self, url: str, passwd: str, words: Iterable[str]):
        self._graph = py2neo.Graph(url, auth=('neo4j', passwd))
        self._words = set(words)

    @staticmethod
    def _analyse(df: pd.DataFrame) -> dict:
        return {
            'total': int(df.at[0, 'total']),
            'data': df[df.columns.drop('total')].to_dict(orient='records')
        } if 'total' in df.columns else {
            'total': len(df),
            'data': df.to_dict(orient='records')
        }

    def _run_and_analyse(self, cypher: str) -> dict:
        return self._analyse(self._graph.run(cypher).to_data_frame())

    @lru_cache(maxsize=128)
    def _pullwords(self, wd) -> List[str]:
        c = set(''.join(w) for w in chain(zip(wd, wd[1:]), wd))
        return [w for w in c if w in self._words]

    def word_by_name_en(self, name: str):
        """查询已登录词。"""
        return {
            'name': [name],
            **self._run_and_analyse(
                f"""MATCH (w:Word {{name: '{name}'}})
                    RETURN w.name       AS name,
                           w.topic      AS topic,
                           w.pagerank   AS pagerank"""
            )
        }

    @lru_cache(maxsize=128)
    def word_by_name_un(self, name: str):
        """查询未登录词。"""
        names = self._pullwords(name)
        return {
            'name': names,
            **self._run_and_analyse(
                f"""MATCH (w:Word)
                    WHERE w.name IN ['{"','".join(names)}']
                    RETURN w.name       AS name,
                           w.topic      AS topic,
                           w.pagerank   AS pagerank
                    ORDER BY w.pagerank DESC"""
            )
        }

    def word_by_name(self, name: str):
        """查询词。"""
        return self.word_by_name_en(name) \
             if name in self._words else self.word_by_name_un(name)

    @lru_cache(maxsize=128)
    def words_by_topic(self, topic: int, start=0, count=10):
        """根据词主题查询词。"""
        return {
            'topic': [topic],
            **self._run_and_analyse(
                f"""MATCH (w:Word {{topic: {topic}}})
                    WITH collect(w) AS ws
                    UNWIND ws AS w
                    WITH w, size(ws) AS total
                    RETURN w.name      AS name,
                           w.topic     AS topic,
                           w.pagerank  AS pagerank,
                           total       AS total
                    ORDER BY w.pagerank DESC SKIP {start} LIMIT {count}"""
            )
        }

    @lru_cache(maxsize=128)
    def words_by_poem(self, id: str, start=0, count=10):
        """根据诗 id 查询词。"""
        return {
            'id': [id],
            **self._run_and_analyse(
                f"""MATCH (:Poem {{id: '{id}'}})-[r:CONTAIN]->(w:Word)
                    WITH collect({{
                        name:      w.name,
                        topic:     w.topic,
                        pagerank:  w.pagerank,
                        score:     r.matching*0.85 + r.relevance*0.15
                    }}) as ws
                    UNWIND ws as w
                    RETURN w.name      AS name,
                           w.topic     AS topic,
                           w.pagerank  AS pagerank,
                           w.score     AS score
                    ORDER BY w.score DESC SKIP {start} LIMIT {count}"""
            )
        }

    @lru_cache(maxsize=128)
    def similar_words_en(self, wd: str, start=0, count=10):
        """查询已登录词的近义词。"""
        return {
            'word': [wd],
            **self._run_and_analyse(
                f"""MATCH (n:Word {{name: '{wd}'}})-[r:SIMILAR]->(w:Word)
                    WITH collect({{
                        name:       w.name,
                        topic:      w.topic,
                        pagerank:   w.pagerank,
                        origin:     n.name,
                        score:      r.weight
                    }}) AS ws
                    UNWIND ws AS w
                    RETURN w.name      AS name,
                           w.topic     AS topic,
                           w.pagerank  AS pagerank,
                           w.name      AS origin,
                           w.weight    AS score,
                           size(ws)    AS total
                    ORDER BY w.weight DESC SKIP {start} LIMIT {count}"""
            )
        }

    @lru_cache(maxsize=128)
    def similar_words_un(self, wd: str, start=0, count=10):
        """查询未登录词的近义词。"""
        words = self._pullwords(wd)
        return {
            'word': words,
            **self._run_and_analyse(
                f"""MATCH (n:Word)-[r:SIMILAR]->(w:Word)
                    WHERE n.name IN ['{"','".join(words)}']
                    WITH collect({{
                        name:       w.name,
                        topic:      w.topic,
                        pagerank:   w.pagerank,
                        origin:     n.name,
                        score:      r.weight * n.pagerank * w.pagerank
                    }}) AS ws
                    UNWIND ws AS w
                    RETURN w.name      AS name,
                           w.topic     AS topic,
                           w.pagerank  AS pagerank,
                           w.name      AS origin,
                           w.score     AS score,
                           size(ws)    AS total
                    ORDER BY w.score DESC SKIP {start} LIMIT {count}"""
            )
        }

    @lru_cache(maxsize=128)
    def similar_words(self, wd: str, start=0, count=10):
        """查询词的近义词。"""
        return self.similar_words_en(wd, start=start, count=count) \
            if wd in self._words else \
            self.similar_words_un(wd, start=start, count=count)

    def get_topics(self):
        data = [node['id'] for node in self._graph.nodes.match('Topic')]
        return {'total': len(data), 'data': data}

    @lru_cache(maxsize=128)
    def match_poems_en(self, wd: str, start=0, count=10):
        """根据已登陆词查询诗。"""
        return {
            'word': [wd],
            **self._run_and_analyse(
                f"""MATCH (p:Poem)-[r:CONTAIN]->(w:Word {{name:'{wd}'}})
                    WITH collect({{
                         title:      p.title,
                         author:     p.author,
                         paragraphs: p.paragraphs,
                         id:         p.id,
                         origin:     w.name,
                         pagerank:   p.pagerank,
                         score:      p.pagerank * (r.matching*0.85 + r.relevance*0.15)
                    }}) AS poems
                    UNWIND poems AS p
                    RETURN p.title      AS title,
                           p.author     AS author,
                           p.paragraphs AS paragraphs,
                           p.id         AS id,
                           p.origin     AS origin,
                           p.pagerank   AS pagerank,
                           p.score      AS score,
                           size(poems)  AS total
                    ORDER BY p.score DESC SKIP {start} LIMIT {count}"""
            )
        }

    @lru_cache(maxsize=128)
    def match_poems_un(self, wd: str, start=0, count=10):
        """根据未登录词查询诗。"""
        words = self._pullwords(wd)
        return {
            'word': words,
            **self._run_and_analyse(
                f"""CALL db.index.fulltext.queryNodes("paragraphs", "{wd}") YIELD node, score
                    WITH node, score ORDER BY score DESC LIMIT 100
                    WITH collect({{
                        title:      node.title,
                        author:     node.author,
                        paragraphs: node.paragraphs,
                        id:         node.id,
                        origin:     'fulltext',
                        score:      node.pagerank * score
                    }}) AS poems0
                    MATCH (p:Poem)-[r:CONTAIN]->(w:Word)
                    WHERE w.name IN ['{"','".join(words)}']
                    WITH poems0 + collect({{
                         title:      p.title,
                         author:     p.author,
                         paragraphs: p.paragraphs,
                         id:         p.id,
                         origin:     w.name,
                         score:      p.pagerank * (r.matching*0.85 + r.relevance*0.15)
                    }}) AS poems
                    UNWIND poems AS p
                    RETURN p.title      AS title,
                           p.author     AS author,
                           p.paragraphs AS paragraphs,
                           p.id         AS id,
                           p.origin     AS origin,
                           p.score      AS score,
                           p.pagerank   AS pagerank,
                           size(poems)  AS total
                    ORDER BY p.score DESC SKIP {start} LIMIT {count}
            """
            )
        }

    @lru_cache(maxsize=128)
    def match_poems(self, wd: str, start=0, count=10):
        """根据词查询诗。"""
        return self.match_poems_en(wd, start=start, count=count) \
            if wd in self._words else \
            self.match_poems_un(wd, start=start, count=count)

    @lru_cache(maxsize=128)
    def get_poems_by_title(self, title: str, start=0, count=10):
        """根据标题查询诗。"""
        return {
            'title': [title],
            **self._run_and_analyse(
                f"""MATCH (p:Poem {{title: '{title}'}})
                    WITH collect(p) AS ps
                    UNWIND ps AS p
                    RETURN p.title      AS title,
                           p.author     AS author,
                           p.paragraphs AS paragraphs,
                           p.id         AS id,
                           p.pagerank   AS pagerank,
                           size(ps)     AS total
                    ORDER BY p.pagerank DESC SKIP {start} LIMIT {count}"""
            )
        }

    def get_poems_by_id(self, id: str):
        """根据 id 查询诗。"""
        return {
            'id': [id],
            **self._run_and_analyse(
                f"""MATCH (p:Poem {{id: '{id}'}})
                    RETURN p.title      AS title,
                           p.author     AS author,
                           p.paragraphs AS paragraphs,
                           p.id         AS id,
                           p.pagerank   AS pagerank"""
            )
        }

    def get_poems_by_topic(self, topic: int, start=0, count=10):
        """根据主题查询诗。"""
        return {
            'topic': [topic],
            **self._run_and_analyse(
                f"""MATCH (p:Poem)-[r:RELEVANT]->(t:Topic {{id: {topic}}})
                    WITH collect({{
                        title:      p.title,
                        author:     p.author,
                        paragraphs: p.paragraphs,
                        id:         p.id,
                        pagerank:   p.pagerank,
                        relevance:  r.relevance
                    }}) AS ps
                    UNWIND ps AS p
                    RETURN p.title      AS title,
                           p.author     AS author,
                           p.paragraphs AS paragraphs,
                           p.id         AS id,
                           p.pagerank   AS pagerank,
                           p.relevance  AS relevance,
                           size(ps)     AS total
                    ORDER BY p.relevance DESC SKIP {start} LIMIT {count}"""
            )
        }

    @lru_cache(maxsize=128)
    def get_poems_by_author(self, author: str, start=0, count=10):
        """根据作者查询诗。"""
        return {
            'author': [author],
            **self._run_and_analyse(
                f"""MATCH (p:Poem {{author: '{author}'}})
                    WITH collect(p) AS ps
                    UNWIND ps AS p
                    RETURN p.title      AS title,
                           p.author     AS author,
                           p.paragraphs AS paragraphs,
                           p.id         AS id,
                           p.pagerank   AS pagerank,
                           size(ps)     AS total
                    ORDER BY p.pagerank DESC SKIP {start} LIMIT {count}"""
            )
        }

    @lru_cache(maxsize=128)
    def similar_poems(self, id: str, start=0, count=10):
        """根据 id 查询相似诗。"""
        return {
            'id': [id],
            **self._run_and_analyse(
                f"""MATCH (:Poem {{id: '{id}'}})-[:INFLUENCE]-(p:Poem)
                    WITH collect(DISTINCT p) AS ps
                    UNWIND ps AS p
                    RETURN p.title      AS title,
                           p.author     AS author,
                           p.paragraphs AS paragraphs,
                           p.id         AS id,
                           p.pagerank   AS pagerank,
                           size(ps)     AS total
                    ORDER BY p.pagerank DESC SKIP {start} LIMIT {count}"""
            )
        }

    def random_poems(self, count=10):
        """随机查询诗。"""
        return self._run_and_analyse(
            f"""MATCH (p:Poem)
                RETURN p.title      AS title,
                       p.author     AS author,
                       p.paragraphs AS paragraphs,
                       p.id         AS id,
                       p.pagerank   AS pagerank
                ORDER BY rand() LIMIT {count}"""
        )

    def get_author(self, name: str):
        """根据作者名查询作者。"""
        node = self._graph.nodes.match('Author', name=name).first()
        return {
            'name': [name],
            **self._run_and_analyse(
                f"""MATCH (a:Author {{name: '{name}'}})
                    RETURN a.name   AS name,
                           a.id     AS id,
                           a.desc   AS desc"""
            )
        }

    def random_authors(self, count=10):
        """随机查询作者。"""
        return self._run_and_analyse(
            f"""MATCH (a:Author)
                RETURN a.name   AS name,
                       a.id     AS id,
                       a.desc   AS desc
                ORDER BY rand() LIMIT {count}"""
        )
