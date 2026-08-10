const { redis } = require('../../lib/redis');
const { hashPassword, makeSalt } = require('../../lib/password');

const ORDER_KEY = 'board:order';
const CATEGORIES = ['공지사항', '상품 사용후기', '상품 Q&A', '이용안내 FAQ', '교환/반품 문의'];

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const ids = await redis.zrange(ORDER_KEY, 0, -1, { rev: true });
    if (!ids || !ids.length) return res.status(200).json({ posts: [] });

    const posts = await Promise.all(ids.map((id) => redis.hgetall(`board:post:${id}`)));
    const list = posts
      .filter(Boolean)
      .map((p) => ({
        id: p.id,
        category: p.category,
        title: p.title,
        nickname: p.nickname,
        createdAt: p.createdAt,
        views: p.views || 0,
      }));
    return res.status(200).json({ posts: list });
  }

  if (req.method === 'POST') {
    const { category, title, nickname, password, content } = req.body || {};
    if (!title || !nickname || !password || !content) {
      return res.status(400).json({ error: '제목, 작성자, 비밀번호, 내용을 모두 입력해 주세요.' });
    }
    if (String(password).length < 4) {
      return res.status(400).json({ error: '비밀번호는 4자 이상이어야 합니다.' });
    }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const salt = makeSalt();
    const createdAt = Date.now();
    const post = {
      id,
      category: CATEGORIES.includes(category) ? category : '상품 Q&A',
      title: String(title).slice(0, 200),
      nickname: String(nickname).slice(0, 40),
      content: String(content).slice(0, 5000),
      createdAt,
      views: 0,
      salt,
      passwordHash: hashPassword(password, salt),
    };

    await redis.hset(`board:post:${id}`, post);
    await redis.zadd(ORDER_KEY, { score: createdAt, member: id });

    const { salt: _s, passwordHash: _p, ...safePost } = post;
    return res.status(201).json({ post: safePost });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
};
